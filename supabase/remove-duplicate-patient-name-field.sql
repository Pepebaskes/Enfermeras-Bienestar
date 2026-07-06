-- Elimina el campo duplicado nombre_persona.
-- El nombre principal del paciente sigue siendo nombre_completo.

begin;

alter table public.patients
  drop column if exists nombre_persona;

notify pgrst, 'reload schema';

commit;
