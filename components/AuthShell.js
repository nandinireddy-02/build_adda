import Link from "next/link";
import Logo from "./Logo";
import KrewScene from "./KrewScene";

// Two-panel layout for the login and sign-up pages.
export default function AuthShell({ title, subtitle, children, footer }) {
  return (
    <div className="flex min-h-screen flex-wrap">
      <aside className="relative flex min-w-0 flex-[1_1_420px] flex-col justify-between gap-12 overflow-hidden bg-ink p-8 text-white md:p-14">
        <Link href="/" aria-label="Krew home" className="w-fit">
          <Logo onDark />
        </Link>

        <div className="relative mx-auto hidden h-[380px] w-full max-w-[460px] md:block" aria-hidden="true">
          <div className="scene-glow absolute inset-0 opacity-70" />
          <KrewScene variant="dark" className="absolute inset-0" />
          <div className="slab slab-neon bob absolute bottom-2 left-0 max-w-[300px] -rotate-2 rounded-[24px] bg-neon p-5 text-neon-ink">
            <p className="font-display text-xl font-bold leading-tight">Find your krew. Fix something real.</p>
          </div>
        </div>

        <p className="max-w-[380px] text-lg text-mist">
          Pick a problem someone actually has, find the teammates you are missing, and ship a project worth
          showing.
        </p>
      </aside>

      <main id="main" className="flex min-w-0 flex-[1_1_480px] items-center justify-center bg-lilac px-5 py-14 md:px-10">
        <div className="w-full max-w-[460px]">
          <h1 className="font-display text-[clamp(36px,5vw,52px)] font-extrabold leading-none tracking-[-0.03em]">
            {title}
          </h1>
          {subtitle && <p className="mb-8 mt-3 text-lg text-soft">{subtitle}</p>}
          <div className="slab rounded-[28px] bg-white p-6 md:p-8">{children}</div>
          {footer && <p className="mt-8 text-center text-muted">{footer}</p>}
        </div>
      </main>
    </div>
  );
}
