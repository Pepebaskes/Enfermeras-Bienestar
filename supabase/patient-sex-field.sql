-- Agrega sexo al formato Salud/Bienestar.
-- El IMC no se guarda como columna: se calcula automaticamente desde peso y talla.

begin;

alter table public.patients
  add column if not exists sexo text;

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'patients_sexo_allowed_values'
  ) then
    alter table public.patients
      add constraint patients_sexo_allowed_values
      check (sexo is null or sexo in ('femenino', 'masculino', 'otro'));
  end if;
end $$;

notify pgrst, 'reload schema';

commit;
