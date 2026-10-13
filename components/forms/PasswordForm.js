"use client";

import { useActionState, useEffect, useRef } from "react";
import { changePassword } from "@/app/actions/profile";
import SubmitButton from "@/components/SubmitButton";
import FieldError from "@/components/FieldError";
import { darkButton, inputClass, labelClass } from "@/lib/ui";

export default function PasswordForm() {
  const [state, formAction] = useActionState(changePassword, null);
  const formRef = useRef(null);
  const errors = state?.errors ?? {};

  useEffect(() => {
    if (state?.saved) formRef.current?.reset();
  }, [state?.saved]);

  return (
    <form ref={formRef} action={formAction} noValidate className="flex flex-col gap-4">
      <div className="flex flex-col gap-1.5">
        <label htmlFor="current" className={labelClass}>
          Current password
        </label>
        <input id="current" name="current" type="password" autoComplete="current-password"
          aria-invalid={errors.current ? "true" : undefined}
          aria-describedby={errors.current ? "current-error" : undefined}
          className={inputClass} />
        <FieldError id="current-error" message={errors.current} />
      </div>
      <div className="flex flex-col gap-1.5">
        <label htmlFor="new_password" className={labelClass}>
          New password
        </label>
        <input id="new_password" name="new_password" type="password" autoComplete="new-password"
          aria-invalid={errors.new_password ? "true" : undefined}
          aria-describedby="new-password-hint"
          className={inputClass} />
        {errors.new_password ? (
          <FieldError id="new-password-hint" message={errors.new_password} />
        ) : (
          <p id="new-password-hint" className="text-sm text-muted">At least 8 characters.</p>
        )}
      </div>
      <div className="flex flex-wrap items-center gap-4">
        <SubmitButton pendingText="Updating…" className={darkButton}>
          Change password
        </SubmitButton>
        <p role="status" className="text-sm font-medium text-muted">
          {state?.saved && "Password changed."}
        </p>
      </div>
    </form>
  );
}
