import Link from "next/link";
import { notFound } from "next/navigation";
import PageShell from "@/components/PageShell";
import PersonRow from "@/components/PersonRow";
import SubmitButton from "@/components/SubmitButton";
import TeamSettingsForm from "@/components/forms/TeamSettingsForm";
import MilestoneForm from "@/components/forms/MilestoneForm";
import EndorseForm from "@/components/forms/EndorseForm";
import { getCurrentUser } from "@/lib/auth";
import { assignMilestone, deleteMilestone, joinTeam, leaveTeam, toggleMilestone } from "@/app/actions/teams";
import {
  getTeam,
  listMilestones,
  listTeamEndorsements,
  listTeamMembers,
  teamContributions,
} from "@/lib/queries";
import { cardClass, inputClass, pageTitle, primaryButton, quietButton, sectionTitle } from "@/lib/ui";

function formatDate(value) {
  if (!value) return "";
  return new Date(value).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
}

async function load(rawId) {
  if (!/^\d+$/.test(rawId)) return null;
  return getTeam(Number(rawId));
}

export async function generateMetadata({ params }) {
  const { id } = await params;
  const team = await load(id);
  if (!team) return { title: "Team not found" };
  const description = `${team.name} is working on "${team.problem_title}" on Krew.`;
  return {
    title: `${team.name} · ${team.problem_title}`,
    description,
    alternates: { canonical: `/teams/${team.id}` },
    openGraph: { title: team.name, description, url: `/teams/${team.id}` },
  };
}

