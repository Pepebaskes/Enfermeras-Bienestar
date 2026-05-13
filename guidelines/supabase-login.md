# Supabase Login

## Variables de entorno

Las llaves reales van en `.env.local`, en la raiz del proyecto:

```env
VITE_SUPABASE_URL=https://tu-proyecto.supabase.co
VITE_SUPABASE_ANON_KEY=tu_publishable_key
```

`.env.local` no se sube al repositorio porque esta en `.gitignore`.

## Cliente de Supabase

El archivo `src/app/services/supabaseClient.ts` crea una sola instancia:

```ts
export const supabase = createClient(supabaseUrl, supabaseAnonKey);
```

Todos los servicios deben reutilizar esa instancia.

## Perfil del usuario

Supabase Auth guarda correo y contrasena. La tabla `profiles` guarda datos de la app:

- `rol`: `admin` o `enfermera`
- `estado`: `activo` o `suspendido`
- `nombre`
- `ciudad`

La app deja entrar solo si `estado` es `activo`.

## Flujo de login

1. `LoginPage.tsx` muestra correo y contrasena.
2. `authService.login()` llama a `supabase.auth.signInWithPassword()`.
3. Si Supabase acepta las credenciales, `authService.getCurrentProfile()` busca el perfil en `profiles`.
4. Si no existe perfil o esta suspendido, cierra la sesion y muestra error.
5. Si esta activo, `App.tsx` permite entrar.

## Cierre de sesion

`App.tsx` usa `authService.logout()` para cerrar la sesion y volver al login.

## Siguiente paso

La app carga pacientes desde `patients`, usando `owner_id` para que cada enfermera vea solo sus registros.

## Panel admin

Si `profiles.rol` es `admin`, `App.tsx` muestra `AdminDashboardPage` en lugar del modulo de enfermera.

El panel admin permite:

- ver resumen de perfiles, enfermeras activas/suspendidas y pacientes
- suspender/reactivar enfermeras desde `profiles.estado`
- editar registros de suscripcion en `subscriptions`
- ver pacientes separados por enfermera

Crear o borrar usuarios reales de Supabase Auth no debe hacerse desde el navegador. Para eso se necesitan Edge Functions con `service_role` guardada como secreto del servidor.

Las Edge Functions ya estan documentadas en `guidelines/supabase-edge-functions.md`.
