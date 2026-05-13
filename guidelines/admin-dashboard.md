# Panel de administracion

## Objetivo

El panel admin permite controlar enfermeras, mensualidades y pacientes sin mezclar los datos de cada enfermera.

## Secciones principales

- **Enfermeras:** permite buscar por nombre, correo o ciudad, filtrar por estado y editar datos basicos.
- **Suscripciones:** permite revisar mensualidades vencidas, por vencer, al corriente o sin registro.
- **Pacientes por enfermera:** muestra solo los pacientes de la enfermera seleccionada.
- **Respaldos:** exporta pacientes por enfermera o de todas las enfermeras, con filtro opcional por fecha de actualizacion.
- **Altas y bajas:** permite crear usuarios, suspender/reactivar accesos, cambiar contrasenas temporales y eliminar usuarios.
- **Auditoria simple:** los pacientes guardan quien los creo y quien los edito por ultima vez.

## Mensualidad pagada

El boton **Mensualidad pagada** hace tres cosas:

1. Registra la fecha de pago de hoy en `profiles.fecha_pago`.
2. Activa el perfil de la enfermera en `profiles.estado`.
3. Crea o actualiza la fila de `subscriptions` con vencimiento 30 dias despues.

Si la enfermera todavia tenia dias disponibles, el sistema suma los 30 dias desde su fecha de vencimiento actual. Si ya estaba vencida, suma los 30 dias desde hoy.

## Edicion de enfermeras

La edicion de nombre, correo, ciudad y estado usa la Edge Function `admin-update-user`, porque esos datos pueden afectar tanto Auth como `profiles`.

## Recomendaciones de prueba

1. Entra como admin en un navegador.
2. Entra como enfermera en otro navegador o modo incognito.
3. Prueba buscar una enfermera por nombre o correo.
4. Edita ciudad o estado y confirma que se actualice en Supabase.
5. En **Suscripciones**, usa **Mensualidad pagada** y confirma:
   - `profiles.fecha_pago`
   - `profiles.estado`
   - `subscriptions.fecha_vencimiento`
6. En **Pacientes por enfermera**, cambia la enfermera seleccionada y confirma que no se mezclen pacientes.
7. En **Respaldos**, exporta una enfermera y confirma que el CSV abra correctamente.
8. Exporta **Todas las enfermeras** y confirma que no se trabe el navegador.

## Auditoria simple de pacientes

Antes de probar auditoria, ejecuta en Supabase SQL Editor:

```txt
supabase/patient-audit.sql
```

Igual que con RLS, no pegues la ruta. Abre el archivo, copia todo el SQL y pegalo completo en Supabase.

Esto agrega a `patients`:

- `created_by`
- `created_by_name`
- `updated_by`
- `updated_by_name`

La app guarda esos datos al crear o editar pacientes. El admin puede ver **Actualizado por** y **Ultima actualizacion** en la tabla de pacientes por enfermera, y los respaldos CSV incluyen esas columnas.

## Bloqueo de acceso de enfermeras

Al iniciar sesion, la app valida el estado del perfil y su mensualidad:

- Si `profiles.estado` no es `activo`, la enfermera entra a una pantalla de acceso pausado.
- Si no existe una fila en `subscriptions`, tambien queda pausada.
- Si `subscriptions.estado` no es `activo`, queda pausada.
- Si `subscriptions.fecha_vencimiento` ya paso, queda pausada.
- Si todo esta activo y vigente, carga sus pacientes normalmente.

El bloqueo esta en el frontend para mejorar la experiencia, pero la seguridad fuerte debe seguir en Supabase con RLS. Las policies deben impedir que una enfermera suspendida o vencida lea/escriba pacientes aunque intente saltarse la interfaz.
