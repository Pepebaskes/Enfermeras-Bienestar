# RLS final de Supabase

## Archivo

El SQL final esta en:

```txt
supabase/rls-final.sql
```

Se ejecuta desde Supabase:

1. Abre **SQL Editor**.
2. Crea un **New query**.
3. Pega todo el contenido de `supabase/rls-final.sql`.
4. Ejecuta el query.

## Que protege

### `profiles`

- Cada usuario puede leer su propio perfil.
- El admin activo puede leer, crear, editar y borrar perfiles.
- Una enfermera no puede ver perfiles de otras enfermeras.

### `subscriptions`

- Cada enfermera puede leer su propia suscripcion, incluso vencida o suspendida.
- Solo admin puede crear, editar o borrar suscripciones.

### `patients`

- Admin activo puede leer y editar todos los pacientes.
- Enfermera solo puede leer, crear y editar sus propios pacientes cuando:
  - `profiles.rol = enfermera`
  - `profiles.estado = activo`
  - tiene una suscripcion activa
  - `subscriptions.fecha_vencimiento >= current_date`
- Borrar pacientes queda reservado al admin.

## Pruebas recomendadas

1. Entra como admin y confirma que el panel admin carga perfiles, suscripciones y pacientes.
2. Entra como enfermera activa y con mensualidad vigente. Debe cargar su modulo normal.
3. Suspende esa enfermera desde admin. En su navegador debe quedar en pantalla de acceso pausado.
4. Reactivala, pero deja sin mensualidad o vencida. Debe seguir pausada.
5. Usa **Activar acceso** o **Mensualidad pagada**. Debe volver a entrar.
6. Confirma que una enfermera no vea pacientes de otra enfermera.

## Nota importante

Las Edge Functions usan `service_role`, por eso pueden crear, actualizar o eliminar usuarios aunque RLS este activo. Eso es correcto: solo las funciones protegidas por validacion de admin deben usar esa llave.
