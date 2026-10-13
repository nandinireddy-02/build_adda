"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { query, queryOne } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import { list, text } from "@/lib/form";
import { notify } from "@/lib/notify";
import { CATEGORIES, SKILLS } from "@/lib/content";

function readProblem(formData) {
  const values = {
    title: text(formData, "title", 120),
    category: text(formData, "category", 40),
    who: text(formData, "who", 300),
    today: text(formData, "today", 1000),
    solved: text(formData, "solved", 1000),
    contact: text(formData, "contact", 200),
    skills: list(formData, "skills", SKILLS),
  };

  const errors = {};
  if (values.title.length < 8) errors.title = "Give it a title of at least 8 characters.";
  if (!CATEGORIES.includes(values.category)) errors.category = "Pick a category.";
  if (!values.who) errors.who = "Say who has this problem.";
  if (values.today.length < 20) errors.today = "Describe what happens today in a sentence or two.";
  if (values.solved.length < 10) errors.solved = "Describe what solved would look like.";

  return { values, errors: Object.keys(errors).length ? errors : null };
}

async function requireOwner(problemId, returnTo) {
  const user = await requireUser(returnTo);
  const problem = await queryOne("select id, posted_by, title from problems where id = $1", [problemId]);
  if (!problem) redirect("/problems");
  if (problem.posted_by !== user.id) redirect(`/problems/${problemId}`);
  return { user, problem };
}

export async function createProblem(_prevState, formData) {
  const user = await requireUser("/problems/new");
  const { values, errors } = readProblem(formData);
  if (errors) return { errors, values };

  const problem = await queryOne(
    `insert into problems
       (posted_by, title, who_has_it, what_happens_today, what_solved_looks_like, category, skills, owner_contact)
     values ($1, $2, $3, $4, $5, $6, $7, $8)
     returning id`,
    [user.id, values.title, values.who, values.today, values.solved, values.category, values.skills, values.contact]
  );

  revalidatePath("/");
  revalidatePath("/problems");
  redirect(`/problems/${problem.id}?posted=1`);
}

export async function updateProblem(problemId, _prevState, formData) {
  const id = Number(problemId);
  await requireOwner(id, `/problems/${id}/edit`);
  const { values, errors } = readProblem(formData);
  if (errors) return { errors, values };

  await query(
    `update problems
        set title = $1, category = $2, who_has_it = $3, what_happens_today = $4,
            what_solved_looks_like = $5, skills = $6, owner_contact = $7
      where id = $8`,
    [values.title, values.category, values.who, values.today, values.solved, values.skills, values.contact, id]
  );

  revalidatePath("/");
  revalidatePath("/problems");
  redirect(`/problems/${id}?updated=1`);
}

export async function deleteProblem(problemId, formData) {
  const id = Number(problemId);
  await requireOwner(id, `/problems/${id}`);
  if (formData.get("confirm") !== "yes") redirect(`/problems/${id}?delete=confirm`);

  await query("delete from problems where id = $1", [id]);
  revalidatePath("/");
  revalidatePath("/problems");
  redirect("/dashboard?deleted=1");
}

// The problem owner confirms which team's solution actually worked for them.
export async function markSolved(problemId, _prevState, formData) {
  const id = Number(problemId);
  const { user, problem } = await requireOwner(id, `/problems/${id}`);
  const teamId = Number(formData.get("team_id"));
  const feedback = text(formData, "feedback", 500);

  const team = await queryOne("select id, name from teams where id = $1 and problem_id = $2", [teamId, id]);
  if (!team) return { errors: { team_id: "Pick the team whose solution worked." } };

  await query("update teams set owner_confirmed = true, owner_feedback = $1 where id = $2", [feedback, team.id]);
  await query("update problems set status = 'solved', solved_team_id = $1, solved_at = now() where id = $2", [
    team.id,
    id,
  ]);

  const members = await query("select user_id from team_members where team_id = $1", [team.id]);
  await notify(
    members.map((m) => m.user_id),
    `${user.name} confirmed your solution to "${problem.title}" worked.`,
    `/teams/${team.id}`,
    { except: user.id }
  );

  revalidatePath(`/problems/${id}`);
  revalidatePath(`/teams/${team.id}`);
  revalidatePath("/showcase");
  revalidatePath("/problems");
  return { saved: Date.now() };
}

// Adds or removes "I'm interested" for the logged-in user.
export async function toggleInterest(problemId) {
  const user = await requireUser(`/problems/${problemId}`);
  const id = Number(problemId);

  const removed = await query(
    "delete from interests where problem_id = $1 and user_id = $2 returning problem_id",
    [id, user.id]
  );
  if (removed.length === 0) {
    const problem = await queryOne("select posted_by, title from problems where id = $1", [id]);
    if (!problem) redirect("/problems");
    await query(
      "insert into interests (problem_id, user_id) values ($1, $2) on conflict do nothing",
      [id, user.id]
    );
    await notify(problem.posted_by, `${user.name} is interested in "${problem.title}".`, `/problems/${id}`, {
      except: user.id,
    });
  }

  revalidatePath(`/problems/${id}`);
  revalidatePath("/problems");
  revalidatePath("/dashboard");
}
