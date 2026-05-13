import { corsHeaders, errorResponse, jsonResponse } from '../_shared/cors.ts';
import { assertAdmin, getSupabaseAdmin } from '../_shared/adminAuth.ts';

interface UpdateUserBody {
  userId?: string;
  email?: string;
  password?: string;
  nombre?: string;
  ciudad?: string;
  estado?: 'activo' | 'suspendido';
}

Deno.serve(async (request) => {
  if (request.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  if (request.method !== 'POST') {
    return errorResponse('Metodo no permitido', 405);
  }

  try {
    const supabaseAdmin = getSupabaseAdmin();
    await assertAdmin(request, supabaseAdmin);

    const body = await request.json() as UpdateUserBody;
    const userId = body.userId?.trim();

    if (!userId) {
      return errorResponse('userId es obligatorio');
    }

    const authUpdates: Record<string, unknown> = {};
    if (body.email) {
      authUpdates.email = body.email.trim().toLowerCase();
    }
    if (body.password) {
      if (body.password.trim().length < 8) {
        return errorResponse('La contrasena debe tener al menos 8 caracteres');
      }
      authUpdates.password = body.password.trim();
    }
    if (body.nombre || body.ciudad) {
      authUpdates.user_metadata = {
        nombre: body.nombre?.trim(),
        ciudad: body.ciudad?.trim() || null,
        rol: 'enfermera'
      };
    }

    if (Object.keys(authUpdates).length > 0) {
      const { error } = await supabaseAdmin.auth.admin.updateUserById(userId, authUpdates);
      if (error) {
        return errorResponse(error.message, 400);
      }
    }

    const profileUpdates: Record<string, unknown> = {
      actualizado_en: new Date().toISOString()
    };
    if (body.email) profileUpdates.email = body.email.trim().toLowerCase();
    if (body.nombre) profileUpdates.nombre = body.nombre.trim();
    if (body.ciudad !== undefined) profileUpdates.ciudad = body.ciudad.trim() || null;
    if (body.estado) profileUpdates.estado = body.estado;

    const { data: profile, error: profileError } = await supabaseAdmin
      .from('profiles')
      .update(profileUpdates)
      .eq('id', userId)
      .eq('rol', 'enfermera')
      .select('*')
      .single();

    if (profileError) {
      return errorResponse(profileError.message, 400);
    }

    return jsonResponse({ profile });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Error inesperado';
    return errorResponse(message, 401);
  }
});
