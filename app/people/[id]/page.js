import Link from "next/link";
import { notFound } from "next/navigation";
import PageShell from "@/components/PageShell";
import { getCurrentUser } from "@/lib/auth";
import { getPerson, listEndorsementsFor, listPersonTeams } from "@/lib/queries";
import { cardClass, pageTitle, quietButton, sectionTitle, tagClass } from "@/lib/ui";

async function load(rawId) {
  if (!/^\d+$/.test(rawId)) return null;
  return getPerson(Number(rawId));
}

export async function generateMetadata({ params }) {
  const { id } = await params;
  const person = await load(id);
  if (!person) return { title: "Person not found" };
  const skills = person.skills.length ? ` Skills: ${person.skills.join(", ")}.` : "";
  const description = `${person.name}${person.college ? `, ${person.college}` : ""} on Krew.${skills}`.slice(0, 160);
  return {
    title: person.name,
    description,
    alternates: { canonical: `/people/${person.id}` },
    openGraph: { title: person.name, description, url: `/people/${person.id}`, type: "profile" },
  };
}

export default async function PersonPage({ params }) {
  const { id: rawId } = await params;
  const person = await load(rawId);
  if (!person) notFound();

  const [user, teams, endorsements] = await Promise.all([
    getCurrentUser(),
    listPersonTeams(person.id),
    listEndorsementsFor(person.id),
  ]);
  const details = [person.college, person.year, person.branch].filter(Boolean).join(" · ");
  const initials = person.name
    .split(/\s+/)
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <PageShell>
      <div className="mb-10 flex flex-wrap items-center gap-6">
        <span
          className="slab slab-ink flex h-24 w-24 items-center justify-center rounded-[28px] bg-ink font-display text-4xl font-extrabold text-neon"
          aria-hidden="true"
        >
          {initials}
        </span>
        <div className="min-w-0 flex-1">
          <h1 className={pageTitle}>{person.name}</h1>
          {details && <p className="mt-2 text-lg text-soft">{details}</p>}
        </div>
        {user?.id === person.id && (
          <Link href="/profile" className={quietButton}>
            Edit your profile
          </Link>
        )}
      </div>

      <div className="flex flex-wrap gap-10">
        <div className="flex min-w-0 flex-[2_1_520px] flex-col gap-10">
          {(person.bio || person.skills.length > 0 || person.looking_for) && (
            <section className={`${cardClass} flex flex-col gap-5`} aria-label="About">
              {person.bio && <p className="text-lg">{person.bio}</p>}
              {person.skills.length > 0 && (
                <div>
                  <h2 className="mb-2 font-display text-xl font-bold">Skills</h2>
                  <ul className="flex flex-wrap gap-2">
                    {person.skills.map((s) => (
                      <li key={s} className={tagClass}>
                        {s}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              {person.looking_for && (
                <p>
                  <span className="font-semibold">Looking for:</span> {person.looking_for}
                </p>
              )}
            </section>
          )}

          <section aria-labelledby="endorsements-heading">
            <h2 id="endorsements-heading" className={`${sectionTitle} mb-5`}>
              What teammates say
            </h2>
            {endorsements.length === 0 ? (
              <p className="text-lg text-soft">No endorsements yet.</p>
            ) : (
              <ul className="flex flex-col gap-5">
                {endorsements.map((e) => (
                  <li key={e.id} className={cardClass}>
                    <p className="text-lg">&ldquo;{e.note}&rdquo;</p>
                    <p className="mt-2 text-sm text-muted">
                      <Link href={`/people/${e.from_id}`} className="font-semibold text-ink hover:underline">
                        {e.from_name}
                      </Link>{" "}
                      on{" "}
                      <Link href={`/teams/${e.team_id}`} className="hover:underline">
                        {e.team_name}
                      </Link>
                    </p>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>

        <aside className="min-w-0 flex-[1_1_320px]">
          <section className={cardClass} aria-labelledby="teams-heading">
            <h2 id="teams-heading" className="mb-3 font-display text-xl font-bold">
              Teams ({teams.length})
            </h2>
            {teams.length === 0 ? (
              <p className="text-muted">Not on a team yet.</p>
            ) : (
              <ul>
                {teams.map((t) => (
                  <li key={t.id} className="border-b border-line py-3 last:border-b-0">
                    <Link href={`/teams/${t.id}`} className="font-semibold hover:underline">
                      {t.name}
                    </Link>
                    <p className="text-sm text-muted">{t.problem_title}</p>
                    <p className="text-sm text-muted">
                      {t.role === "lead" ? "Lead" : "Member"} · {t.completed} milestones ticked off
                      {t.owner_confirmed && " · Solution confirmed"}
                    </p>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </aside>
      </div>
    </PageShell>
  );
}
