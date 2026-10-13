import Link from "next/link";
import PageShell from "@/components/PageShell";
import Tilt from "@/components/Tilt";
import EmptyState from "@/components/EmptyState";
import { listShowcase } from "@/lib/queries";
import { darkButton, pageTitle } from "@/lib/ui";

export const metadata = {
  title: "Showcase",
  description: "Projects students built for real problems on Krew, including ones the problem owner confirmed worked.",
  alternates: { canonical: "/showcase" },
};

export default async function ShowcasePage() {
  const projects = await listShowcase();

  return (
    <PageShell>
      <div className="mb-10 max-w-[760px]">
        <h1 className={pageTitle}>Built for real people</h1>
        <p className="mt-3 text-lg text-soft">
          Projects teams shipped for problems on Krew. The ones marked confirmed were checked by the person who
          had the problem.
        </p>
      </div>

      {projects.length === 0 ? (
        <EmptyState
          title="The first projects are on their way"
          action={
            <Link href="/problems" className={darkButton}>
              Find a problem to solve
            </Link>
          }
        >
          Teams appear here once they add a project link.
        </EmptyState>
      ) : (
        <ul className="grid grid-cols-[repeat(auto-fit,minmax(300px,1fr))] gap-x-5 gap-y-8">
          {projects.map((p) => (
            <li key={p.id}>
              <Tilt max={7} className={`slab spotlight h-full rounded-[32px] ${p.owner_confirmed ? "slab-neon bg-neon text-neon-ink" : "bg-white"}`}>
                <article className="flex h-full flex-col gap-3 p-7 [transform-style:preserve-3d]">
                  <ul className="pop-sm flex flex-wrap gap-2" aria-label="Category and status">
                    <li className="rounded-full bg-ink px-3 py-1 text-[13px] font-medium text-white">{p.category}</li>
                    {p.owner_confirmed && (
                      <li className="rounded-full bg-white px-3 py-1 text-[13px] font-semibold text-ink">Confirmed by owner</li>
                    )}
                  </ul>
                  <h2 className="pop-md font-display text-[26px] font-bold leading-[1.15]">
                    <Link href={`/teams/${p.id}`} className="hover:underline">
                      {p.name}
                    </Link>
                  </h2>
                  <p className={p.owner_confirmed ? "" : "text-muted"}>
                    For{" "}
                    <Link href={`/problems/${p.problem_id}`} className="underline underline-offset-4">
                      {p.problem_title}
                    </Link>
                  </p>
                  {p.owner_feedback && <p className="text-lg">&ldquo;{p.owner_feedback}&rdquo;</p>}
                  <p className={`text-sm ${p.owner_confirmed ? "" : "text-muted"}`}>{p.members.join(", ")}</p>
                  {p.project_link && (
                    <a
                      href={p.project_link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn3d pop-sm mt-auto inline-flex w-fit items-center rounded-full bg-ink px-5 py-3 font-semibold text-neon"
                    >
                      View project<span className="sr-only"> by {p.name}</span>
                    </a>
                  )}
                </article>
              </Tilt>
            </li>
          ))}
        </ul>
      )}
    </PageShell>
  );
}
