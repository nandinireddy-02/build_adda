import PageShell from "@/components/PageShell";
import ProblemForm from "@/components/forms/ProblemForm";
import { requireUser } from "@/lib/auth";
import { cardClass, pageTitle } from "@/lib/ui";

export const metadata = {
  title: "Post a problem",
  description: "Post a real problem and let student teams build a solution for it.",
  robots: { index: false },
};

function pick(params, name) {
  const value = params?.[name];
  return typeof value === "string" ? value.slice(0, 1000) : "";
}

export default async function NewProblemPage({ searchParams }) {
  const params = await searchParams;
  // Answers typed into the home page form arrive here in the address.
  const initial = { who: pick(params, "who"), today: pick(params, "today"), solved: pick(params, "solved") };

  const qs = new URLSearchParams(Object.entries(initial).filter(([, v]) => v)).toString();
  const returnTo = qs ? `/problems/new?${qs}` : "/problems/new";
  await requireUser(returnTo);

  return (
    <PageShell>
      <div className="mx-auto max-w-[720px]">
        <h1 className={pageTitle}>Post a problem</h1>
        <p className="mb-10 mt-3 text-lg text-soft">
          Specific problems get picked up. Say who has it, what happens now, and what better looks like.
        </p>
        <div className={cardClass}>
          <ProblemForm initial={initial} />
        </div>
      </div>
    </PageShell>
  );
}
