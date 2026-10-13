import Link from "next/link";
import { notFound } from "next/navigation";
import PageShell from "@/components/PageShell";
import PersonRow from "@/components/PersonRow";
import SubmitButton from "@/components/SubmitButton";
import CreateTeamForm from "@/components/forms/CreateTeamForm";
import SolvedForm from "@/components/forms/SolvedForm";
import { getCurrentUser } from "@/lib/auth";
import { deleteProblem, toggleInterest } from "@/app/actions/problems";
import { joinTeam } from "@/app/actions/teams";
import {
  getProblem,
  isInterested,
  listInterested,
  listTeamsForProblem,
  suggestTeammates,
} from "@/lib/queries";
import { cardClass, darkButton, pageTitle, primaryButton, quietButton, sectionTitle, tagClass } from "@/lib/ui";

async function load(rawId) {
  if (!/^\d+$/.test(rawId)) return null;
  return getProblem(Number(rawId));
}

export async function generateMetadata({ params }) {
  const { id } = await params;
  const problem = await load(id);
  if (!problem) return { title: "Problem not found" };
  const description = `${problem.what_happens_today} Who has it: ${problem.who_has_it}.`.slice(0, 160);
  return {
    title: problem.title,
    description,
    alternates: { canonical: `/problems/${problem.id}` },
    openGraph: { title: problem.title, description, url: `/problems/${problem.id}`, type: "article" },
  };
}

