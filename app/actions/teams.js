"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { pool, query, queryOne } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import { isHttpUrl, text } from "@/lib/form";
import { notify } from "@/lib/notify";
import { isTeamMember } from "@/lib/queries";

async function alreadyOnTeamFor(problemId, userId) {
  const row = await queryOne(
    `select t.id from team_members m join teams t on t.id = m.team_id
      where t.problem_id = $1 and m.user_id = $2`,
    [problemId, userId]
  );
  return row?.id ?? null;
}

async function memberIds(teamId) {
  const rows = await query("select user_id from team_members where team_id = $1", [teamId]);
  return rows.map((r) => r.user_id);
}

export async function createTeam(problemId, _prevState, formData) {
  const id = Number(problemId);
  const user = await requireUser(`/problems/${id}`);
  const name = text(formData, "name", 60);
  const needs = text(formData, "needs", 120);

  if (name.length < 3) return { errors: { name: "Give your team a name of at least 3 characters." } };

  const problem = await queryOne("select posted_by, title, status from problems where id = $1", [id]);
  if (!problem) return { errors: { name: "That problem no longer exists." } };
  if (problem.status === "solved") return { errors: { name: "This problem is already solved." } };

  const existing = await alreadyOnTeamFor(id, user.id);
  if (existing) return { errors: { name: "You're already on a team for this problem." } };

  // Create the team, add the creator as lead, and mark them interested, all or nothing.
  const client = await pool.connect();
  let teamId;
  try {
    await client.query("begin");
    const { rows } = await client.query(
      "insert into teams (problem_id, name, needs, created_by) values ($1, $2, $3, $4) returning id",
      [id, name, needs, user.id]
    );
    teamId = rows[0].id;
    await client.query("insert into team_members (team_id, user_id, role) values ($1, $2, 'lead')", [
      teamId,
      user.id,
    ]);
    await client.query(
      "insert into interests (problem_id, user_id) values ($1, $2) on conflict do nothing",
      [id, user.id]
    );
    await client.query("update problems set status = 'in_progress' where id = $1 and status = 'open'", [id]);
    await client.query("commit");
  } catch (error) {
    await client.query("rollback");
    throw error;
  } finally {
    client.release();
  }

  await notify(problem.posted_by, `${user.name} started a team, ${name}, on "${problem.title}".`, `/teams/${teamId}`, {
    except: user.id,
  });

  revalidatePath(`/problems/${id}`);
  redirect(`/teams/${teamId}?created=1`);
}

export async function joinTeam(teamId) {
  const id = Number(teamId);
  const user = await requireUser(`/teams/${id}`);
  const team = await queryOne("select problem_id, name from teams where id = $1", [id]);
  if (!team) redirect("/problems");

  const existing = await alreadyOnTeamFor(team.problem_id, user.id);
  if (!existing) {
    const others = await memberIds(id);
    await query("insert into team_members (team_id, user_id) values ($1, $2) on conflict do nothing", [
      id,
      user.id,
    ]);
    await query("insert into interests (problem_id, user_id) values ($1, $2) on conflict do nothing", [
      team.problem_id,
      user.id,
    ]);
    await notify(others, `${user.name} joined ${team.name}.`, `/teams/${id}`);
  }

  revalidatePath(`/teams/${id}`);
  revalidatePath(`/problems/${team.problem_id}`);
  redirect(`/teams/${existing ?? id}`);
}

export async function leaveTeam(teamId) {
  const id = Number(teamId);
  const user = await requireUser(`/teams/${id}`);
  const team = await queryOne("select problem_id, name from teams where id = $1", [id]);
  if (!team) redirect("/dashboard");

  await query("delete from team_members where team_id = $1 and user_id = $2", [id, user.id]);
  await query("update milestones set assigned_to = null where team_id = $1 and assigned_to = $2 and not done", [
    id,
    user.id,
  ]);

  // An empty team is removed. Otherwise make sure someone is still the lead.
  const remaining = await query(
    "select user_id, role from team_members where team_id = $1 order by joined_at",
    [id]
  );
  if (remaining.length === 0) {
    await query("delete from teams where id = $1", [id]);
    await query(
      `update problems set status = 'open'
        where id = $1 and status = 'in_progress' and not exists (select 1 from teams where problem_id = $1)`,
      [team.problem_id]
    );
  } else {
    if (!remaining.some((m) => m.role === "lead")) {
      await query("update team_members set role = 'lead' where team_id = $1 and user_id = $2", [
        id,
        remaining[0].user_id,
      ]);
    }
    await notify(
      remaining.map((m) => m.user_id),
      `${user.name} left ${team.name}. Their open milestones are now unassigned.`,
      `/teams/${id}`
    );
  }

  revalidatePath(`/problems/${team.problem_id}`);
  revalidatePath("/dashboard");
  redirect(`/problems/${team.problem_id}`);
}

