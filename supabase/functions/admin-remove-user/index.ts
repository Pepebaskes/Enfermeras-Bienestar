import { corsHeaders, errorResponse, jsonResponse } from '../_shared/cors.ts';
import { assertAdmin, getSupabaseAdmin } from '../_shared/adminAuth.ts';

interface RemoveUserBody {
  userId?: string;
  hardDelete?: boolean;
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

    const body = await request.json() as RemoveUserBody;
    const userId = body.userId?.trim();

    if (!userId) {
      return errorResponse('userId es obligatorio');
    }

    if (body.hardDelete) {
      const { error } = await supabaseAdmin.auth.admin.deleteUser(userId);
      if (error) {
        return errorResponse(error.message, 400);
      }

      return jsonResponse({ deleted: true });
    }

    const { data: profile, error } = await supabaseAdmin
      .from('profiles')
      .update({
        estado: 'suspendido',
        actualizado_en: new Date().toISOString()
      })
      .eq('id', userId)
      .eq('rol', 'enfermera')
      .select('*')
      .single();

    if (error) {
      return errorResponse(error.message, 400);
    }

    return jsonResponse({ suspended: true, profile });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Error inesperado';
    return errorResponse(message, 401);
  }
});
