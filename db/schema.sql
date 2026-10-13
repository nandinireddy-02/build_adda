-- Krew database tables (PostgreSQL).
-- Safe to run more than once: it only creates what is missing.

create table if not exists users (
  id            serial primary key,
  name          text not null,
  email         text not null unique,
  password_hash text,                       -- empty for seed accounts that cannot log in
  college       text not null default '',
  year          text not null default '',
  branch        text not null default '',
  skills        text[] not null default '{}',
  looking_for   text not null default '',
  created_at    timestamptz not null default now()
);

create table if not exists sessions (
  id         text primary key,             -- random token stored in the browser cookie
  user_id    integer not null references users(id) on delete cascade,
  expires_at timestamptz not null
);
create index if not exists sessions_user_idx on sessions(user_id);

create table if not exists problems (
  id                      serial primary key,
  posted_by               integer not null references users(id) on delete cascade,
  title                   text not null,
  who_has_it              text not null,
  what_happens_today      text not null,
  what_solved_looks_like  text not null,
  category                text not null,
  skills                  text[] not null default '{}',   -- skills the problem needs
  owner_contact           text not null default '',
  status                  text not null default 'open',   -- open | in_progress | solved
  created_at              timestamptz not null default now()
);
create index if not exists problems_created_idx on problems(created_at desc);

create table if not exists interests (
  problem_id integer not null references problems(id) on delete cascade,
  user_id    integer not null references users(id) on delete cascade,
  note       text not null default '',
  created_at timestamptz not null default now(),
  primary key (problem_id, user_id)
);

create table if not exists teams (
  id           serial primary key,
  problem_id   integer not null references problems(id) on delete cascade,
  name         text not null,
  needs        text not null default '',     -- e.g. "1 UI designer"
  project_link text not null default '',
  created_by   integer not null references users(id) on delete cascade,
  created_at   timestamptz not null default now()
);

create table if not exists team_members (
  team_id   integer not null references teams(id) on delete cascade,
  user_id   integer not null references users(id) on delete cascade,
  role      text not null default 'member',   -- lead | member
  joined_at timestamptz not null default now(),
  primary key (team_id, user_id)
);

create table if not exists milestones (
  id       serial primary key,
  team_id  integer not null references teams(id) on delete cascade,
  title    text not null,
  due_date date,
  done     boolean not null default false
);

-- ---------------------------------------------------------------
-- Added later. "if not exists" keeps this safe on older databases.
-- ---------------------------------------------------------------

alter table users add column if not exists bio text not null default '';

-- Who owns a milestone, and who actually ticked it off.
alter table milestones add column if not exists assigned_to integer references users(id) on delete set null;
alter table milestones add column if not exists completed_by integer references users(id) on delete set null;
alter table milestones add column if not exists completed_at timestamptz;

-- The problem owner confirms which team's solution worked.
alter table problems add column if not exists solved_team_id integer references teams(id) on delete set null;
alter table problems add column if not exists solved_at timestamptz;
alter table teams add column if not exists owner_confirmed boolean not null default false;
alter table teams add column if not exists owner_feedback text not null default '';

-- Teammates vouching for each other once they've worked together.
create table if not exists endorsements (
  id         serial primary key,
  team_id    integer not null references teams(id) on delete cascade,
  from_user  integer not null references users(id) on delete cascade,
  to_user    integer not null references users(id) on delete cascade,
  note       text not null,
  created_at timestamptz not null default now(),
  unique (team_id, from_user, to_user),
  check (from_user <> to_user)
);
create index if not exists endorsements_to_idx on endorsements(to_user);

create table if not exists notifications (
  id         serial primary key,
  user_id    integer not null references users(id) on delete cascade,
  message    text not null,
  link       text not null default '',
  read_at    timestamptz,
  created_at timestamptz not null default now()
);
create index if not exists notifications_user_idx on notifications(user_id, created_at desc);
