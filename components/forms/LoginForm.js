"use client";

import { useActionState } from "react";
import { login } from "@/app/actions/auth";
import SubmitButton from "@/components/SubmitButton";
import { inputClass, labelClass, primaryButton } from "@/lib/ui";

export default function LoginForm({ next }) {
  const [state, formAction] = useActionState(login, null);

  return (
    <form action={formAction} className="flex flex-col gap-5">
      <input type="hidden" name="next" value={next} />

      {state?.error && (
        <p role="alert" className="rounded-2xl bg-[#fff1e6] px-4 py-3 font-medium text-[#a34400]">
          {state.error}
        </p>
      )}

      <div className="flex flex-col gap-1.5">
        <label htmlFor="email" className={labelClass}>
          Email
        </label>
        <input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          required
          defaultValue={state?.values?.email ?? ""}
          placeholder="you@college.edu"
          className={inputClass}
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="password" className={labelClass}>
          Password
        </label>
        <input
          id="password"
          name="password"
          type="password"
          autoComplete="current-password"
          required
          className={inputClass}
        />
      </div>

      <SubmitButton pendingText="Logging in…" className={`${primaryButton} mt-2 w-full text-lg`}>
        Log in
      </SubmitButton>
    </form>
  );
}
