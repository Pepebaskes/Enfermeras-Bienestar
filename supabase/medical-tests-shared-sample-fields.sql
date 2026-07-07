-- Unifica las pruebas medicas para guardar una sola hora de ayuno
-- y una sola fecha/hora de muestra para glucosa, trigliceridos y colesterol.
--
-- Ejecutar una sola vez en Supabase SQL Editor.

begin;

alter table public.patients
  add column if not exists pruebas_horas_ayuno numeric,
  add column if not exists pruebas_fecha_hora_muestra timestamptz;

-- Conserva datos ya capturados. Toma el primer valor disponible entre
-- glucosa, trigliceridos y colesterol, si esas columnas viejas existen.
do $$
declare
  horas_columns text[] := array['pruebas_horas_ayuno'];
  fecha_columns text[] := array['pruebas_fecha_hora_muestra'];
  old_column_name text;
begin
  foreach old_column_name in array array[
    'glucosa_horas_ayuno',
    'trigliceridos_horas_ayuno',
    'colesterol_horas_ayuno'
  ]
  loop
    if exists (
      select 1
      from information_schema.columns
      where table_schema = 'public'
        and table_name = 'patients'
        and columns.column_name = old_column_name
    ) then
      horas_columns := array_append(horas_columns, old_column_name);
    end if;
  end loop;

  foreach old_column_name in array array[
    'glucosa_fecha_hora_muestra',
    'trigliceridos_fecha_hora_muestra',
    'colesterol_fecha_hora_muestra'
  ]
  loop
    if exists (
      select 1
      from information_schema.columns
      where table_schema = 'public'
        and table_name = 'patients'
        and columns.column_name = old_column_name
    ) then
      fecha_columns := array_append(fecha_columns, old_column_name);
    end if;
  end loop;

  execute format(
    'update public.patients
     set pruebas_horas_ayuno = coalesce(%s),
         pruebas_fecha_hora_muestra = coalesce(%s)
     where pruebas_horas_ayuno is null
        or pruebas_fecha_hora_muestra is null',
    array_to_string(horas_columns, ', '),
    array_to_string(fecha_columns, ', ')
  );
end $$;

alter table public.patients
  drop column if exists glucosa_horas_ayuno,
  drop column if exists glucosa_fecha_hora_muestra,
  drop column if exists trigliceridos_horas_ayuno,
  drop column if exists trigliceridos_fecha_hora_muestra,
  drop column if exists colesterol_horas_ayuno,
  drop column if exists colesterol_fecha_hora_muestra;

notify pgrst, 'reload schema';

commit;
