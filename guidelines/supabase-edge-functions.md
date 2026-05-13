# Supabase Edge Functions

Estas funciones permiten que el panel admin cree, actualice y quite usuarios de Supabase Auth sin exponer la `service_role key` en el navegador.

## Funciones

- `admin-create-user`: crea usuario Auth, crea `profiles` y opcionalmente crea `subscriptions`.
- `admin-update-user`: cambia datos de Auth, contrasena temporal y/o `profiles.estado`.
- `admin-remove-user`: por defecto suspende; con `hardDelete = true` elimina Auth y puede borrar datos por cascada.

Cada funcion valida:

1. que la llamada venga con sesion autenticada
2. que el usuario exista en `profiles`
3. que `rol = admin`
4. que `estado = activo`

## Secretos necesarios

En Supabase, configura estos secretos para Edge Functions:

```text
SUPABASE_URL=https://tu-proyecto.supabase.co
SUPABASE_SERVICE_ROLE_KEY=tu_service_role_key
```

La `SUPABASE_SERVICE_ROLE_KEY` solo va en Supabase Functions. Nunca va en `.env.local` del frontend.

## Despliegue con Supabase CLI

Desde la raiz del proyecto:

```powershell
supabase login
supabase link --project-ref vqcrliecaajzaimpkwnp
supabase secrets set SUPABASE_URL=https://vqcrliecaajzaimpkwnp.supabase.co
supabase secrets set SUPABASE_SERVICE_ROLE_KEY=TU_SERVICE_ROLE_KEY
supabase functions deploy admin-create-user
supabase functions deploy admin-update-user
supabase functions deploy admin-remove-user
```

## Prueba

1. Entra a la app con un usuario `admin`.
2. Abre `Altas y bajas`.
3. Crea una enfermera con correo y contrasena temporal.
4. Revisa Supabase `Authentication > Users`.
5. Revisa `Table Editor > profiles`.

Si la funcion responde con error de permisos, revisa que el usuario admin tenga `profiles.rol = admin` y `profiles.estado = activo`.
