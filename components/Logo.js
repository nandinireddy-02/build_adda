// The Krew mark (a lime-to-cyan K on a rounded tile) and wordmark. Same shape as app/icon.svg.
export function KrewMark({ size = 40, onDark = false }) {
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" aria-hidden="true" className="shrink-0">
      <defs>
        <linearGradient id="krew-k" x1="0" y1="12" x2="0" y2="52" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#c6f432" />
          <stop offset="1" stopColor="#0be8f0" />
        </linearGradient>
      </defs>
      <rect width="64" height="64" rx="18" fill={onDark ? "#3a1a68" : "#2a0e4f"} />
      <g fill="none" stroke="url(#krew-k)" strokeWidth="9" strokeLinecap="round" strokeLinejoin="round">
        <path d="M22 16v32" />
        <path d="M44 16 31.5 32 44 48" />
      </g>
    </svg>
  );
}

export default function Logo({ onDark = false, size = "md" }) {
  return (
    <span className="flex items-center gap-2.5">
      <KrewMark size={size === "sm" ? 32 : 40} onDark={onDark} />
      <span
        className={`font-display font-extrabold tracking-tight ${size === "sm" ? "text-xl" : "text-2xl"} ${
          onDark ? "text-white" : "text-ink"
        }`}
      >
        Krew
      </span>
    </span>
  );
}
