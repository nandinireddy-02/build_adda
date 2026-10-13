"use client";

import { useActionState, useEffect, useRef } from "react";
import { addMilestone } from "@/app/actions/teams";
import SubmitButton from "@/components/SubmitButton";
import FieldError from "@/components/FieldError";
import { darkButton, inputClass, labelClass } from "@/lib/ui";

export default function MilestoneForm({ teamId, members, currentUserId }) {
  const [state, formAction] = useActionState(addMilestone.bind(null, teamId), null);
  const formRef = useRef(null);
  const errors = state?.errors ?? {};

  // Clear the boxes after a milestone is added.
  useEffect(() => {
    if (state?.added) formRef.current?.reset();
  }, [state?.added]);

  return (
    <form ref={formRef} action={formAction} noValidate className="flex flex-wrap items-end gap-3">
      <div className="flex min-w-0 flex-[2_1_220px] flex-col gap-1.5">
        <label htmlFor="milestone-title" className={labelClass}>
          New milestone
        </label>
        <input id="milestone-title" name="title" maxLength={120} placeholder="Interview 5 mess staff"
          aria-invalid={errors.title ? "true" : undefined}
          aria-describedby={errors.title ? "milestone-error" : undefined}
          className={inputClass} />
      </div>
      <div className="flex min-w-0 flex-[1_1_160px] flex-col gap-1.5">
        <label htmlFor="milestone-owner" className={labelClass}>
          Owner
        </label>
        <select id="milestone-owner" name="assigned_to" defaultValue={currentUserId} className={inputClass}>
          <option value="">Nobody yet</option>
          {members.map((m) => (
            <option key={m.id} value={m.id}>
              {m.id === currentUserId ? `${m.name} (you)` : m.name}
            </option>
          ))}
        </select>
      </div>
      <div className="flex min-w-0 flex-[1_1_150px] flex-col gap-1.5">
        <label htmlFor="milestone-date" className={labelClass}>
          Due <span className="font-normal text-muted">(optional)</span>
        </label>
        <input id="milestone-date" name="due_date" type="date" className={inputClass} />
      </div>
      <SubmitButton pendingText="Adding…" className={darkButton}>
        Add
      </SubmitButton>
      <div className="w-full">
        <FieldError id="milestone-error" message={errors.title ?? errors.due_date ?? state?.error} />
      </div>
    </form>
  );
}
