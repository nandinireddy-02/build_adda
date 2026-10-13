import Link from "next/link";
import ArrowIcon from "./ArrowIcon";
import KrewScene from "./KrewScene";
import Reveal from "./Reveal";

export default function Hero() {
  return (
    <section
      id="top"
      className="mx-auto flex max-w-[1240px] flex-wrap items-center gap-12 px-5 pb-20 pt-8 md:px-10"
    >
      <div className="min-w-0 flex-[1_1_520px]">
        <Reveal>
          <p className="mb-6 inline-flex -rotate-2 items-center gap-2 rounded-full bg-white px-4 py-2 text-sm font-semibold shadow-[0_4px_0_#cdb8f5]">
            <span className="h-2 w-2 rounded-full bg-[#0be8f0]" aria-hidden="true" />
            For students who want to build something real
          </p>
        </Reveal>

        <Reveal delay={80}>
          <h1 className="font-display text-[clamp(42px,6.4vw,84px)] font-extrabold leading-[0.98] tracking-[-0.035em]">
            <span className="sm:whitespace-nowrap">Find your krew.</span>
            <br />
            <span className="sm:whitespace-nowrap">
              Fix something{" "}
              <span className="inline-block -rotate-2 rounded-[0.18em] bg-neon px-[0.14em] shadow-[0_0.1em_0_#86c81e]">
                real
              </span>
              .
            </span>
          </h1>
        </Reveal>

        <Reveal delay={160}>
          <p className="mb-8 mt-8 max-w-[520px] text-[21px] text-soft">
            Pick a problem someone actually has, team up with the skills you are missing, and ship a project people
            really use.
          </p>
        </Reveal>

        <Reveal delay={240} className="flex flex-wrap gap-4">
          <Link
            href="/problems"
            className="btn3d inline-flex items-center gap-2.5 rounded-full bg-ink px-7 py-[18px] text-lg font-semibold text-neon"
          >
            Explore problems
            <ArrowIcon />
          </Link>
          <Link
            href="/problems/new"
            className="btn3d btn3d-light inline-flex items-center rounded-full border-2 border-ink bg-white px-7 py-4 text-lg font-semibold text-ink"
          >
            Post a problem
          </Link>
        </Reveal>
      </div>

      {/* 3D scene with two floating cards on top of it. */}
      <div className="relative min-w-0 flex-[1_1_420px]" aria-hidden="true">
        <div className="relative h-[360px] sm:h-[520px]">
          <div className="scene-glow absolute inset-0" />
          <KrewScene className="absolute inset-0" />

          <div className="slab bob absolute right-0 top-2 hidden max-w-[300px] rotate-[3deg] rounded-[24px] bg-white p-5 sm:block">
            <div className="mb-2 flex items-center justify-between gap-3">
              <span className="rounded-full bg-tangerine px-3 py-1 text-[13px] font-semibold text-tangerine-ink">New</span>
              <span className="text-sm text-muted">6 interested</span>
            </div>
            <p className="font-display text-xl font-bold leading-[1.15]">Reduce food waste in college hostels</p>
          </div>

          <div className="slab slab-ink bob-slow absolute bottom-4 left-0 hidden max-w-[280px] -rotate-3 rounded-[24px] bg-ink p-5 text-white sm:block">
            <p className="mb-1 text-sm text-mist">Team forming</p>
            <p className="mb-3 font-display text-xl font-bold leading-[1.15]">Smart campus transport</p>
            <span className="inline-block rounded-full bg-neon px-3 py-1 text-sm font-semibold text-neon-ink">
              Need 1 UI designer
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