export default async function ProblemPage({ params, searchParams }) {
  const { id: rawId } = await params;
  const query = await searchParams;
  const problem = await load(rawId);
  if (!problem) notFound();
  const id = problem.id;

  const user = await getCurrentUser();
  const isOwner = user?.id === problem.posted_by;
  const solved = problem.status === "solved";
  const [interested, teams, meInterested, suggestions] = await Promise.all([
    listInterested(id),
    listTeamsForProblem(id),
    isInterested(id, user?.id),
    suggestTeammates(id, problem.skills, user?.id),
  ]);
  const myTeam = user ? teams.find((t) => t.members.some((m) => m.id === user.id)) : null;

  return (
    <PageShell>
      <Link href="/problems" className="mb-6 inline-block py-2 font-medium underline underline-offset-4">
        All problems
      </Link>

      {query?.posted && (
        <p role="status" className="mb-6 rounded-2xl bg-neon px-5 py-4 font-semibold text-neon-ink">
          Your problem is live. Students can now show interest and form teams.
        </p>
      )}
      {query?.updated && (
        <p role="status" className="mb-6 rounded-2xl bg-neon px-5 py-4 font-semibold text-neon-ink">
          Changes saved.
        </p>
      )}

      <div className="flex flex-wrap gap-10">
        <article className="min-w-0 flex-[2_1_520px]">
          <ul className="mb-4 flex flex-wrap gap-2" aria-label="Category and status">
            <li className="rounded-full bg-ink px-3 py-1 text-[13px] font-medium text-white">{problem.category}</li>
            {problem.status !== "open" && (
              <li className="rounded-full bg-tangerine px-3 py-1 text-[13px] font-semibold text-tangerine-ink">
                {solved ? "Solved" : "Team working on it"}
              </li>
            )}
          </ul>
          <h1 className={pageTitle}>{problem.title}</h1>
          <p className="mt-3 text-muted">
            Posted by{" "}
            {["BuildAdda team", "Krew team"].includes(problem.poster_name) ? (
              "the Krew team"
            ) : (
              <Link href={`/people/${problem.posted_by}`} className="underline underline-offset-4">
                {problem.poster_name}
              </Link>
            )}
            {problem.poster_college && !["BuildAdda", "Krew"].includes(problem.poster_college) && ` · ${problem.poster_college}`}
          </p>

          <div className={`${cardClass} mt-8 flex flex-col gap-6`}>
            <section>
              <h2 className="mb-1 font-display text-xl font-bold">Who has this problem</h2>
              <p className="text-lg">{problem.who_has_it}</p>
            </section>
            <section>
              <h2 className="mb-1 font-display text-xl font-bold">What happens today</h2>
              <p className="text-lg">{problem.what_happens_today}</p>
            </section>
            <section>
              <h2 className="mb-1 font-display text-xl font-bold">What solved looks like</h2>
              <p className="text-lg">{problem.what_solved_looks_like}</p>
            </section>
            {problem.skills.length > 0 && (
              <section>
                <h2 className="mb-2 font-display text-xl font-bold">Skills this needs</h2>
                <ul className="flex flex-wrap gap-2">
                  {problem.skills.map((s) => (
                    <li key={s} className={tagClass}>
                      {s}
                    </li>
                  ))}
                </ul>
              </section>
            )}
            {problem.owner_contact && (
              <section>
                <h2 className="mb-1 font-display text-xl font-bold">Contact for feedback</h2>
                <p className="text-lg">{user ? problem.owner_contact : "Log in to see the contact."}</p>
              </section>
            )}
          </div>

          {isOwner && (
            <section className={`${cardClass} mt-8`} aria-labelledby="owner-heading">
              <h2 id="owner-heading" className={`${sectionTitle} mb-2`}>
                You posted this problem
              </h2>
              <p className="mb-5 text-muted">Keep it accurate, and confirm when a team&apos;s solution works for you.</p>
              <div className="mb-6 flex flex-wrap gap-3">
                <Link href={`/problems/${id}/edit`} className={quietButton}>
                  Edit problem
                </Link>
              </div>

              {!solved && teams.length > 0 && (
                <div className="mb-6 border-t border-line pt-6">
                  <SolvedForm problemId={id} teams={teams} />
                </div>
              )}
              {solved && (
                <p className="mb-6 rounded-2xl bg-lilac px-4 py-3 font-medium">
                  You confirmed this problem is solved. Thanks for closing the loop.
                </p>
              )}

              <form action={deleteProblem.bind(null, id)} className="flex flex-wrap items-center gap-4 border-t border-line pt-6">
                <label className="flex cursor-pointer items-center gap-2 font-medium">
                  <input type="checkbox" name="confirm" value="yes" required className="h-5 w-5 accent-[#2a0e4f]" />
                  Yes, delete this problem and its teams
                </label>
                <SubmitButton pendingText="Deleting…" className={quietButton}>
                  Delete problem
                </SubmitButton>
                {query?.delete === "confirm" && (
                  <p role="alert" className="w-full text-sm font-medium text-[#a34400]">
                    Tick the box to confirm you want to delete it.
                  </p>
                )}
              </form>
            </section>
          )}

          <section className="mt-12" aria-labelledby="teams-heading">
            <h2 id="teams-heading" className={`${sectionTitle} mb-5`}>
              Teams on this problem
            </h2>
            {teams.length === 0 ? (
              <p className="text-lg text-soft">No team yet.{user && !solved && " Start one below."}</p>
            ) : (
              <ul className="flex flex-col gap-6">
                {teams.map((team) => {
                  const isMine = myTeam?.id === team.id;
                  const isSolver = problem.solved_team_id === team.id;
                  return (
                    <li key={team.id} className={`${cardClass} flex flex-wrap items-center justify-between gap-4`}>
                      <div className="min-w-0">
                        {isSolver && (
                          <p className="mb-2 inline-block rounded-full bg-tangerine px-3 py-1 text-sm font-semibold text-tangerine-ink">
                            Solution confirmed by the owner
                          </p>
                        )}
                        <h3 className="font-display text-2xl font-bold">
                          <Link href={`/teams/${team.id}`} className="hover:underline">
                            {team.name}
                          </Link>
                        </h3>
                        <p className="text-muted">{team.members.map((m) => m.name).join(", ")}</p>
                        {team.needs && !solved && (
                          <p className="mt-2 inline-block rounded-full bg-neon px-3 py-1 text-sm font-semibold text-neon-ink">
                            Looking for: {team.needs}
                          </p>
                        )}
                      </div>
                      {isMine ? (
                        <Link href={`/teams/${team.id}`} className={darkButton}>
                          Open your team
                        </Link>
                      ) : user && !myTeam && !solved ? (
                        <form action={joinTeam.bind(null, team.id)}>
                          <SubmitButton pendingText="Joining…" className={quietButton}>
                            Join this team
                          </SubmitButton>
                        </form>
                      ) : (
                        <Link href={`/teams/${team.id}`} className={quietButton}>
                          View team
                        </Link>
                      )}
                    </li>
                  );
                })}
              </ul>
            )}

            {user && !myTeam && !solved && (
              <div className={`${cardClass} mt-8`}>
                <h3 className="mb-4 font-display text-xl font-bold">Start a new team</h3>
                <CreateTeamForm problemId={id} />
              </div>
            )}
          </section>
        </article>

        <aside className="flex min-w-0 flex-[1_1_320px] flex-col gap-8">
          <div className="slab slab-ink rounded-[28px] bg-ink p-6 text-white md:p-8">
            <p className="font-display text-5xl font-extrabold text-neon">{interested.length}</p>
            <p className="mb-5 text-mist">{interested.length === 1 ? "person is" : "people are"} interested</p>
            {solved ? (
              <p className="font-medium text-mist">This problem is solved.</p>
            ) : user ? (
              <form action={toggleInterest.bind(null, id)}>
                <SubmitButton
                  pendingText="Saving…"
                  className={meInterested ? `${quietButton} w-full` : `${primaryButton} w-full text-lg`}
                >
                  {meInterested ? "Remove my interest" : "I'm interested"}
                </SubmitButton>
              </form>
            ) : (
              <Link href={`/login?next=/problems/${id}`} className={`${primaryButton} w-full text-lg`}>
                Log in to show interest
              </Link>
            )}
          </div>

          <section className={cardClass} aria-labelledby="interested-heading">
            <h2 id="interested-heading" className="mb-2 font-display text-xl font-bold">
              Who&apos;s interested
            </h2>
            {interested.length === 0 ? (
              <p className="text-muted">Nobody yet.</p>
            ) : (
              <ul>
                {interested.map((person) => (
                  <PersonRow
                    key={person.id}
                    person={person}
                    highlight={problem.skills}
                    extra={user?.id === person.id ? "(you)" : null}
                  />
                ))}
              </ul>
            )}
          </section>

          {suggestions.length > 0 && !solved && (
            <section className={cardClass} aria-labelledby="suggested-heading">
              <h2 id="suggested-heading" className="font-display text-xl font-bold">
                Suggested teammates
              </h2>
              <p className="mb-2 text-sm text-muted">People whose skills match what this problem needs.</p>
              <ul>
                {suggestions.map((person) => (
                  <PersonRow key={person.id} person={person} highlight={problem.skills} />
                ))}
              </ul>
            </section>
          )}
        </aside>
      </div>
    </PageShell>
  );
}
