"use client";

import { useActionState } from "react";
import { markSolved } from "@/app/actions/problems";
import SubmitButton from "@/components/SubmitButton";
import FieldError from "@/components/FieldError";
import { inputClass, labelClass, primaryButton } from "@/lib/ui";

export default function SolvedForm({ problemId, teams }) {
  const [state, formAction] = useActionState(markSolved.bind(null, problemId), null);
  const errors = state?.errors ?? {};

  return (
    <form action={formAction} noValidate className="flex flex-col gap-4">
      <div className="flex flex-col gap-1.5">
        <label htmlFor="solved-team" className={labelClass}>
          Which team&apos;s solution worked?
        </label>
        <select id="solved-team" name="team_id" defaultValue="" className={inputClass}
          aria-invalid={errors.team_id ? "true" : undefined}
          aria-describedby={errors.team_id ? "solved-team-error" : undefined}>
          <option value="" disabled>
            Choose a team
          </option>
          {teams.map((t) => (
            <option key={t.id} value={t.id}>
              {t.name}
            </option>
          ))}
        </select>
        <FieldError id="solved-team-error" message={errors.team_id} />
      </div>
      <div className="flex flex-col gap-1.5">
        <label htmlFor="solved-feedback" className={labelClass}>
          A line of feedback for the team <span className="font-normal text-muted">(optional)</span>
        </label>
        <textarea id="solved-feedback" name="feedback" rows={2} maxLength={500}
          placeholder="We now waste about half as much food. Thank you!" className={inputClass} />
      </div>
      <SubmitButton pendingText="Confirming…" className={primaryButton}>
        Confirm it&apos;s solved
      </SubmitButton>
    </form>
  );
}
