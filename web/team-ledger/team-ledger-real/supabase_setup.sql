-- Team Ledger: Supabase SQL setup
-- Run this once in Supabase Dashboard → SQL Editor.

create extension if not exists pgcrypto;

-- 1) Core tables
create table if not exists public.professor_allowlist (
  email text primary key,
  display_name text,
  created_at timestamptz not null default now()
);

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  display_name text not null,
  role text not null check (role in ('student','professor')),
  created_at timestamptz not null default now()
);

create table if not exists public.courses (
  id uuid primary key default gen_random_uuid(),
  professor_id uuid not null references public.profiles(id) on delete restrict,
  name text not null check (char_length(name) between 1 and 100),
  code text not null check (char_length(code) between 1 and 30),
  term text not null check (char_length(term) between 1 and 50),
  join_code text not null unique default upper(substr(replace(gen_random_uuid()::text,'-',''),1,6)),
  created_at timestamptz not null default now(),
  unique(professor_id, code, term)
);

create table if not exists public.course_members (
  course_id uuid not null references public.courses(id) on delete cascade,
  student_id uuid not null references public.profiles(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key(course_id, student_id)
);

create table if not exists public.projects (
  id uuid primary key default gen_random_uuid(),
  course_id uuid not null references public.courses(id) on delete cascade,
  name text not null check (char_length(name) between 1 and 140),
  description text not null default '',
  deadline date,
  created_at timestamptz not null default now()
);

create table if not exists public.teams (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects(id) on delete cascade,
  name text not null check (char_length(name) between 1 and 80),
  join_code text not null unique default upper(substr(replace(gen_random_uuid()::text,'-',''),1,6)),
  created_by uuid not null references public.profiles(id) on delete restrict,
  created_at timestamptz not null default now(),
  unique(project_id, name)
);

create table if not exists public.team_members (
  team_id uuid not null references public.teams(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  member_role text not null default '팀원' check (char_length(member_role) between 1 and 60),
  joined_at timestamptz not null default now(),
  primary key(team_id, user_id)
);

create table if not exists public.tasks (
  id uuid primary key default gen_random_uuid(),
  team_id uuid not null references public.teams(id) on delete cascade,
  title text not null check (char_length(title) between 1 and 160),
  description text not null default '',
  assignee_id uuid references public.profiles(id) on delete set null,
  due_date date,
  status text not null default 'todo' check (status in ('todo','doing','done')),
  priority text not null default 'medium' check (priority in ('low','medium','high')),
  created_by uuid not null references public.profiles(id) on delete restrict,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- 2) Safe signup profile creation.
-- Professors must be pre-registered in professor_allowlist by an administrator.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
declare
  requested_role text := coalesce(new.raw_user_meta_data ->> 'requested_role', 'student');
  final_role text := 'student';
  final_name text := coalesce(nullif(trim(new.raw_user_meta_data ->> 'display_name'), ''), split_part(new.email, '@', 1));
begin
  if requested_role = 'professor' and exists (
    select 1 from public.professor_allowlist where lower(email) = lower(new.email)
  ) then
    final_role := 'professor';
  end if;

  insert into public.profiles (id, email, display_name, role)
  values (new.id, lower(new.email), final_name, final_role);
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute procedure public.handle_new_user();

create or replace function public.touch_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists tasks_updated_at on public.tasks;
create trigger tasks_updated_at before update on public.tasks
for each row execute procedure public.touch_updated_at();

-- 3) Access helper functions
create or replace function public.is_course_professor(target_course uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from public.courses c
    where c.id = target_course and c.professor_id = auth.uid()
  );
$$;

create or replace function public.is_course_student(target_course uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from public.course_members cm
    where cm.course_id = target_course and cm.student_id = auth.uid()
  );
$$;

create or replace function public.is_team_member(target_team uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from public.team_members tm
    where tm.team_id = target_team and tm.user_id = auth.uid()
  );
$$;

create or replace function public.is_team_course_professor(target_team uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (
    select 1
    from public.teams t
    join public.projects p on p.id = t.project_id
    join public.courses c on c.id = p.course_id
    where t.id = target_team and c.professor_id = auth.uid()
  );
$$;

-- 4) RLS policies
alter table public.professor_allowlist enable row level security;
alter table public.profiles enable row level security;
alter table public.courses enable row level security;
alter table public.course_members enable row level security;
alter table public.projects enable row level security;
alter table public.teams enable row level security;
alter table public.team_members enable row level security;
alter table public.tasks enable row level security;

-- Clear only this app's policies when the script is re-run.
drop policy if exists "profiles: signed-in read" on public.profiles;
drop policy if exists "profiles: self update" on public.profiles;
drop policy if exists "courses: readable by participants" on public.courses;
drop policy if exists "courses: professors create" on public.courses;
drop policy if exists "courses: owners update" on public.courses;
drop policy if exists "course members: visible to course participants" on public.course_members;
drop policy if exists "course members: students join by code RPC only" on public.course_members;
drop policy if exists "projects: readable by participants" on public.projects;
drop policy if exists "projects: course professors write" on public.projects;
drop policy if exists "teams: readable by participants" on public.teams;
drop policy if exists "teams: students create in enrolled course" on public.teams;
drop policy if exists "team members: visible to team/course professor" on public.team_members;
drop policy if exists "tasks: readable by team/course professor" on public.tasks;
drop policy if exists "tasks: team members create" on public.tasks;
drop policy if exists "tasks: team members update" on public.tasks;
drop policy if exists "tasks: team members delete" on public.tasks;

create policy "profiles: signed-in read" on public.profiles for select to authenticated using (true);
create policy "profiles: self update" on public.profiles for update to authenticated using (id = auth.uid()) with check (id = auth.uid() and role = (select role from public.profiles where id = auth.uid()));

create policy "courses: readable by participants" on public.courses for select to authenticated using (professor_id = auth.uid() or public.is_course_student(id));
create policy "courses: professors create" on public.courses for insert to authenticated with check (professor_id = auth.uid() and exists(select 1 from public.profiles where id = auth.uid() and role = 'professor'));
create policy "courses: owners update" on public.courses for update to authenticated using (professor_id = auth.uid()) with check (professor_id = auth.uid());

create policy "course members: visible to course participants" on public.course_members for select to authenticated using (student_id = auth.uid() or public.is_course_professor(course_id));

create policy "projects: readable by participants" on public.projects for select to authenticated using (public.is_course_professor(course_id) or public.is_course_student(course_id));
create policy "projects: course professors write" on public.projects for all to authenticated using (public.is_course_professor(course_id)) with check (public.is_course_professor(course_id));

create policy "teams: readable by participants" on public.teams for select to authenticated using (
  public.is_team_member(id) or public.is_team_course_professor(id) or exists (
    select 1 from public.projects p where p.id = project_id and public.is_course_student(p.course_id)
  )
);
create policy "teams: students create in enrolled course" on public.teams for insert to authenticated with check (
  created_by = auth.uid() and exists (
    select 1 from public.projects p where p.id = project_id and public.is_course_student(p.course_id)
  )
);

create policy "team members: visible to team/course professor" on public.team_members for select to authenticated using (public.is_team_member(team_id) or public.is_team_course_professor(team_id));

create policy "tasks: readable by team/course professor" on public.tasks for select to authenticated using (public.is_team_member(team_id) or public.is_team_course_professor(team_id));
create policy "tasks: team members create" on public.tasks for insert to authenticated with check (public.is_team_member(team_id) and created_by = auth.uid() and (assignee_id is null or exists(select 1 from public.team_members tm where tm.team_id = team_id and tm.user_id = assignee_id)));
create policy "tasks: team members update" on public.tasks for update to authenticated using (public.is_team_member(team_id)) with check (public.is_team_member(team_id) and (assignee_id is null or exists(select 1 from public.team_members tm where tm.team_id = team_id and tm.user_id = assignee_id)));
create policy "tasks: team members delete" on public.tasks for delete to authenticated using (public.is_team_member(team_id));

-- 5) RPCs for join operations. Direct insert is intentionally not allowed.
create or replace function public.join_course_by_code(input_code text)
returns public.courses
language plpgsql security definer set search_path = public
as $$
declare target public.courses;
begin
  if not exists(select 1 from public.profiles where id = auth.uid() and role = 'student') then
    raise exception '학생 계정만 수업에 참여할 수 있습니다.';
  end if;
  select * into target from public.courses where upper(join_code) = upper(trim(input_code));
  if target.id is null then raise exception '수업 참가 코드를 찾을 수 없습니다.'; end if;
  insert into public.course_members(course_id, student_id) values(target.id, auth.uid()) on conflict do nothing;
  return target;
