"use client";

import { useActionState, useEffect, useRef } from "react";
import { endorseTeammate } from "@/app/actions/teams";
import SubmitButton from "@/components/SubmitButton";
import FieldError from "@/components/FieldError";
import { inputClass, labelClass, primaryButton } from "@/lib/ui";

export default function EndorseForm({ teamId, teammates }) {
  const [state, formAction] = useActionState(endorseTeammate.bind(null, teamId), null);
  const formRef = useRef(null);
  const errors = state?.errors ?? {};

  useEffect(() => {
    if (state?.saved) formRef.current?.reset();
  }, [state?.saved]);

  return (
    <form ref={formRef} action={formAction} noValidate className="flex flex-col gap-4">
      <div className="flex flex-col gap-1.5">
        <label htmlFor="endorse-who" className={labelClass}>
          Teammate
        </label>
        <select id="endorse-who" name="to_user" defaultValue="" className={inputClass}
          aria-invalid={errors.to_user ? "true" : undefined}>
          <option value="" disabled>
            Choose a teammate
          </option>
          {teammates.map((m) => (
            <option key={m.id} value={m.id}>
              {m.name}
            </option>
          ))}
        </select>
        <FieldError id="endorse-who-error" message={errors.to_user} />
      </div>
      <div className="flex flex-col gap-1.5">
        <label htmlFor="endorse-note" className={labelClass}>
          What did they do well?
        </label>
        <textarea id="endorse-note" name="note" rows={2} maxLength={280}
          placeholder="Built the whole booking backend in a weekend and explained it to everyone."
          aria-invalid={errors.note ? "true" : undefined}
          aria-describedby={errors.note ? "endorse-note-error" : undefined}
          className={inputClass} />
        <FieldError id="endorse-note-error" message={errors.note ?? state?.error} />
      </div>
      <div className="flex flex-wrap items-center gap-4">
        <SubmitButton pendingText="Sending…" className={primaryButton}>
          Endorse
        </SubmitButton>
        <p role="status" className="text-sm font-medium text-muted">
          {state?.saved && "Endorsement added to their profile."}
        </p>
      </div>
    </form>
  );
}
