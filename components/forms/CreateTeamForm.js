"use client";

import { useActionState } from "react";
import { createTeam } from "@/app/actions/teams";
import SubmitButton from "@/components/SubmitButton";
import FieldError from "@/components/FieldError";
import { inputClass, labelClass, primaryButton } from "@/lib/ui";

export default function CreateTeamForm({ problemId }) {
  const [state, formAction] = useActionState(createTeam.bind(null, problemId), null);
  const errors = state?.errors ?? {};

  return (
    <form action={formAction} noValidate className="flex flex-col gap-4">
      <div className="flex flex-col gap-1.5">
        <label htmlFor="team-name" className={labelClass}>
          Team name
        </label>
        <input
          id="team-name"
          name="name"
          maxLength={60}
          placeholder="Zero Waste Crew"
          aria-invalid={errors.name ? "true" : undefined}
          aria-describedby={errors.name ? "team-name-error" : undefined}
          className={inputClass}
        />
        <FieldError id="team-name-error" message={errors.name} />
      </div>
      <div className="flex flex-col gap-1.5">
        <label htmlFor="team-needs" className={labelClass}>
          Who are you still looking for? <span className="font-normal text-muted">(optional)</span>
        </label>
        <input id="team-needs" name="needs" maxLength={120} placeholder="1 UI designer" className={inputClass} />
      </div>
      <SubmitButton pendingText="Starting team…" className={primaryButton}>
        Start a team
      </SubmitButton>
    </form>
  );
}
