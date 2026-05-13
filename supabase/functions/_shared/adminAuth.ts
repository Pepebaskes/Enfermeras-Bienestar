import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.1';

export type AdminClient = ReturnType<typeof createClient>;

export const getSupabaseAdmin = () => {
  const supabaseUrl = Deno.env.get('SUPABASE_URL');
  const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error('Faltan SUPABASE_URL o SUPABASE_SERVICE_ROLE_KEY en Edge Function secrets');
  }

  return createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  });
};

export const assertAdmin = async (request: Request, supabaseAdmin: AdminClient) => {
  const authHeader = request.headers.get('Authorization') || '';
  const token = authHeader.replace('Bearer ', '').trim();

  if (!token) {
    throw new Error('No hay sesion autenticada');
  }

  const { data: userData, error: userError } = await supabaseAdmin.auth.getUser(token);
  if (userError || !userData.user) {
    throw new Error('Sesion invalida');
  }

  const { data: profile, error: profileError } = await supabaseAdmin
    .from('profiles')
    .select('id, rol, estado')
    .eq('id', userData.user.id)
    .single();

  if (profileError || !profile) {
    throw new Error('Perfil administrador no encontrado');
  }

  if (profile.rol !== 'admin' || profile.estado !== 'activo') {
    throw new Error('No tienes permisos de administrador');
  }

  return userData.user;
};
