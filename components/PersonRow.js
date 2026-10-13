import Link from "next/link";

// One person in a list: initials, name, details, and skills.
// Skills the problem needs are highlighted so matches stand out.
export default function PersonRow({ person, highlight = [], extra }) {
  const initials = person.name
    .split(/\s+/)
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
  const details = [person.college, person.year].filter(Boolean).join(" · ");

  return (
    <li className="flex flex-wrap items-start gap-4 border-b border-line py-4 last:border-b-0">
      <span
        className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-ink font-display font-bold text-neon"
        aria-hidden="true"
      >
        {initials}
      </span>
      <div className="min-w-0 flex-1">
        <p className="font-semibold">
          <Link href={`/people/${person.id}`} className="hover:underline">
            {person.name}
          </Link>
          {extra && <span className="ml-2 text-sm font-medium text-muted">{extra}</span>}
        </p>
        {details && <p className="text-sm text-muted">{details}</p>}
        {person.skills?.length > 0 && (
          <ul className="mt-2 flex flex-wrap gap-1.5" aria-label="Skills">
            {person.skills.map((skill) => {
              const match = highlight.includes(skill);
              return (
                <li
                  key={skill}
                  className={`rounded-full px-2.5 py-0.5 text-[13px] font-medium ${
                    match ? "bg-neon text-neon-ink" : "bg-lilac text-ink"
                  }`}
                >
                  {skill}
                  {match && <span className="sr-only"> (matches)</span>}
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </li>
  );
}
