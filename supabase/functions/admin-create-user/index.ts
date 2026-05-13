import { corsHeaders, errorResponse, jsonResponse } from '../_shared/cors.ts';
import { assertAdmin, getSupabaseAdmin } from '../_shared/adminAuth.ts';

interface CreateUserBody {
  email?: string;
  password?: string;
  nombre?: string;
  ciudad?: string;
  estado?: 'activo' | 'suspendido';
  fecha_vencimiento?: string;
  notas?: string;
}

const normalizeEmail = (email?: string) => email?.trim().toLowerCase();

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

    const body = await request.json() as CreateUserBody;
    const email = normalizeEmail(body.email);
    const password = body.password?.trim();
    const nombre = body.nombre?.trim();
    const ciudad = body.ciudad?.trim() || null;
    const estado = body.estado || 'activo';

    if (!email || !password || !nombre) {
      return errorResponse('Correo, contrasena y nombre son obligatorios');
    }

    if (password.length < 8) {
      return errorResponse('La contrasena temporal debe tener al menos 8 caracteres');
    }

    const { data: createdUser, error: createError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: {
        nombre,
        ciudad,
        rol: 'enfermera'
      }
    });

    if (createError || !createdUser.user) {
      return errorResponse(createError?.message || 'No se pudo crear el usuario', 400);
    }

    const userId = createdUser.user.id;

    const { data: profile, error: profileError } = await supabaseAdmin
      .from('profiles')
      .insert({
        id: userId,
        email,
        nombre,
        ciudad,
        rol: 'enfermera',
        estado
      })
      .select('*')
      .single();

    if (profileError) {
      await supabaseAdmin.auth.admin.deleteUser(userId);
      return errorResponse(profileError.message, 400);
    }

    let subscription = null;
    if (body.fecha_vencimiento) {
      const { data, error } = await supabaseAdmin
        .from('subscriptions')
        .insert({
          user_id: userId,
          estado,
          fecha_inicio: new Date().toISOString().slice(0, 10),
          fecha_vencimiento: body.fecha_vencimiento,
          notas: body.notas?.trim() || null
        })
        .select('*')
        .single();

      if (error) {
        return errorResponse(error.message, 400);
      }

      subscription = data;
    }

    return jsonResponse({ profile, subscription }, 201);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Error inesperado';
    return errorResponse(message, 401);
  }
});
