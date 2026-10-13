"use client";

import { useActionState } from "react";
import { updateProfile } from "@/app/actions/profile";
import SubmitButton from "@/components/SubmitButton";
import FieldError from "@/components/FieldError";
import { LOOKING_FOR, SKILLS, YEARS } from "@/lib/content";
import { inputClass, labelClass, primaryButton } from "@/lib/ui";

export default function ProfileForm({ user }) {
  const [state, formAction] = useActionState(updateProfile, null);
  const errors = state?.errors ?? {};
  const otherSkills = user.skills.filter((s) => !SKILLS.includes(s)).join(", ");

  return (
    <form action={formAction} noValidate className="flex flex-col gap-6">
      <div className="flex flex-col gap-1.5">
        <label htmlFor="name" className={labelClass}>
          Name
        </label>
        <input id="name" name="name" defaultValue={user.name} maxLength={80} autoComplete="name"
          aria-invalid={errors.name ? "true" : undefined}
          aria-describedby={errors.name ? "name-error" : undefined}
          className={inputClass} />
        <FieldError id="name-error" message={errors.name} />
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="bio" className={labelClass}>
          About you <span className="font-normal text-muted">(optional)</span>
        </label>
        <textarea id="bio" name="bio" rows={3} defaultValue={user.bio} maxLength={300}
          placeholder="What you've built, what you want to learn, and what you're good at."
          className={inputClass} />
      </div>

      <div className="grid grid-cols-[repeat(auto-fit,minmax(200px,1fr))] gap-5">
        <div className="flex flex-col gap-1.5">
          <label htmlFor="college" className={labelClass}>
            College
          </label>
          <input id="college" name="college" defaultValue={user.college} maxLength={120} className={inputClass} />
        </div>
        <div className="flex flex-col gap-1.5">
          <label htmlFor="year" className={labelClass}>
            Year
          </label>
          <select id="year" name="year" defaultValue={user.year} className={inputClass}>
            <option value="">Choose</option>
            {YEARS.map((y) => (
              <option key={y} value={y}>
                {y}
              </option>
            ))}
          </select>
          <FieldError id="year-error" message={errors.year} />
        </div>
        <div className="flex flex-col gap-1.5">
          <label htmlFor="branch" className={labelClass}>
            Branch
          </label>
          <input id="branch" name="branch" defaultValue={user.branch} maxLength={80} placeholder="CSE"
            className={inputClass} />
        </div>
      </div>

      <fieldset className="flex flex-col gap-3">
        <legend className={`${labelClass} mb-1`}>Your skills</legend>
        <p className="-mt-1 text-sm text-muted">Teams use these to find you. Pick everything you can help with.</p>
        <div className="flex flex-wrap gap-2">
          {SKILLS.map((skill) => (
            <label key={skill} className="cursor-pointer">
              <input type="checkbox" name="skills" value={skill} defaultChecked={user.skills.includes(skill)}
                className="peer sr-only" />
              <span className="inline-block rounded-full border-2 border-line bg-white px-4 py-2 font-medium peer-checked:border-ink peer-checked:bg-ink peer-checked:text-neon peer-focus-visible:outline-3 peer-focus-visible:outline-tangerine">
                {skill}
              </span>
            </label>
          ))}
        </div>
      </fieldset>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="other_skills" className={labelClass}>
          Other skills <span className="font-normal text-muted">(comma separated)</span>
        </label>
        <input id="other_skills" name="other_skills" defaultValue={otherSkills} maxLength={200}
          placeholder="Figma, Flutter, Public speaking" className={inputClass} />
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="looking_for" className={labelClass}>
          What are you looking for?
        </label>
        <select id="looking_for" name="looking_for" defaultValue={user.looking_for} className={inputClass}>
          <option value="">Choose</option>
          {LOOKING_FOR.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
        <FieldError id="looking_for-error" message={errors.looking_for} />
      </div>

      <div className="flex flex-wrap items-center gap-4">
        <SubmitButton className={`${primaryButton} text-lg`}>Save profile</SubmitButton>
        <p role="status" className="font-medium text-muted">
          {state?.saved && "Profile saved."}
        </p>
      </div>
    </form>
  );
}
