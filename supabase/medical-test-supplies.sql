-- Agrega contadores de insumos usados en pruebas medicas.
-- Ejecutar una sola vez en Supabase SQL Editor.

begin;

alter table public.patients
  add column if not exists lancetas_usadas integer,
  add column if not exists tiras_usadas integer;

alter table public.patients
  alter column lancetas_usadas type integer using round(lancetas_usadas)::integer,
  alter column tiras_usadas type integer using round(tiras_usadas)::integer;

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'patients_lancetas_usadas_nonnegative'
  ) then
    alter table public.patients
      add constraint patients_lancetas_usadas_nonnegative
      check (lancetas_usadas is null or lancetas_usadas >= 0);
  end if;

  if not exists (
    select 1
    from pg_constraint
    where conname = 'patients_tiras_usadas_nonnegative'
  ) then
    alter table public.patients
      add constraint patients_tiras_usadas_nonnegative
      check (tiras_usadas is null or tiras_usadas >= 0);
  end if;
end $$;

notify pgrst, 'reload schema';

commit;
