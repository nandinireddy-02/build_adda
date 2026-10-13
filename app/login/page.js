import Link from "next/link";
import { redirect } from "next/navigation";
import AuthShell from "@/components/AuthShell";
import LoginForm from "@/components/forms/LoginForm";
import { getCurrentUser, safeNext } from "@/lib/auth";

export const metadata = { title: "Log in", robots: { index: false } };

export default async function LoginPage({ searchParams }) {
  const params = await searchParams;
  const next = safeNext(params?.next);
  if (await getCurrentUser()) redirect(next);

  return (
    <AuthShell
      title="Welcome back"
      subtitle="Log in to pick up where your team left off."
      footer={
        <>
          New here?{" "}
          <Link href="/signup" className="font-semibold text-ink underline underline-offset-4">
            Create an account
          </Link>
        </>
      }
    >
      <LoginForm next={next} />
    </AuthShell>
  );
}
