param(
  [ValidateRange(2, 300)]
  [int]$DebounceSeconds = 10,
  [string]$Branch = "main"
)

$ErrorActionPreference = "Stop"
$repoRoot = (Resolve-Path (Join-Path $PSScriptRoot "..")).Path
$gitDirectory = Join-Path $repoRoot ".git"
$logPath = Join-Path $gitDirectory "auto-push.log"
$pidPath = Join-Path $gitDirectory "auto-push.pid"
$mutex = [Threading.Mutex]::new($false, "Local\BuildAddaAutoPush", [ref]$createdNew)

function Write-Log([string]$Message) {
  $line = "{0} {1}" -f (Get-Date -Format "yyyy-MM-dd HH:mm:ss"), $Message
  Add-Content -LiteralPath $logPath -Value $line
  Write-Host $line
}

if (-not $createdNew) {
  Write-Host "The Build Adda auto-push watcher is already running."
  exit 0
}

Set-Location $repoRoot

try {
  $currentBranch = (& git branch --show-current).Trim()
  if ($LASTEXITCODE -ne 0 -or $currentBranch -ne $Branch) {
    throw "Auto-push requires the '$Branch' branch; current branch is '$currentBranch'."
  }

  Set-Content -LiteralPath $pidPath -Value $PID

  $watcher = [IO.FileSystemWatcher]::new($repoRoot)
  $watcher.IncludeSubdirectories = $true
  $watcher.NotifyFilter = [IO.NotifyFilters]'FileName, DirectoryName, LastWrite, Size'
  $watcher.EnableRaisingEvents = $true

  $sourceIds = @(
    "BuildAdda.Created",
    "BuildAdda.Changed",
    "BuildAdda.Deleted",
    "BuildAdda.Renamed"
  )

  Register-ObjectEvent $watcher Created -SourceIdentifier $sourceIds[0] | Out-Null
  Register-ObjectEvent $watcher Changed -SourceIdentifier $sourceIds[1] | Out-Null
  Register-ObjectEvent $watcher Deleted -SourceIdentifier $sourceIds[2] | Out-Null
  Register-ObjectEvent $watcher Renamed -SourceIdentifier $sourceIds[3] | Out-Null

  Write-Log "Watching '$repoRoot' and pushing changes to origin/$Branch after ${DebounceSeconds}s of inactivity."

  $pending = $false
  $lastChange = Get-Date

  while ($true) {
    $event = Wait-Event -Timeout 1
    if ($null -ne $event) {
      $relativePath = [IO.Path]::GetRelativePath($repoRoot, $event.SourceEventArgs.FullPath)
      Remove-Event -EventIdentifier $event.EventIdentifier

      $topLevel = ($relativePath -split '[\\/]')[0]
      if ($topLevel -notin @('.git', 'node_modules', '.next', 'out')) {
        $pending = $true
        $lastChange = Get-Date
      }
    }

    if (-not $pending -or ((Get-Date) - $lastChange).TotalSeconds -lt $DebounceSeconds) {
      continue
    }

    $pending = $false
    $changes = & git status --porcelain --untracked-files=all
    if ($LASTEXITCODE -ne 0 -or -not $changes) {
      continue
    }

    Write-Log "Saving detected changes."
    & git add --all
    if ($LASTEXITCODE -ne 0) {
      Write-Log "git add failed; changes remain local."
      continue
    }

    & git diff --cached --quiet
    if ($LASTEXITCODE -eq 0) {
      continue
    }

    $commitMessage = "Auto-save: {0}" -f (Get-Date -Format "yyyy-MM-dd HH:mm:ss zzz")
    & git commit -m $commitMessage
    if ($LASTEXITCODE -ne 0) {
      Write-Log "git commit failed; staged changes remain local."
      continue
    }

    & git push origin $Branch
    if ($LASTEXITCODE -eq 0) {
      Write-Log "Pushed '$commitMessage' to origin/$Branch."
    } else {
      Write-Log "Push failed; the commit remains local and will need a later push."
    }
  }
} catch {
  Write-Log "Watcher stopped: $($_.Exception.Message)"
  throw
} finally {
  Get-EventSubscriber | Where-Object SourceIdentifier -Like "BuildAdda.*" | Unregister-Event
  if ($null -ne $watcher) {
    $watcher.Dispose()
  }
  Remove-Item -LiteralPath $pidPath -Force -ErrorAction SilentlyContinue
  $mutex.ReleaseMutex()
  $mutex.Dispose()
}