end;
$$;

create or replace function public.create_team_with_leader(input_project uuid, input_name text, input_role text)
returns public.teams
language plpgsql security definer set search_path = public
as $$
declare target public.teams;
begin
  if not exists(select 1 from public.projects p where p.id = input_project and public.is_course_student(p.course_id)) then
    raise exception '이 프로젝트에서 팀을 만들 권한이 없습니다.';
  end if;
  insert into public.teams(project_id, name, created_by)
  values(input_project, trim(input_name), auth.uid())
  returning * into target;
  insert into public.team_members(team_id, user_id, member_role)
  values(target.id, auth.uid(), coalesce(nullif(trim(input_role), ''), '팀장'));
  return target;
end;
$$;

create or replace function public.join_team_by_code(input_code text, input_role text)
returns public.teams
language plpgsql security definer set search_path = public
as $$
declare target public.teams;
begin
  select t.* into target
  from public.teams t join public.projects p on p.id=t.project_id
  where upper(t.join_code) = upper(trim(input_code)) and public.is_course_student(p.course_id);
  if target.id is null then raise exception '참가 가능한 팀 코드를 찾을 수 없습니다.'; end if;
  insert into public.team_members(team_id, user_id, member_role)
  values(target.id, auth.uid(), coalesce(nullif(trim(input_role), ''), '팀원'))
  on conflict(team_id, user_id) do update set member_role = excluded.member_role;
  return target;
end;
$$;

revoke all on function public.join_course_by_code(text) from public;
revoke all on function public.create_team_with_leader(uuid,text,text) from public;
revoke all on function public.join_team_by_code(text,text) from public;
grant execute on function public.join_course_by_code(text) to authenticated;
grant execute on function public.create_team_with_leader(uuid,text,text) to authenticated;
grant execute on function public.join_team_by_code(text,text) to authenticated;

-- Before creating the first professor account, add its email here and then sign up:
-- insert into public.professor_allowlist(email, display_name) values ('professor@example.edu', '홍길동') on conflict do nothing;