export async function updateTeam(teamId, _prevState, formData) {
  const id = Number(teamId);
  const user = await requireUser(`/teams/${id}`);
  if (!(await isTeamMember(id, user.id))) return { error: "Only team members can edit the team." };

  const name = text(formData, "name", 60);
  const needs = text(formData, "needs", 120);
  const projectLink = text(formData, "project_link", 300);
  if (name.length < 3) return { errors: { name: "Give your team a name of at least 3 characters." } };
  if (projectLink && !isHttpUrl(projectLink)) {
    return { errors: { project_link: "Use a full link starting with https://" } };
  }

  await query("update teams set name = $1, needs = $2, project_link = $3 where id = $4", [
    name,
    needs,
    projectLink,
    id,
  ]);
  revalidatePath(`/teams/${id}`);
  revalidatePath("/showcase");
  return { saved: Date.now() };
}

// Checks that the person picked as owner is actually on the team.
async function validOwner(teamId, value) {
  const ownerId = Number(value);
  if (!ownerId) return null;
  return (await isTeamMember(teamId, ownerId)) ? ownerId : undefined;
}

export async function addMilestone(teamId, _prevState, formData) {
  const id = Number(teamId);
  const user = await requireUser(`/teams/${id}`);
  if (!(await isTeamMember(id, user.id))) return { error: "Only team members can add milestones." };

  const title = text(formData, "title", 120);
  const due = text(formData, "due_date", 10);
  const ownerId = await validOwner(id, formData.get("assigned_to"));
  if (title.length < 3) return { errors: { title: "Describe the milestone in a few words." } };
  if (due && !/^\d{4}-\d{2}-\d{2}$/.test(due)) return { errors: { due_date: "Pick a date." } };
  if (ownerId === undefined) return { errors: { title: "Pick an owner from the team." } };

  await query("insert into milestones (team_id, title, due_date, assigned_to) values ($1, $2, $3, $4)", [
    id,
    title,
    due || null,
    ownerId,
  ]);
  if (ownerId) {
    await notify(ownerId, `${user.name} gave you a milestone: "${title}".`, `/teams/${id}`, { except: user.id });
  }
  revalidatePath(`/teams/${id}`);
  return { added: Date.now() };
}

export async function assignMilestone(teamId, milestoneId, formData) {
  const id = Number(teamId);
  const user = await requireUser(`/teams/${id}`);
  if (!(await isTeamMember(id, user.id))) return;

  const ownerId = await validOwner(id, formData.get("assigned_to"));
  if (ownerId === undefined) return;
  const milestone = await queryOne(
    "update milestones set assigned_to = $1 where id = $2 and team_id = $3 returning title",
    [ownerId, Number(milestoneId), id]
  );
  if (milestone && ownerId) {
    await notify(ownerId, `${user.name} gave you a milestone: "${milestone.title}".`, `/teams/${id}`, {
      except: user.id,
    });
  }
  revalidatePath(`/teams/${id}`);
}

// Ticking a milestone records who did it and when, so the team can see who contributed.
export async function toggleMilestone(teamId, milestoneId) {
  const id = Number(teamId);
  const user = await requireUser(`/teams/${id}`);
  if (!(await isTeamMember(id, user.id))) return;

  await query(
    `update milestones
        set done = not done,
            completed_by = case when done then null else $3::int end,
            completed_at = case when done then null else now() end
      where id = $1 and team_id = $2`,
    [Number(milestoneId), id, user.id]
  );
  revalidatePath(`/teams/${id}`);
  revalidatePath("/dashboard");
}

export async function deleteMilestone(teamId, milestoneId) {
  const id = Number(teamId);
  const user = await requireUser(`/teams/${id}`);
  if (!(await isTeamMember(id, user.id))) return;

  await query("delete from milestones where id = $1 and team_id = $2", [Number(milestoneId), id]);
  revalidatePath(`/teams/${id}`);
}

export async function endorseTeammate(teamId, _prevState, formData) {
  const id = Number(teamId);
  const user = await requireUser(`/teams/${id}`);
  const toUser = Number(formData.get("to_user"));
  const note = text(formData, "note", 280);

  if (!(await isTeamMember(id, user.id))) return { error: "Only team members can endorse teammates." };
  if (!toUser || toUser === user.id || !(await isTeamMember(id, toUser))) {
    return { errors: { to_user: "Pick a teammate." } };
  }
  if (note.length < 10) return { errors: { note: "Say what they did well, in a sentence." } };

  const team = await queryOne("select name from teams where id = $1", [id]);
  await query(
    `insert into endorsements (team_id, from_user, to_user, note) values ($1, $2, $3, $4)
     on conflict (team_id, from_user, to_user) do update set note = excluded.note, created_at = now()`,
    [id, user.id, toUser, note]
  );
  await notify(toUser, `${user.name} endorsed your work on ${team.name}.`, `/people/${toUser}`);

  revalidatePath(`/teams/${id}`);
  revalidatePath(`/people/${toUser}`);
  return { saved: Date.now() };
}
