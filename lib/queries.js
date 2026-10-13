import "server-only";
import { query, queryOne } from "./db";

// All the read queries the pages use, in one place.

const problemListColumns = `
  p.id, p.title, p.category, p.skills, p.what_happens_today, p.status, p.created_at,
  (select count(*)::int from interests i where i.problem_id = p.id) as interest_count,
  (select count(*)::int from teams t where t.problem_id = p.id) as team_count`;

export function listProblems({ search = "", category = "", limit = 60 } = {}) {
  return query(
    `select ${problemListColumns}
       from problems p
      where ($1 = '' or p.title ilike '%' || $1 || '%' or p.what_happens_today ilike '%' || $1 || '%')
        and ($2 = '' or p.category = $2)
      order by p.created_at desc
      limit $3`,
    [search, category, limit]
  );
}

export function getProblem(id) {
  return queryOne(
    `select p.*, u.name as poster_name, u.college as poster_college
       from problems p
       join users u on u.id = p.posted_by
      where p.id = $1`,
    [id]
  );
}

export function listInterested(problemId) {
  return query(
    `select u.id, u.name, u.college, u.year, u.skills, i.note
       from interests i
       join users u on u.id = i.user_id
      where i.problem_id = $1
      order by i.created_at`,
    [problemId]
  );
}

export async function isInterested(problemId, userId) {
  if (!userId) return false;
  const row = await queryOne("select 1 from interests where problem_id = $1 and user_id = $2", [
    problemId,
    userId,
  ]);
  return Boolean(row);
}

// People whose skills overlap what the problem needs, best match first.
export function suggestTeammates(problemId, skills, excludeUserId) {
  if (!skills?.length) return [];
  return query(
    `select u.id, u.name, u.college, u.year, u.skills,
            cardinality(array(select unnest(u.skills) intersect select unnest($2::text[]))) as overlap
       from users u
      where u.password_hash is not null
        and u.skills && $2::text[]
        and ($3::int is null or u.id <> $3)
        and not exists (select 1 from interests i where i.problem_id = $1 and i.user_id = u.id)
      order by overlap desc, u.created_at desc
      limit 6`,
    [problemId, skills, excludeUserId ?? null]
  );
}

export function listTeamsForProblem(problemId) {
  return query(
    `select t.id, t.name, t.needs,
            coalesce(json_agg(json_build_object('id', u.id, 'name', u.name, 'role', m.role)
                     order by m.joined_at) filter (where u.id is not null), '[]') as members
       from teams t
       left join team_members m on m.team_id = t.id
       left join users u on u.id = m.user_id
      where t.problem_id = $1
      group by t.id
      order by t.created_at`,
    [problemId]
  );
}

export function getTeam(id) {
  return queryOne(
    `select t.*, p.title as problem_title, p.id as problem_id, p.posted_by as problem_owner,
            poster.name as problem_owner_name
       from teams t
       join problems p on p.id = t.problem_id
       join users poster on poster.id = p.posted_by
      where t.id = $1`,
    [id]
  );
}

export function listTeamMembers(teamId) {
  return query(
    `select u.id, u.name, u.college, u.skills, m.role
       from team_members m
       join users u on u.id = m.user_id
      where m.team_id = $1
      order by (m.role = 'lead') desc, m.joined_at`,
    [teamId]
  );
}

export function listMilestones(teamId) {
  return query(
    `select m.id, m.title, m.due_date, m.done, m.completed_at,
            m.assigned_to, owner.name as owner_name,
            m.completed_by, doer.name as completed_by_name
       from milestones m
       left join users owner on owner.id = m.assigned_to
       left join users doer on doer.id = m.completed_by
      where m.team_id = $1
      order by m.done, m.due_date nulls last, m.id`,
    [teamId]
  );
}

export async function isTeamMember(teamId, userId) {
  if (!userId) return false;
  const row = await queryOne("select 1 from team_members where team_id = $1 and user_id = $2", [
    teamId,
    userId,
  ]);
  return Boolean(row);
}

export function listMyTeams(userId) {
  return query(
    `select t.id, t.name, t.needs, p.title as problem_title, m.role,
            (select count(*)::int from team_members x where x.team_id = t.id) as member_count,
            (select count(*)::int from milestones ms where ms.team_id = t.id) as milestone_count,
            (select count(*)::int from milestones ms where ms.team_id = t.id and ms.done) as milestones_done
       from team_members m
       join teams t on t.id = m.team_id
       join problems p on p.id = t.problem_id
      where m.user_id = $1
      order by t.created_at desc`,
    [userId]
  );
}

