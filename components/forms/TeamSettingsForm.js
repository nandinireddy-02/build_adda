"use client";

import { useActionState } from "react";
import { updateTeam } from "@/app/actions/teams";
import SubmitButton from "@/components/SubmitButton";
import FieldError from "@/components/FieldError";
import { inputClass, labelClass, primaryButton } from "@/lib/ui";

export default function TeamSettingsForm({ team }) {
  const [state, formAction] = useActionState(updateTeam.bind(null, team.id), null);
  const errors = state?.errors ?? {};

  return (
    <form action={formAction} noValidate className="flex flex-col gap-4">
      <div className="flex flex-col gap-1.5">
        <label htmlFor="team-name" className={labelClass}>
          Team name
        </label>
        <input id="team-name" name="name" defaultValue={team.name} maxLength={60}
          aria-invalid={errors.name ? "true" : undefined}
          aria-describedby={errors.name ? "team-name-error" : undefined}
          className={inputClass} />
        <FieldError id="team-name-error" message={errors.name} />
      </div>
      <div className="flex flex-col gap-1.5">
        <label htmlFor="needs" className={labelClass}>
          Who are you still looking for?
        </label>
        <input id="needs" name="needs" defaultValue={team.needs} maxLength={120} placeholder="1 UI designer"
          aria-describedby="needs-hint" className={inputClass} />
        <p id="needs-hint" className="text-sm text-muted">Leave empty once the team is complete.</p>
      </div>
      <div className="flex flex-col gap-1.5">
        <label htmlFor="project_link" className={labelClass}>
          Project link
        </label>
        <input id="project_link" name="project_link" type="url" defaultValue={team.project_link} maxLength={300}
          placeholder="https://github.com/your-team/project"
          aria-invalid={errors.project_link ? "true" : undefined}
          aria-describedby={errors.project_link ? "project_link-error" : "project_link-hint"}
          className={inputClass} />
        {errors.project_link ? (
          <FieldError id="project_link-error" message={errors.project_link} />
        ) : (
          <p id="project_link-hint" className="text-sm text-muted">Adding a link puts your team on the showcase.</p>
        )}
      </div>
      <div className="flex flex-wrap items-center gap-4">
        <SubmitButton className={primaryButton}>Save</SubmitButton>
        <p role="status" className="text-sm font-medium text-muted">
          {state?.saved && "Saved."}
          {state?.error}
        </p>
      </div>
    </form>
  );
}
