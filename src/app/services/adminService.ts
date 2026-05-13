import { Profile, UserStatus } from '../models/profile.model';
import { Subscription } from '../models/subscription.model';
import { supabase } from './supabaseClient';

export interface AdminSummary {
  totalProfiles: number;
  activeNurses: number;
  suspendedNurses: number;
  totalPatients: number;
}

export interface CreateNurseUserInput {
  email: string;
  password: string;
  nombre: string;
  ciudad?: string;
  estado?: UserStatus;
  fecha_vencimiento?: string;
  notas?: string;
}

export interface UpdateNurseUserInput {
  userId: string;
  email?: string;
  password?: string;
  nombre?: string;
  ciudad?: string;
  estado?: UserStatus;
}

const invokeAdminFunction = async <T>(functionName: string, body: Record<string, unknown>): Promise<T> => {
  const { data, error } = await supabase.functions.invoke(functionName, { body });

  if (error) {
    const context = (error as { context?: unknown }).context;
    if (context) {
      if (context instanceof Response) {
        try {
          const errorBody = await context.json();
          if (errorBody?.error) {
            throw new Error(String(errorBody.error));
          }
        } catch (parseError) {
          if (parseError instanceof Error && parseError.message !== error.message) {
            throw parseError;
          }
        }
      } else if (typeof context === 'object' && context !== null) {
        const maybeError = context as { error?: unknown; message?: unknown; body?: unknown };
        if (maybeError.error) {
          throw new Error(String(maybeError.error));
        }
        if (maybeError.message) {
          throw new Error(String(maybeError.message));
        }
        if (typeof maybeError.body === 'string') {
          try {
            const parsed = JSON.parse(maybeError.body);
            if (parsed?.error) {
              throw new Error(String(parsed.error));
            }
          } catch {
            throw new Error(maybeError.body);
          }
        }
      }
    }

    throw new Error(error.message);
  }

  if (data && typeof data === 'object' && 'error' in data) {
    throw new Error(String((data as { error: unknown }).error));
  }

  return data as T;
};

export const fetchProfiles = async (): Promise<Profile[]> => {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .order('creado_en', { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  return (data || []) as Profile[];
};

export const updateProfileStatus = async (profileId: string, estado: UserStatus): Promise<Profile> => {
  const result = await invokeAdminFunction<{ profile: Profile }>('admin-update-user', {
    userId: profileId,
    estado
  });

  return result.profile;
};

export const updateProfilePaymentDate = async (
  profileId: string,
  fechaPago: string,
  estado: UserStatus = 'activo'
): Promise<Profile> => {
  const { data, error } = await supabase
    .from('profiles')
    .update({
      fecha_pago: fechaPago,
      estado,
      actualizado_en: new Date().toISOString()
    })
    .eq('id', profileId)
    .select('*')
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return data as Profile;
};

export const createNurseUser = async (input: CreateNurseUserInput): Promise<{
  profile: Profile;
  subscription?: Subscription | null;
}> => {
  return invokeAdminFunction('admin-create-user', input);
};

export const updateNurseUser = async (input: UpdateNurseUserInput): Promise<Profile> => {
  const result = await invokeAdminFunction<{ profile: Profile }>('admin-update-user', input);
  return result.profile;
};

export const removeNurseUser = async (userId: string, hardDelete = false): Promise<{
  deleted?: boolean;
  suspended?: boolean;
  profile?: Profile;
}> => {
  return invokeAdminFunction('admin-remove-user', {
    userId,
    hardDelete
  });
};

export const fetchSubscriptions = async (): Promise<Subscription[]> => {
  const { data, error } = await supabase
    .from('subscriptions')
    .select('*')
    .order('fecha_vencimiento', { ascending: true, nullsFirst: false });

  if (error) {
    throw new Error(error.message);
  }

  return (data || []) as Subscription[];
};

export const saveSubscription = async (
  subscription: Partial<Subscription> & { user_id: string }
): Promise<Subscription> => {
  if (subscription.id) {
    const { data, error } = await supabase
      .from('subscriptions')
      .update({
        estado: subscription.estado || 'activo',
        fecha_inicio: subscription.fecha_inicio,
        fecha_vencimiento: subscription.fecha_vencimiento || null,
        notas: subscription.notas || null,
        actualizado_en: new Date().toISOString()
      })
      .eq('id', subscription.id)
      .select('*')
      .single();

    if (error) {
      throw new Error(error.message);
    }

    return data as Subscription;
  }

  const { data, error } = await supabase
    .from('subscriptions')
    .insert({
      user_id: subscription.user_id,
      estado: subscription.estado || 'activo',
      fecha_inicio: subscription.fecha_inicio || new Date().toISOString().slice(0, 10),
      fecha_vencimiento: subscription.fecha_vencimiento || null,
      notas: subscription.notas || null
    })
    .select('*')
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return data as Subscription;
};

const countTable = async (
  tableName: 'profiles' | 'patients',
  applyFilters?: (query: any) => any
) => {
  let query = supabase
    .from(tableName)
    .select('id', { count: 'exact', head: true });

  if (applyFilters) {
    query = applyFilters(query);
  }

  const { count, error } = await query;

  if (error) {
    throw new Error(error.message);
  }

  return count || 0;
};

export const fetchAdminSummary = async (): Promise<AdminSummary> => {
  const [totalProfiles, activeNurses, suspendedNurses, totalPatients] = await Promise.all([
    countTable('profiles'),
    countTable('profiles', (query) => query.eq('rol', 'enfermera').eq('estado', 'activo')),
    countTable('profiles', (query) => query.eq('rol', 'enfermera').eq('estado', 'suspendido')),
    countTable('patients')
  ]);

  return {
    totalProfiles,
    activeNurses,
    suspendedNurses,
    totalPatients
  };
};
