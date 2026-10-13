"use client";

import { useActionState } from "react";
import { signup } from "@/app/actions/auth";
import SubmitButton from "@/components/SubmitButton";
import FieldError from "@/components/FieldError";
import { inputClass, labelClass, primaryButton } from "@/lib/ui";

export default function SignupForm() {
  const [state, formAction] = useActionState(signup, null);
  const errors = state?.errors ?? {};
  const values = state?.values ?? {};

  return (
    <form action={formAction} noValidate className="flex flex-col gap-5">
      <div className="flex flex-col gap-1.5">
        <label htmlFor="name" className={labelClass}>
          Your name
        </label>
        <input
          id="name"
          name="name"
          autoComplete="name"
          defaultValue={values.name ?? ""}
          placeholder="Nandini Reddy"
          aria-invalid={errors.name ? "true" : undefined}
          aria-describedby={errors.name ? "name-error" : undefined}
          className={inputClass}
        />
        <FieldError id="name-error" message={errors.name} />
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="email" className={labelClass}>
          College email
        </label>
        <input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          defaultValue={values.email ?? ""}
          placeholder="you@college.edu"
          aria-invalid={errors.email ? "true" : undefined}
          aria-describedby={errors.email ? "email-error" : undefined}
          className={inputClass}
        />
        <FieldError id="email-error" message={errors.email} />
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="college" className={labelClass}>
          College <span className="font-normal text-muted">(optional)</span>
        </label>
        <input
          id="college"
          name="college"
          autoComplete="organization"
          defaultValue={values.college ?? ""}
          placeholder="CMR Technical Campus"
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
          autoComplete="new-password"
          aria-invalid={errors.password ? "true" : undefined}
          aria-describedby="password-hint"
          className={inputClass}
        />
        {errors.password ? (
          <FieldError id="password-hint" message={errors.password} />
        ) : (
          <p id="password-hint" className="text-sm text-muted">
            At least 8 characters.
          </p>
        )}
      </div>

      <SubmitButton pendingText="Creating your account…" className={`${primaryButton} mt-2 w-full text-lg`}>
        Create account
      </SubmitButton>
    </form>
  );
}
