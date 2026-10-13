"use server";

import bcrypt from "bcryptjs";
import { redirect } from "next/navigation";
import { query, queryOne } from "@/lib/db";
import { createSession, deleteSession, safeNext } from "@/lib/auth";
import { isEmail, text } from "@/lib/form";

export async function signup(_prevState, formData) {
  const name = text(formData, "name", 80);
  const email = text(formData, "email", 200).toLowerCase();
  const password = typeof formData.get("password") === "string" ? formData.get("password") : "";
  const college = text(formData, "college", 120);

  const errors = {};
  if (!name) errors.name = "Add your name.";
  if (!isEmail(email)) errors.email = "Enter a valid email address.";
  if (password.length < 8) errors.password = "Use at least 8 characters.";
  if (password.length > 200) errors.password = "That password is too long.";
  if (Object.keys(errors).length) return { errors, values: { name, email, college } };

  const existing = await queryOne("select id from users where email = $1", [email]);
  if (existing) {
    return {
      errors: { email: "That email already has an account. Log in instead." },
      values: { name, email, college },
    };
  }

  const passwordHash = await bcrypt.hash(password, 12);
  let user;
  try {
    user = await queryOne(
      "insert into users (name, email, password_hash, college) values ($1, $2, $3, $4) returning id",
      [name, email, passwordHash, college]
    );
  } catch (error) {
    if (error.code === "23505") {
      return { errors: { email: "That email already has an account. Log in instead." }, values: { name, email, college } };
    }
    throw error;
  }

  await createSession(user.id);
  redirect("/profile?welcome=1");
}

export async function login(_prevState, formData) {
  const email = text(formData, "email", 200).toLowerCase();
  const password = typeof formData.get("password") === "string" ? formData.get("password") : "";
  const next = safeNext(formData.get("next"));

  const user = await queryOne("select id, password_hash from users where email = $1", [email]);
  const valid = user?.password_hash ? await bcrypt.compare(password, user.password_hash) : false;

  if (!valid) {
    return { error: "That email and password don't match an account.", values: { email } };
  }

  // Clear out this person's expired sessions while we are here.
  await query("delete from sessions where user_id = $1 and expires_at < now()", [user.id]);
  await createSession(user.id);
  redirect(next);
}

export async function logout() {
  await deleteSession();
  redirect("/");
}
