-- Verifica que las columnas nuevas existan y que los datos de Salud/Bienestar
-- se esten guardando en pacientes.

-- 1) Debe regresar todas las columnas nuevas.
select column_name, data_type
from information_schema.columns
where table_schema = 'public'
  and table_name = 'patients'
  and column_name in (
    'edad',
    'sexo',
    'pam_o_pcd',
    'enfermedades',
    'exploracion_fisica',
    'diagnostico',
    'tratamiento',
    'ta_sistolica',
    'ta_diastolica',
    'frecuencia_respiratoria',
    'temperatura',
    'escala_glasgow',
    'grupo_riesgo',
    'frecuencia_cardiaca',
    'peso',
    'talla',
    'saturacion',
    'pruebas_horas_ayuno',
    'pruebas_fecha_hora_muestra',
    'lancetas_usadas',
    'glucosa_resultado',
    'glucosa_tiras_usadas',
    'trigliceridos_resultado',
    'trigliceridos_tiras_usadas',
    'colesterol_resultado',
    'colesterol_tiras_usadas',
    'pantorrilla_cm',
    'brazo_cm',
    'cintura_cm',
    'discapacidad',
    'nota'
  )
order by column_name;

-- 2) Cambia el nombre si quieres buscar otro paciente.
-- Si los campos salen null aqui, la informacion no esta guardada en Supabase.
select
  id,
  nombre_completo,
  edad,
  sexo,
  pam_o_pcd,
  enfermedades,
  ta_sistolica,
  ta_diastolica,
  frecuencia_respiratoria,
  temperatura,
  escala_glasgow,
  grupo_riesgo,
  frecuencia_cardiaca,
  peso,
  talla,
  saturacion,
  pruebas_horas_ayuno,
  pruebas_fecha_hora_muestra,
  lancetas_usadas,
  glucosa_resultado,
  glucosa_tiras_usadas,
  trigliceridos_resultado,
  trigliceridos_tiras_usadas,
  colesterol_resultado,
  colesterol_tiras_usadas,
  pantorrilla_cm,
  brazo_cm,
  cintura_cm,
  discapacidad,
  nota,
  actualizado_en
from public.patients
where nombre_completo ilike '%PACIENTE DE PRUEBA%'
order by actualizado_en desc
limit 10;

-- 3) Lista pacientes que SI tienen al menos un campo nuevo guardado.
-- Si no aparece ningun paciente aqui, esos datos no llegaron a guardarse.
select
  id,
  nombre_completo,
  edad,
  sexo,
  ta_sistolica,
  ta_diastolica,
  pruebas_horas_ayuno,
  pruebas_fecha_hora_muestra,
  lancetas_usadas,
  glucosa_resultado,
  glucosa_tiras_usadas,
  trigliceridos_resultado,
  trigliceridos_tiras_usadas,
  colesterol_resultado,
  colesterol_tiras_usadas,
  peso,
  talla,
  pantorrilla_cm,
  brazo_cm,
  cintura_cm,
  actualizado_en
from public.patients
where edad is not null
  or sexo is not null
  or pam_o_pcd is not null
  or enfermedades is not null
  or exploracion_fisica is not null
  or diagnostico is not null
  or tratamiento is not null
  or ta_sistolica is not null
  or ta_diastolica is not null
  or frecuencia_respiratoria is not null
  or temperatura is not null
  or escala_glasgow is not null
  or grupo_riesgo is not null
  or frecuencia_cardiaca is not null
  or peso is not null
  or talla is not null
  or saturacion is not null
  or pruebas_horas_ayuno is not null
  or pruebas_fecha_hora_muestra is not null
  or lancetas_usadas is not null
  or glucosa_resultado is not null
  or glucosa_tiras_usadas is not null
  or trigliceridos_resultado is not null
  or trigliceridos_tiras_usadas is not null
  or colesterol_resultado is not null
  or colesterol_tiras_usadas is not null
  or pantorrilla_cm is not null
  or brazo_cm is not null
  or cintura_cm is not null
  or discapacidad is not null
  or nota is not null
order by actualizado_en desc
limit 50;
