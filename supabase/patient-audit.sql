-- Auditoria simple de pacientes.
-- Ejecutar una sola vez en Supabase SQL Editor.

begin;

alter table public.patients
  add column if not exists created_by uuid references public.profiles(id) on delete set null,
  add column if not exists created_by_name text,
  add column if not exists updated_by uuid references public.profiles(id) on delete set null,
  add column if not exists updated_by_name text;

-- Rellena pacientes existentes usando su owner actual.
update public.patients patients
set
  created_by = coalesce(patients.created_by, patients.owner_id),
  created_by_name = coalesce(patients.created_by_name, profiles.nombre, patients.enfermera),
  updated_by = coalesce(patients.updated_by, patients.owner_id),
  updated_by_name = coalesce(patients.updated_by_name, profiles.nombre, patients.enfermera)
from public.profiles profiles
where profiles.id = patients.owner_id
  and (
    patients.created_by is null
    or patients.created_by_name is null
    or patients.updated_by is null
    or patients.updated_by_name is null
  );

create index if not exists patients_created_by_idx on public.patients(created_by);
create index if not exists patients_updated_by_idx on public.patients(updated_by);

commit;
