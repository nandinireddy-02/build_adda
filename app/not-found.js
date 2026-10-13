import Link from "next/link";
import PageShell from "@/components/PageShell";
import { darkButton, pageTitle } from "@/lib/ui";

export const metadata = { title: "Page not found", robots: { index: false } };

export default function NotFound() {
  return (
    <PageShell>
      <div className="mx-auto max-w-[640px] py-16 text-center">
        <h1 className={pageTitle}>Nothing here</h1>
        <p className="mb-8 mt-4 text-lg text-soft">That page doesn&apos;t exist or was removed.</p>
        <Link href="/problems" className={darkButton}>
          Browse problems
        </Link>
      </div>
    </PageShell>
  );
}
