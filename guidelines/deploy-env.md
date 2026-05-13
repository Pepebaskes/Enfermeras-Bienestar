# Variables de entorno para produccion

## Variables necesarias

En Vercel o Netlify agrega:

```env
VITE_SUPABASE_URL=https://tu-proyecto.supabase.co
VITE_SUPABASE_ANON_KEY=tu_publishable_key
```

## Donde encontrarlas en Supabase

1. Entra a Supabase.
2. Abre tu proyecto.
3. Ve a **Project Settings**.
4. Entra a **API**.
5. Copia:
   - **Project URL** para `VITE_SUPABASE_URL`
   - **Publishable key** para `VITE_SUPABASE_ANON_KEY`

## Reglas importantes

- `VITE_SUPABASE_URL` no debe llevar `/rest/v1`.
- La `Publishable key` puede ir en frontend si RLS esta activo.
- La `Secret key` o `service_role` nunca debe ir en Vercel/Netlify como variable `VITE_*`.
- `.env.local` solo se usa en tu computadora y no se sube al repositorio.

## Vercel

1. Project Settings.
2. Environment Variables.
3. Agrega `VITE_SUPABASE_URL`.
4. Agrega `VITE_SUPABASE_ANON_KEY`.
5. Redeploy.

## Netlify

1. Site configuration.
2. Environment variables.
3. Agrega `VITE_SUPABASE_URL`.
4. Agrega `VITE_SUPABASE_ANON_KEY`.
5. Deploy again.

## Supabase Auth

Cuando ya tengas el dominio de produccion, agregalo en:

**Supabase > Authentication > URL Configuration**

Usa la URL completa, por ejemplo:

```txt
https://tu-dominio.vercel.app
```

## Build limpio

Antes de subir cambios, ejecuta:

```bash
npm run build
```

Si quieres probar el resultado final en tu computadora:

```bash
npm run preview
```

El warning de Vite sobre chunks mayores a 500 kB no bloquea el despliegue. Significa que algun archivo JavaScript final es grande; se puede optimizar despues con carga diferida, pero no impide publicar.
