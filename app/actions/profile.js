"use server";

import bcrypt from "bcryptjs";
import { revalidatePath } from "next/cache";
import { query, queryOne } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import { list, text } from "@/lib/form";
import { LOOKING_FOR, SKILLS, YEARS } from "@/lib/content";

export async function updateProfile(_prevState, formData) {
  const user = await requireUser("/profile");

  const name = text(formData, "name", 80);
  const college = text(formData, "college", 120);
  const year = text(formData, "year", 40);
  const branch = text(formData, "branch", 80);
  const lookingFor = text(formData, "looking_for", 80);
  const bio = text(formData, "bio", 300);
  const skills = list(formData, "skills", SKILLS);

  // "Other skills" is a comma-separated box for anything not in the list.
  const extra = text(formData, "other_skills", 200)
    .split(",")
    .map((s) => s.trim().slice(0, 30))
    .filter(Boolean)
    .slice(0, 5);
  const allSkills = [...new Set([...skills, ...extra])];

  const errors = {};
  if (!name) errors.name = "Add your name.";
  if (year && !YEARS.includes(year)) errors.year = "Pick a year from the list.";
  if (lookingFor && !LOOKING_FOR.includes(lookingFor)) errors.looking_for = "Pick an option from the list.";
  if (Object.keys(errors).length) return { errors };

  await query(
    `update users set name = $1, college = $2, year = $3, branch = $4, skills = $5, looking_for = $6, bio = $7
      where id = $8`,
    [name, college, year, branch, allSkills, lookingFor, bio, user.id]
  );

  revalidatePath("/", "layout");
  return { saved: Date.now() };
}

export async function changePassword(_prevState, formData) {
  const user = await requireUser("/profile");
  const current = typeof formData.get("current") === "string" ? formData.get("current") : "";
  const next = typeof formData.get("new_password") === "string" ? formData.get("new_password") : "";

  if (next.length < 8) return { errors: { new_password: "Use at least 8 characters." } };
  if (next.length > 200) return { errors: { new_password: "That password is too long." } };

  const row = await queryOne("select password_hash from users where id = $1", [user.id]);
  if (!row?.password_hash || !(await bcrypt.compare(current, row.password_hash))) {
    return { errors: { current: "That isn't your current password." } };
  }

  await query("update users set password_hash = $1 where id = $2", [await bcrypt.hash(next, 12), user.id]);
  return { saved: Date.now() };
}
