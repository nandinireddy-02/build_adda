import Link from "next/link";
import ArrowIcon from "./ArrowIcon";

export default function JoinBanner() {
  return (
    <div id="join" className="mx-auto max-w-[1240px] scroll-mt-6 px-5 pb-24 md:px-10">
      <div className="flex flex-wrap items-center justify-between gap-7 slab slab-neon rounded-[40px] bg-neon p-[clamp(32px,6vw,72px)] text-neon-ink">
        <h2 className="min-w-0 flex-[1_1_480px] font-display text-[clamp(36px,6vw,80px)] font-extrabold leading-[0.95] tracking-[-0.035em]">
          Your next project starts with your krew.
        </h2>
        <Link
          href="/signup"
          className="btn3d inline-flex items-center gap-2.5 rounded-full bg-ink px-8 py-5 text-xl font-semibold text-white"
        >
          Join with college email
          <ArrowIcon />
        </Link>
      </div>
    </div>
  );
}
