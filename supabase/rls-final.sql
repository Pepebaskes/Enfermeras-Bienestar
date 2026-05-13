-- RLS final para modulo-enfermeria.
-- Ejecutar en Supabase SQL Editor con un usuario owner/admin del proyecto.

begin;

-- Helper seguro: evita repetir subconsultas y evita recursion de RLS en policies.
create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.profiles
    where id = auth.uid()
      and rol = 'admin'
      and estado = 'activo'
  );
$$;

create or replace function public.is_active_nurse()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.profiles
    where id = auth.uid()
      and rol = 'enfermera'
      and estado = 'activo'
  );
$$;

create or replace function public.has_active_subscription(target_user_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.subscriptions
    where user_id = target_user_id
      and estado = 'activo'
      and fecha_vencimiento is not null
      and fecha_vencimiento >= current_date
  );
$$;

revoke all on function public.is_admin() from public;
revoke all on function public.is_active_nurse() from public;
revoke all on function public.has_active_subscription(uuid) from public;
grant execute on function public.is_admin() to authenticated;
grant execute on function public.is_active_nurse() to authenticated;
grant execute on function public.has_active_subscription(uuid) to authenticated;

alter table public.profiles enable row level security;
alter table public.subscriptions enable row level security;
alter table public.patients enable row level security;

-- Limpia policies anteriores para que no queden reglas permisivas antiguas.
do $$
declare
  policy_record record;
begin
  for policy_record in
    select schemaname, tablename, policyname
    from pg_policies
    where schemaname = 'public'
      and tablename in ('profiles', 'subscriptions', 'patients')
  loop
    execute format(
      'drop policy if exists %I on %I.%I',
      policy_record.policyname,
      policy_record.schemaname,
      policy_record.tablename
    );
  end loop;
end $$;

-- PROFILES
-- El usuario puede leer su propio perfil aunque este suspendido, para mostrar bloqueo.
create policy "profiles_select_own_or_admin"
on public.profiles
for select
to authenticated
using (
  id = auth.uid()
  or public.is_admin()
);

-- Solo admin puede modificar perfiles desde el navegador.
create policy "profiles_admin_insert"
on public.profiles
for insert
to authenticated
with check (public.is_admin());

create policy "profiles_admin_update"
on public.profiles
for update
to authenticated
using (public.is_admin())
with check (public.is_admin());

create policy "profiles_admin_delete"
on public.profiles
for delete
to authenticated
using (public.is_admin());

-- SUBSCRIPTIONS
-- La enfermera puede leer su propia suscripcion aunque este vencida/suspendida.
create policy "subscriptions_select_own_or_admin"
on public.subscriptions
for select
to authenticated
using (
  user_id = auth.uid()
  or public.is_admin()
);

create policy "subscriptions_admin_insert"
on public.subscriptions
for insert
to authenticated
with check (public.is_admin());

create policy "subscriptions_admin_update"
on public.subscriptions
for update
to authenticated
using (public.is_admin())
with check (public.is_admin());

create policy "subscriptions_admin_delete"
on public.subscriptions
for delete
to authenticated
using (public.is_admin());

-- PATIENTS
-- Admin ve todos. Enfermera solo ve sus pacientes si esta activa y con mensualidad vigente.
create policy "patients_select_owner_active_or_admin"
on public.patients
for select
to authenticated
using (
  public.is_admin()
  or (
    owner_id = auth.uid()
    and public.is_active_nurse()
    and public.has_active_subscription(auth.uid())
  )
);

create policy "patients_insert_owner_active"
on public.patients
for insert
to authenticated
with check (
  owner_id = auth.uid()
  and public.is_active_nurse()
  and public.has_active_subscription(auth.uid())
);

create policy "patients_update_owner_active_or_admin"
on public.patients
for update
to authenticated
using (
  public.is_admin()
  or (
    owner_id = auth.uid()
    and public.is_active_nurse()
    and public.has_active_subscription(auth.uid())
  )
)
with check (
  public.is_admin()
  or (
    owner_id = auth.uid()
    and public.is_active_nurse()
    and public.has_active_subscription(auth.uid())
  )
);

-- Por seguridad, borrar pacientes queda reservado al admin.
create policy "patients_admin_delete"
on public.patients
for delete
to authenticated
using (public.is_admin());

commit;
