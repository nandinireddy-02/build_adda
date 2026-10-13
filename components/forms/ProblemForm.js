"use client";

import { useActionState } from "react";
import { createProblem, updateProblem } from "@/app/actions/problems";
import SubmitButton from "@/components/SubmitButton";
import FieldError from "@/components/FieldError";
import { CATEGORIES, SKILLS } from "@/lib/content";
import { inputClass, labelClass, primaryButton } from "@/lib/ui";

function Field({ id, label, hint, error, children }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className={labelClass}>
        {label}
      </label>
      {hint && <p className="-mt-1 text-sm text-muted">{hint}</p>}
      {children}
      <FieldError id={`${id}-error`} message={error} />
    </div>
  );
}

export default function ProblemForm({ initial, problemId }) {
  const action = problemId ? updateProblem.bind(null, problemId) : createProblem;
  const [state, formAction] = useActionState(action, null);
  const errors = state?.errors ?? {};
  const values = state?.values ?? initial;
  const invalid = (name) => (errors[name] ? { "aria-invalid": "true", "aria-describedby": `${name}-error` } : {});

  return (
    <form action={formAction} noValidate className="flex flex-col gap-6">
      <Field id="title" label="Title" hint="A short name for the problem." error={errors.title}>
        <input id="title" name="title" defaultValue={values.title ?? ""} maxLength={120}
          placeholder="Reduce food waste in college hostels" className={inputClass} {...invalid("title")} />
      </Field>

      <Field id="category" label="Category" error={errors.category}>
        <select id="category" name="category" defaultValue={values.category ?? ""} className={inputClass} {...invalid("category")}>
          <option value="" disabled>
            Pick a category
          </option>
          {CATEGORIES.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
      </Field>

      <Field id="who" label="Who has this problem?" error={errors.who}>
        <input id="who" name="who" defaultValue={values.who ?? ""} maxLength={300}
          placeholder="Hostel mess staff and 400 residents" className={inputClass} {...invalid("who")} />
      </Field>

      <Field id="today" label="What happens today?" error={errors.today}>
        <textarea id="today" name="today" rows={3} defaultValue={values.today ?? ""} maxLength={1000}
          placeholder="Food is cooked for a fixed headcount, so leftovers pile up whenever students eat out."
          className={inputClass} {...invalid("today")} />
      </Field>

      <Field id="solved" label="What would solved look like?" error={errors.solved}>
        <textarea id="solved" name="solved" rows={3} defaultValue={values.solved ?? ""} maxLength={1000}
          placeholder="The mess knows the next day's headcount by 4 pm."
          className={inputClass} {...invalid("solved")} />
      </Field>

      <fieldset className="flex flex-col gap-3">
        <legend className={`${labelClass} mb-1`}>Skills this needs</legend>
        <div className="flex flex-wrap gap-2">
          {SKILLS.map((skill) => (
            <label key={skill} className="cursor-pointer">
              <input type="checkbox" name="skills" value={skill} defaultChecked={values.skills?.includes(skill)} className="peer sr-only" />
              <span className="inline-block rounded-full border-2 border-line bg-white px-4 py-2 font-medium peer-checked:border-ink peer-checked:bg-ink peer-checked:text-neon peer-focus-visible:outline-3 peer-focus-visible:outline-tangerine">
                {skill}
              </span>
            </label>
          ))}
        </div>
      </fieldset>

      <Field id="contact" label="Contact for feedback (optional)"
        hint="Who the team should talk to. Shown only to logged-in students." error={errors.contact}>
        <input id="contact" name="contact" defaultValue={values.contact ?? ""} maxLength={200}
          placeholder="Mess manager, Block B, 98xxxxxx10" className={inputClass} />
      </Field>

      <SubmitButton pendingText={problemId ? "Saving…" : "Posting…"} className={`${primaryButton} text-lg`}>
        {problemId ? "Save changes" : "Post problem"}
      </SubmitButton>
    </form>
  );
}
