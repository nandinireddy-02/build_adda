import Link from "next/link";
import { listProblems } from "@/lib/queries";
import ProblemCard from "./ProblemCard";
import Reveal from "./Reveal";
import EmptyState from "./EmptyState";

// The three newest problems, shown on the home page.
export default async function ProblemFeed() {
  const problems = await listProblems({ limit: 3 });

  return (
    <section id="problems" className="mx-auto max-w-[1240px] px-5 pb-[104px] md:px-10">
      <Reveal className="mb-8 flex flex-wrap items-end justify-between gap-5">
        <h2 className="font-display text-[clamp(36px,5vw,64px)] font-extrabold leading-none tracking-[-0.03em]">
          Problems waiting for a team
        </h2>
        <Link href="/problems" className="py-3 text-lg font-semibold underline underline-offset-4">
          See all problems
        </Link>
      </Reveal>

      {problems.length === 0 ? (
        <EmptyState
          title="No problems yet"
          action={
            <Link href="/problems/new" className="btn3d inline-flex rounded-full bg-ink px-6 py-3 font-semibold text-neon">
              Post the first one
            </Link>
          }
        >
          Know someone with a problem worth solving? Post it and let teams find it.
        </EmptyState>
      ) : (
        <div className="grid grid-cols-[repeat(auto-fit,minmax(280px,1fr))] gap-x-5 gap-y-8">
          {problems.map((problem, index) => (
            <Reveal key={problem.id} delay={index * 90}>
              <ProblemCard problem={problem} />
            </Reveal>
          ))}
        </div>
      )}
    </section>
  );
}