export default async function TeamPage({ params, searchParams }) {
  const { id: rawId } = await params;
  const query = await searchParams;
  const team = await load(rawId);
  if (!team) notFound();
  const id = team.id;

  const user = await getCurrentUser();
  const [members, milestones, contributions, endorsements] = await Promise.all([
    listTeamMembers(id),
    listMilestones(id),
    teamContributions(id),
    listTeamEndorsements(id),
  ]);
  const isMember = Boolean(user && members.some((m) => m.id === user.id));
  const done = milestones.filter((m) => m.done).length;
  const progress = milestones.length ? Math.round((done / milestones.length) * 100) : 0;
  const teammates = isMember ? members.filter((m) => m.id !== user.id) : [];

  return (
    <PageShell>
      <Link href={`/problems/${team.problem_id}`} className="mb-6 inline-block py-2 font-medium underline underline-offset-4">
        Problem: {team.problem_title}
      </Link>

      {query?.created && (
        <p role="status" className="mb-6 rounded-2xl bg-neon px-5 py-4 font-semibold text-neon-ink">
          Team created. Add your first milestones and give each one an owner.
        </p>
      )}

      {team.owner_confirmed && (
        <div className="slab slab-neon mb-8 rounded-[28px] bg-neon p-6 text-neon-ink">
          <p className="font-display text-2xl font-bold">Solution confirmed by {team.problem_owner_name}</p>
          {team.owner_feedback && <p className="mt-2 text-lg">&ldquo;{team.owner_feedback}&rdquo;</p>}
        </div>
      )}

      <div className="mb-10 flex flex-wrap items-end justify-between gap-6">
        <div>
          <h1 className={pageTitle}>{team.name}</h1>
          {team.needs && !team.owner_confirmed && (
            <p className="mt-4 inline-block rounded-full bg-neon px-4 py-1.5 font-semibold text-neon-ink">
              Looking for: {team.needs}
            </p>
          )}
        </div>
        {team.project_link && (
          <a href={team.project_link} target="_blank" rel="noopener noreferrer" className={quietButton}>
            View project
          </a>
        )}
      </div>

      <div className="flex flex-wrap gap-10">
        <div className="flex min-w-0 flex-[2_1_520px] flex-col gap-10">
          <section className={cardClass} aria-labelledby="milestones-heading">
            <div className="mb-4 flex flex-wrap items-baseline justify-between gap-3">
              <h2 id="milestones-heading" className={sectionTitle}>
                Milestones
              </h2>
              {milestones.length > 0 && (
                <p className="font-semibold text-muted">
                  {done} of {milestones.length} done
                </p>
              )}
            </div>

            {milestones.length > 0 && (
              <div
                className="mb-6 h-4 overflow-hidden rounded-full bg-lilac"
                role="progressbar"
                aria-label="Milestones done"
                aria-valuenow={progress}
                aria-valuemin={0}
                aria-valuemax={100}
              >
                <div className="h-full rounded-full bg-neon" style={{ width: `${progress}%` }} />
              </div>
            )}

            {milestones.length === 0 ? (
              <p className="mb-6 text-muted">No milestones yet.</p>
            ) : (
              <ul className="mb-6">
                {milestones.map((m) => (
                  <li key={m.id} className="flex flex-wrap items-start gap-3 border-b border-line py-4 last:border-b-0">
                    {isMember ? (
                      <form action={toggleMilestone.bind(null, id, m.id)}>
                        <button
                          type="submit"
                          aria-label={m.done ? `Mark "${m.title}" as not done` : `Mark "${m.title}" as done`}
                          aria-pressed={m.done}
                          className={`flex h-9 w-9 cursor-pointer items-center justify-center rounded-xl border-2 border-ink ${
                            m.done ? "bg-ink text-neon" : "bg-white"
                          }`}
                        >
                          {m.done && (
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                              strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                              <path d="M5 12l5 5L20 7" />
                            </svg>
                          )}
                        </button>
                      </form>
                    ) : (
                      <span className="mt-1 text-sm font-semibold text-muted">{m.done ? "Done" : "To do"}</span>
                    )}

                    <div className="min-w-0 flex-1">
                      <p className={`text-lg ${m.done ? "text-muted line-through" : ""}`}>{m.title}</p>
                      <p className="text-sm text-muted">
                        {m.done && m.completed_by_name
                          ? `Done by ${m.completed_by_name} on ${formatDate(m.completed_at)}`
                          : m.owner_name
                            ? `Owner: ${m.owner_name}`
                            : "No owner yet"}
                        {m.due_date && !m.done && ` · Due ${formatDate(m.due_date)}`}
                      </p>
                    </div>

                    {isMember && !m.done && (
                      <form action={assignMilestone.bind(null, id, m.id)} className="flex items-center gap-2">
                        <label htmlFor={`assign-${m.id}`} className="sr-only">
                          Owner for {m.title}
                        </label>
                        <select id={`assign-${m.id}`} name="assigned_to" defaultValue={m.assigned_to ?? ""}
                          className={`${inputClass} min-h-10 w-auto py-1.5 text-sm`}>
                          <option value="">No owner</option>
                          {members.map((p) => (
                            <option key={p.id} value={p.id}>
                              {p.name}
                            </option>
                          ))}
                        </select>
                        <button type="submit" className="cursor-pointer rounded-full px-3 py-2 text-sm font-semibold underline underline-offset-4">
                          Assign
                        </button>
                      </form>
                    )}
                    {isMember && (
                      <form action={deleteMilestone.bind(null, id, m.id)}>
                        <button type="submit" className="cursor-pointer rounded-full px-3 py-2 text-sm font-medium text-muted underline underline-offset-4 hover:text-ink">
                          Remove<span className="sr-only"> {m.title}</span>
                        </button>
                      </form>
                    )}
                  </li>
                ))}
              </ul>
            )}

            {isMember && <MilestoneForm teamId={id} members={members} currentUserId={user.id} />}
          </section>

          <section className={cardClass} aria-labelledby="contrib-heading">
            <h2 id="contrib-heading" className={`${sectionTitle} mb-2`}>
              Who&apos;s doing what
            </h2>
            <p className="mb-5 text-muted">Counted from milestones: who owns them and who ticked them off.</p>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[420px] text-left">
                <thead>
                  <tr className="border-b-2 border-line text-sm text-muted">
                    <th scope="col" className="py-2 pr-4 font-semibold">Member</th>
                    <th scope="col" className="py-2 pr-4 font-semibold">Owns</th>
                    <th scope="col" className="py-2 pr-4 font-semibold">Own ones done</th>
                    <th scope="col" className="py-2 font-semibold">Ticked off</th>
                  </tr>
                </thead>
                <tbody>
                  {contributions.map((c) => (
                    <tr key={c.id} className="border-b border-line last:border-b-0">
                      <th scope="row" className="py-3 pr-4 font-semibold">
                        <Link href={`/people/${c.id}`} className="hover:underline">
                          {c.name}
                        </Link>
                      </th>
                      <td className="py-3 pr-4">{c.owned}</td>
                      <td className="py-3 pr-4">{c.owned_done}</td>
                      <td className="py-3">{c.completed}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          {(endorsements.length > 0 || teammates.length > 0) && (
            <section className={cardClass} aria-labelledby="endorse-heading">
              <h2 id="endorse-heading" className={`${sectionTitle} mb-2`}>
                Endorsements
              </h2>
              <p className="mb-5 text-muted">Teammates vouching for each other. These show on each person&apos;s profile.</p>
              {endorsements.length > 0 && (
                <ul className="mb-6">
                  {endorsements.map((e) => (
                    <li key={e.id} className="border-b border-line py-3 last:border-b-0">
                      <p className="text-lg">&ldquo;{e.note}&rdquo;</p>
                      <p className="text-sm text-muted">
                        {e.from_name} about {e.to_name}
                      </p>
                    </li>
                  ))}
                </ul>
              )}
              {teammates.length > 0 && <EndorseForm teamId={id} teammates={teammates} />}
            </section>
          )}

          {isMember && (
            <section className={cardClass} aria-labelledby="settings-heading">
              <h2 id="settings-heading" className={`${sectionTitle} mb-4`}>
                Team details
              </h2>
              <TeamSettingsForm team={team} />
            </section>
          )}
        </div>

        <aside className="flex min-w-0 flex-[1_1_320px] flex-col gap-6">
          <section className={cardClass} aria-labelledby="members-heading">
            <h2 id="members-heading" className="mb-2 font-display text-xl font-bold">
              Members ({members.length})
            </h2>
            <ul>
              {members.map((person) => (
                <PersonRow
                  key={person.id}
                  person={person}
                  extra={[person.role === "lead" ? "Lead" : null, user?.id === person.id ? "(you)" : null]
                    .filter(Boolean)
                    .join(" ")}
                />
              ))}
            </ul>
          </section>

          {user && !isMember && !team.owner_confirmed && (
            <form action={joinTeam.bind(null, id)}>
              <SubmitButton pendingText="Joining…" className={`${primaryButton} w-full text-lg`}>
                Join this team
              </SubmitButton>
            </form>
          )}
          {!user && (
            <Link href={`/login?next=/teams/${id}`} className={`${primaryButton} w-full text-lg`}>
              Log in to join
            </Link>
          )}
          {isMember && (
            <form action={leaveTeam.bind(null, id)}>
              <SubmitButton pendingText="Leaving…" className={`${quietButton} w-full`}>
                Leave team
              </SubmitButton>
            </form>
          )}
        </aside>
      </div>
    </PageShell>
  );
}
