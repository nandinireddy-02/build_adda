import Link from "next/link";
import { redirect } from "next/navigation";
import AuthShell from "@/components/AuthShell";
import SignupForm from "@/components/forms/SignupForm";
import { getCurrentUser } from "@/lib/auth";

export const metadata = {
  title: "Join",
  description: "Create a free Krew account to find real problems and the teammates to solve them.",
  alternates: { canonical: "/signup" },
};

export default async function SignupPage() {
  if (await getCurrentUser()) redirect("/dashboard");

  return (
    <AuthShell
      title="Find your krew"
      subtitle="Takes a minute. You'll add your skills next so teams can find you."
      footer={
        <>
          Already have an account?{" "}
          <Link href="/login" className="font-semibold text-ink underline underline-offset-4">
            Log in
          </Link>
        </>
      }
    >
      <SignupForm />
    </AuthShell>
  );
}
