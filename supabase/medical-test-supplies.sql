-- Agrega contadores de insumos usados en pruebas medicas.
-- Lancetas queda como contador general de la toma.
-- Tiras se registran por prueba: glucosa, trigliceridos y colesterol.
-- Ejecutar una sola vez en Supabase SQL Editor.

begin;

alter table public.patients
  add column if not exists lancetas_usadas integer,
  add column if not exists glucosa_tiras_usadas integer,
  add column if not exists trigliceridos_tiras_usadas integer,
  add column if not exists colesterol_tiras_usadas integer;

alter table public.patients
  alter column lancetas_usadas type integer using round(lancetas_usadas)::integer,
  alter column glucosa_tiras_usadas type integer using round(glucosa_tiras_usadas)::integer,
  alter column trigliceridos_tiras_usadas type integer using round(trigliceridos_tiras_usadas)::integer,
  alter column colesterol_tiras_usadas type integer using round(colesterol_tiras_usadas)::integer;

-- Si ya existia el contador global tiras_usadas, lo conserva como valor inicial
-- para glucosa antes de retirar esa columna general.
do $$
begin
  if exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'patients'
      and column_name = 'tiras_usadas'
  ) then
    update public.patients
    set glucosa_tiras_usadas = coalesce(glucosa_tiras_usadas, round(tiras_usadas)::integer)
    where tiras_usadas is not null;

    alter table public.patients
      drop column if exists tiras_usadas;
  end if;
end $$;

do $$
declare
  constraint_item record;
begin
  for constraint_item in
    select constraint_name, column_name
    from (values
      ('patients_lancetas_usadas_nonnegative', 'lancetas_usadas'),
      ('patients_glucosa_tiras_usadas_nonnegative', 'glucosa_tiras_usadas'),
      ('patients_trigliceridos_tiras_usadas_nonnegative', 'trigliceridos_tiras_usadas'),
      ('patients_colesterol_tiras_usadas_nonnegative', 'colesterol_tiras_usadas')
    ) as constraints(constraint_name, column_name)
  loop
    if not exists (
      select 1
      from pg_constraint
      where conname = constraint_item.constraint_name
    ) then
      execute format(
        'alter table public.patients add constraint %I check (%I is null or %I >= 0)',
        constraint_item.constraint_name,
        constraint_item.column_name,
        constraint_item.column_name
      );
    end if;
  end loop;
end $$;

notify pgrst, 'reload schema';

commit;
