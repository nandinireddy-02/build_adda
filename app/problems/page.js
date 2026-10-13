import Link from "next/link";
import PageShell from "@/components/PageShell";
import ProblemCard from "@/components/ProblemCard";
import EmptyState from "@/components/EmptyState";
import Reveal from "@/components/Reveal";
import { listProblems } from "@/lib/queries";
import { CATEGORIES } from "@/lib/content";
import { darkButton, inputClass, pageTitle } from "@/lib/ui";

export const metadata = {
  title: "Problems",
  description: "Real problems from students, college departments, NGOs, and local businesses, waiting for a team to solve them.",
  alternates: { canonical: "/problems" },
};

export default async function ProblemsPage({ searchParams }) {
  const params = await searchParams;
  const search = typeof params?.q === "string" ? params.q.trim().slice(0, 80) : "";
  const category = CATEGORIES.includes(params?.category) ? params.category : "";
  const problems = await listProblems({ search, category });

  return (
    <PageShell>
      <div className="mb-10 flex flex-wrap items-end justify-between gap-6">
        <div>
          <h1 className={pageTitle}>Problems waiting for a team</h1>
          <p className="mt-3 text-lg text-soft">
            {problems.length} {problems.length === 1 ? "problem" : "problems"}
            {category && ` in ${category}`}
            {search && ` matching "${search}"`}
          </p>
        </div>
        <Link href="/problems/new" className={darkButton}>
          Post a problem
        </Link>
      </div>

      <form method="get" className="mb-6 flex flex-wrap gap-3" role="search">
        <label htmlFor="q" className="sr-only">
          Search problems
        </label>
        <input
          id="q"
          name="q"
          type="search"
          defaultValue={search}
          placeholder="Search problems"
          className={`${inputClass} min-w-0 flex-[1_1_260px]`}
        />
        {category && <input type="hidden" name="category" value={category} />}
        <button type="submit" className={darkButton}>
          Search
        </button>
      </form>

      <nav aria-label="Filter by category" className="mb-10 flex flex-wrap gap-2">
        <CategoryLink label="All" href={search ? `/problems?q=${encodeURIComponent(search)}` : "/problems"} active={!category} />
        {CATEGORIES.map((c) => {
          const qs = new URLSearchParams({ ...(search && { q: search }), category: c });
          return <CategoryLink key={c} label={c} href={`/problems?${qs}`} active={category === c} />;
        })}
      </nav>

      {problems.length === 0 ? (
        <EmptyState
          title="Nothing matches that yet"
          action={
            <Link href="/problems/new" className={darkButton}>
              Post one yourself
            </Link>
          }
        >
          Try another word or category, or post the problem you had in mind.
        </EmptyState>
      ) : (
        <div className="grid grid-cols-[repeat(auto-fit,minmax(280px,1fr))] gap-x-5 gap-y-8">
          {problems.map((problem, index) => (
            <Reveal key={problem.id} delay={Math.min(index, 5) * 70}>
              <ProblemCard problem={problem} />
            </Reveal>
          ))}
        </div>
      )}
    </PageShell>
  );
}

function CategoryLink({ label, href, active }) {
  return (
    <Link
      href={href}
      aria-current={active ? "page" : undefined}
      className={`rounded-full px-4 py-2.5 font-medium transition-colors ${
        active ? "bg-ink text-neon" : "bg-white text-ink hover:bg-white/70"
      }`}
    >
      {label}
    </Link>
  );
}
