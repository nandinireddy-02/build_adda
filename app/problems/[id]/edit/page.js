import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import PageShell from "@/components/PageShell";
import ProblemForm from "@/components/forms/ProblemForm";
import { requireUser } from "@/lib/auth";
import { getProblem } from "@/lib/queries";
import { cardClass, pageTitle } from "@/lib/ui";

export const metadata = { title: "Edit problem", robots: { index: false } };

export default async function EditProblemPage({ params }) {
  const { id: rawId } = await params;
  if (!/^\d+$/.test(rawId)) notFound();
  const id = Number(rawId);

  const user = await requireUser(`/problems/${id}/edit`);
  const problem = await getProblem(id);
  if (!problem) notFound();
  if (problem.posted_by !== user.id) redirect(`/problems/${id}`);

  const initial = {
    title: problem.title,
    category: problem.category,
    who: problem.who_has_it,
    today: problem.what_happens_today,
    solved: problem.what_solved_looks_like,
    contact: problem.owner_contact,
    skills: problem.skills,
  };

  return (
    <PageShell>
      <div className="mx-auto max-w-[720px]">
        <Link href={`/problems/${id}`} className="mb-6 inline-block py-2 font-medium underline underline-offset-4">
          Back to the problem
        </Link>
        <h1 className={`${pageTitle} mb-10`}>Edit problem</h1>
        <div className={cardClass}>
          <ProblemForm initial={initial} problemId={id} />
        </div>
      </div>
    </PageShell>
  );
}
