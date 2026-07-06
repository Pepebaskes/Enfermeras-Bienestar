-- Campos Salud Casa por Casa / Bienestar para pacientes.
-- Ejecutar una sola vez en Supabase SQL Editor.

begin;

alter table public.patients
  add column if not exists edad numeric,
  add column if not exists pam_o_pcd text,
  add column if not exists enfermedades text,
  add column if not exists exploracion_fisica text,
  add column if not exists diagnostico text,
  add column if not exists tratamiento text,
  add column if not exists ta_sistolica numeric,
  add column if not exists ta_diastolica numeric,
  add column if not exists frecuencia_respiratoria numeric,
  add column if not exists temperatura numeric,
  add column if not exists escala_glasgow numeric,
  add column if not exists grupo_riesgo text,
  add column if not exists frecuencia_cardiaca numeric,
  add column if not exists peso numeric,
  add column if not exists talla numeric,
  add column if not exists saturacion numeric,
  add column if not exists glucosa_horas_ayuno numeric,
  add column if not exists glucosa_resultado numeric,
  add column if not exists glucosa_fecha_hora_muestra timestamptz,
  add column if not exists trigliceridos_horas_ayuno numeric,
  add column if not exists trigliceridos_resultado numeric,
  add column if not exists trigliceridos_fecha_hora_muestra timestamptz,
  add column if not exists colesterol_horas_ayuno numeric,
  add column if not exists colesterol_resultado numeric,
  add column if not exists colesterol_fecha_hora_muestra timestamptz,
  add column if not exists pantorrilla_cm numeric,
  add column if not exists brazo_cm numeric,
  add column if not exists cintura_cm numeric,
  add column if not exists discapacidad text,
  add column if not exists nota text;

create index if not exists patients_fecha_visita_idx on public.patients(fecha_visita);
create index if not exists patients_numero_visita_idx on public.patients(numero_visita);

notify pgrst, 'reload schema';

commit;
