import Link from "next/link";
import PageShell from "@/components/PageShell";
import ProfileForm from "@/components/forms/ProfileForm";
import PasswordForm from "@/components/forms/PasswordForm";
import { requireUser } from "@/lib/auth";
import { cardClass, pageTitle, quietButton, sectionTitle } from "@/lib/ui";

export const metadata = { title: "Your profile", robots: { index: false } };

export default async function ProfilePage({ searchParams }) {
  const user = await requireUser("/profile");
  const params = await searchParams;

  return (
    <PageShell>
      <div className="mx-auto max-w-[760px]">
        {params?.welcome && (
          <p role="status" className="mb-6 rounded-2xl bg-neon px-5 py-4 font-semibold text-neon-ink">
            Welcome to Krew, {user.name.split(" ")[0]}. Add your skills so teams can find you, then{" "}
            <Link href="/problems" className="underline underline-offset-4">
              browse problems
            </Link>
            .
          </p>
        )}
        <div className="mb-10 flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className={pageTitle}>Your profile</h1>
            <p className="mt-3 text-lg text-soft">{user.email}</p>
          </div>
          <Link href={`/people/${user.id}`} className={quietButton}>
            See your public profile
          </Link>
        </div>

        <div className={cardClass}>
          <ProfileForm user={user} />
        </div>

        <section className={`${cardClass} mt-10`} aria-labelledby="password-heading">
          <h2 id="password-heading" className={`${sectionTitle} mb-5`}>
            Change password
          </h2>
          <PasswordForm />
        </section>
      </div>
    </PageShell>
  );
}
