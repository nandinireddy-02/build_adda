import Link from "next/link";
import Tilt from "./Tilt";

function statusLine(problem) {
  if (problem.status === "solved") return "Solved and confirmed by the owner";
  if (problem.team_count > 0) {
    return `${problem.team_count} ${problem.team_count === 1 ? "team" : "teams"} forming`;
  }
  if (problem.interest_count > 0) return `${problem.interest_count} interested`;
  return "Be the first to show interest";
}

export default function ProblemCard({ problem }) {
  return (
    <Tilt max={7} className="slab spotlight h-full rounded-[32px] bg-white">
      <article className="flex h-full flex-col gap-4 p-7 [transform-style:preserve-3d]">
        <ul className="pop-sm flex flex-wrap gap-2" aria-label="Category and skills">
          <li className="rounded-full bg-ink px-3 py-1 text-[13px] font-medium text-white">{problem.category}</li>
          {problem.status === "solved" && (
            <li className="rounded-full bg-tangerine px-3 py-1 text-[13px] font-semibold text-tangerine-ink">Solved</li>
          )}
          {problem.skills.slice(0, 2).map((skill) => (
            <li key={skill} className="rounded-full bg-lilac px-3 py-1 text-[13px] font-medium">
              {skill}
            </li>
          ))}
        </ul>

        <h3 className="pop-md font-display text-[26px] font-bold leading-[1.15]">
          <Link href={`/problems/${problem.id}`} className="no-underline hover:underline">
            {problem.title}
          </Link>
        </h3>
        <p className="line-clamp-3 text-muted">{problem.what_happens_today}</p>

        <div className="pop-sm mt-auto flex flex-wrap items-center justify-between gap-3 pt-2">
          <span className="text-sm text-muted">{statusLine(problem)}</span>
          <Link
            href={`/problems/${problem.id}`}
            className="btn3d btn3d-neon rounded-full bg-neon px-5 py-3 font-semibold text-neon-ink"
            aria-label={`View problem: ${problem.title}`}
          >
            View problem
          </Link>
        </div>
      </article>
    </Tilt>
  );
}