export function listMyInterests(userId) {
  return query(
    `select ${problemListColumns}
       from interests i
       join problems p on p.id = i.problem_id
      where i.user_id = $1
      order by i.created_at desc`,
    [userId]
  );
}

export function listMyProblems(userId) {
  return query(
    `select ${problemListColumns}
       from problems p
      where p.posted_by = $1
      order by p.created_at desc`,
    [userId]
  );
}

// Per member: milestones they own, how many of those are done,
// and how many milestones they ticked off themselves.
export function teamContributions(teamId) {
  return query(
    `select u.id, u.name, m.role,
            (select count(*)::int from milestones x where x.team_id = $1 and x.assigned_to = u.id) as owned,
            (select count(*)::int from milestones x where x.team_id = $1 and x.assigned_to = u.id and x.done) as owned_done,
            (select count(*)::int from milestones x where x.team_id = $1 and x.completed_by = u.id) as completed
       from team_members m
       join users u on u.id = m.user_id
      where m.team_id = $1
      order by completed desc, owned_done desc, u.name`,
    [teamId]
  );
}

export function listTeamEndorsements(teamId) {
  return query(
    `select e.id, e.note, e.from_user, e.to_user, f.name as from_name, t.name as to_name
       from endorsements e
       join users f on f.id = e.from_user
       join users t on t.id = e.to_user
      where e.team_id = $1
      order by e.created_at desc`,
    [teamId]
  );
}

export function getPerson(id) {
  return queryOne(
    `select id, name, college, year, branch, skills, looking_for, bio, created_at
       from users
      where id = $1 and password_hash is not null`,
    [id]
  );
}

export function listPersonTeams(userId) {
  return query(
    `select t.id, t.name, t.project_link, t.owner_confirmed, p.title as problem_title, m.role,
            (select count(*)::int from milestones x where x.team_id = t.id and x.completed_by = $1) as completed
       from team_members m
       join teams t on t.id = m.team_id
       join problems p on p.id = t.problem_id
      where m.user_id = $1
      order by t.created_at desc`,
    [userId]
  );
}

export function listEndorsementsFor(userId) {
  return query(
    `select e.id, e.note, e.created_at, f.id as from_id, f.name as from_name, t.name as team_name, t.id as team_id
       from endorsements e
       join users f on f.id = e.from_user
       join teams t on t.id = e.team_id
      where e.to_user = $1
      order by e.created_at desc`,
    [userId]
  );
}

// Projects worth showing: teams that shared a link or whose solution the problem owner confirmed.
export function listShowcase(limit = 60) {
  return query(
    `select t.id, t.name, t.project_link, t.owner_confirmed, t.owner_feedback,
            p.id as problem_id, p.title as problem_title, p.category,
            coalesce(json_agg(u.name order by m.joined_at) filter (where u.id is not null), '[]') as members
       from teams t
       join problems p on p.id = t.problem_id
       left join team_members m on m.team_id = t.id
       left join users u on u.id = m.user_id
      where t.project_link <> '' or t.owner_confirmed
      group by t.id, p.id
      order by t.owner_confirmed desc, t.created_at desc
      limit $1`,
    [limit]
  );
}

export async function unreadCount(userId) {
  const row = await queryOne(
    "select count(*)::int as n from notifications where user_id = $1 and read_at is null",
    [userId]
  );
  return row?.n ?? 0;
}

export function listNotifications(userId) {
  return query(
    `select id, message, link, read_at, created_at
       from notifications
      where user_id = $1
      order by created_at desc
      limit 50`,
    [userId]
  );
}

export function listMyOpenMilestones(userId) {
  return query(
    `select m.id, m.title, m.due_date, t.id as team_id, t.name as team_name
       from milestones m
       join teams t on t.id = m.team_id
      where m.assigned_to = $1 and not m.done
      order by m.due_date nulls last, m.id`,
    [userId]
  );
}

export function listAllForSitemap() {
  return Promise.all([
    query("select id, created_at from problems order by created_at desc limit 5000"),
    query("select id, created_at from teams order by created_at desc limit 5000"),
    query("select id, created_at from users where password_hash is not null order by created_at desc limit 5000"),
  ]);
}
