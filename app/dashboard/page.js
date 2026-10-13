import Link from "next/link";
import PageShell from "@/components/PageShell";
import ProblemCard from "@/components/ProblemCard";
import { requireUser } from "@/lib/auth";
import { listMyInterests, listMyOpenMilestones, listMyProblems, listMyTeams } from "@/lib/queries";
import { cardClass, darkButton, pageTitle, primaryButton, sectionTitle } from "@/lib/ui";

export const metadata = { title: "Dashboard", robots: { index: false } };

function formatDate(value) {
  return new Date(value).toLocaleDateString("en-IN", { day: "numeric", month: "short" });
}

export default async function DashboardPage({ searchParams }) {
  const params = await searchParams;
  const user = await requireUser("/dashboard");
  const [teams, interests, posted, myMilestones] = await Promise.all([
    listMyTeams(user.id),
    listMyInterests(user.id),
    listMyProblems(user.id),
    listMyOpenMilestones(user.id),
  ]);

  return (
    <PageShell>
      <div className="mb-10 flex flex-wrap items-end justify-between gap-6">
        <div>
          <h1 className={pageTitle}>Hi, {user.name.split(" ")[0]}</h1>
          <p className="mt-3 text-lg text-soft">Your teams, the problems you follow, and the ones you posted.</p>
        </div>
        <Link href="/problems" className={darkButton}>
          Find a problem
        </Link>
      </div>

      {params?.deleted && (
        <p role="status" className="mb-6 rounded-2xl bg-neon px-5 py-4 font-semibold text-neon-ink">
          Problem deleted.
        </p>
      )}

      {user.skills.length === 0 && (
        <div className="slab slab-neon mb-10 flex flex-wrap items-center justify-between gap-4 rounded-[28px] bg-neon p-6 text-neon-ink">
          <p className="text-lg font-semibold">Add your skills so teams can find you in suggestions.</p>
          <Link href="/profile" className={darkButton}>
            Add skills
          </Link>
        </div>
      )}

      {myMilestones.length > 0 && (
        <section className="mb-14" aria-labelledby="todo-heading">
          <h2 id="todo-heading" className={`${sectionTitle} mb-5`}>
            Your open milestones
          </h2>
          <ul className={cardClass}>
            {myMilestones.map((m) => (
              <li key={m.id} className="flex flex-wrap items-baseline justify-between gap-3 border-b border-line py-3 first:pt-0 last:border-b-0 last:pb-0">
                <span className="text-lg">{m.title}</span>
                <span className="text-sm text-muted">
                  <Link href={`/teams/${m.team_id}`} className="font-semibold text-ink underline underline-offset-4">
                    {m.team_name}
                  </Link>
                  {m.due_date && ` · Due ${formatDate(m.due_date)}`}
                </span>
              </li>
            ))}
          </ul>
        </section>
      )}

      <section className="mb-14" aria-labelledby="teams-heading">
        <h2 id="teams-heading" className={`${sectionTitle} mb-5`}>
          Your teams
        </h2>
        {teams.length === 0 ? (
          <p className="text-lg text-soft">
            You&apos;re not on a team yet. Open a problem and start or join one.
          </p>
        ) : (
          <ul className="grid grid-cols-[repeat(auto-fit,minmax(280px,1fr))] gap-x-5 gap-y-8">
            {teams.map((team) => (
              <li key={team.id} className={`${cardClass} flex flex-col gap-3`}>
                <p className="text-sm font-semibold text-muted">{team.role === "lead" ? "You lead this team" : "Member"}</p>
                <h3 className="font-display text-2xl font-bold">
                  <Link href={`/teams/${team.id}`} className="hover:underline">
                    {team.name}
                  </Link>
                </h3>
                <p className="text-muted">{team.problem_title}</p>
                <p className="mt-auto text-sm font-medium">
                  {team.member_count} {team.member_count === 1 ? "member" : "members"} · {team.milestones_done} of{" "}
                  {team.milestone_count} milestones done
                </p>
                <Link href={`/teams/${team.id}`} className={primaryButton}>
                  Open team
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="mb-14" aria-labelledby="interests-heading">
        <h2 id="interests-heading" className={`${sectionTitle} mb-5`}>
          Problems you&apos;re interested in
        </h2>
        {interests.length === 0 ? (
          <p className="text-lg text-soft">
            None yet.{" "}
            <Link href="/problems" className="font-semibold underline underline-offset-4">
              Browse problems
            </Link>
          </p>
        ) : (
          <div className="grid grid-cols-[repeat(auto-fit,minmax(280px,1fr))] gap-x-5 gap-y-8">
            {interests.map((problem) => (
              <ProblemCard key={problem.id} problem={problem} />
            ))}
          </div>
        )}
      </section>

      <section aria-labelledby="posted-heading">
        <h2 id="posted-heading" className={`${sectionTitle} mb-5`}>
          Problems you posted
        </h2>
        {posted.length === 0 ? (
          <p className="text-lg text-soft">
            None yet.{" "}
            <Link href="/problems/new" className="font-semibold underline underline-offset-4">
              Post a problem
            </Link>
          </p>
        ) : (
          <div className="grid grid-cols-[repeat(auto-fit,minmax(280px,1fr))] gap-x-5 gap-y-8">
            {posted.map((problem) => (
              <ProblemCard key={problem.id} problem={problem} />
            ))}
          </div>
        )}
      </section>
    </PageShell>
  );
}
