"use client";

import Link from "next/link";
import { darkButton, pageTitle, quietButton } from "@/lib/ui";

export default function Error({ reset }) {
  return (
    <main id="main" className="mx-auto max-w-[640px] px-5 py-24 text-center">
      <h1 className={pageTitle}>Something went wrong</h1>
      <p className="mb-8 mt-4 text-lg text-soft">
        That page didn&apos;t load. Try again, and if it keeps happening, check that the database is running.
      </p>
      <div className="flex flex-wrap justify-center gap-3">
        <button type="button" onClick={() => reset()} className={darkButton}>
          Try again
        </button>
        <Link href="/" className={quietButton}>
          Go home
        </Link>
      </div>
    </main>
  );
}
