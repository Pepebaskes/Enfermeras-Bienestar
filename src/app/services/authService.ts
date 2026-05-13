import { supabase } from './supabaseClient';
import { Profile } from '../models/profile.model';
import { Subscription } from '../models/subscription.model';

export type NurseAccessReason =
  | 'active'
  | 'profile_suspended'
  | 'subscription_missing'
  | 'subscription_suspended'
  | 'subscription_without_due_date'
  | 'subscription_expired';

export interface NurseAccessStatus {
  allowed: boolean;
  reason: NurseAccessReason;
  message: string;
  subscription?: Subscription | null;
  daysUntilExpiration?: number | null;
}

const getErrorMessage = (error: unknown) => {
  return error instanceof Error ? error.message : 'Ocurrio un error inesperado';
};

const toDateInputValue = (date: Date) => {
  const local = new Date(date.getTime() - date.getTimezoneOffset() * 60000);
  return local.toISOString().slice(0, 10);
};

const getDaysUntil = (dateValue?: string | null) => {
  if (!dateValue) {
    return null;
  }

  const today = new Date(`${toDateInputValue(new Date())}T00:00:00`);
  const targetDate = new Date(`${dateValue}T00:00:00`);
  return Math.ceil((targetDate.getTime() - today.getTime()) / 86400000);
};

export const getCurrentProfile = async (): Promise<Profile | null> => {
  const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
  if (sessionError) {
    throw new Error(sessionError.message);
  }

  const userId = sessionData.session?.user.id;
  if (!userId) {
    return null;
  }

  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return data as Profile;
};

export const login = async (email: string, password: string): Promise<Profile> => {
  const { error } = await supabase.auth.signInWithPassword({
    email,
    password
  });

  if (error) {
    throw new Error(error.message);
  }

  const profile = await getCurrentProfile();
  if (!profile) {
    await logout();
    throw new Error('No existe un perfil para este usuario');
  }

  return profile;
};

export const getCurrentSubscription = async (profileId: string): Promise<Subscription | null> => {
  const { data, error } = await supabase
    .from('subscriptions')
    .select('*')
    .eq('user_id', profileId)
    .order('fecha_vencimiento', { ascending: false, nullsFirst: false })
    .limit(1)
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  return (data || null) as Subscription | null;
};

export const getNurseAccessStatus = async (profile: Profile): Promise<NurseAccessStatus> => {
  if (profile.rol === 'admin') {
    return {
      allowed: true,
      reason: 'active',
      message: 'Acceso de administrador activo.'
    };
  }

  if (profile.estado !== 'activo') {
    return {
      allowed: false,
      reason: 'profile_suspended',
      message: 'Tu cuenta esta suspendida. Contacta al administrador.'
    };
  }

  const subscription = await getCurrentSubscription(profile.id);

  if (!subscription) {
    return {
      allowed: false,
      reason: 'subscription_missing',
      message: 'Tu mensualidad no esta registrada. Contacta al administrador.',
      subscription: null,
      daysUntilExpiration: null
    };
  }

  if (subscription.estado !== 'activo') {
    return {
      allowed: false,
      reason: 'subscription_suspended',
      message: 'Tu mensualidad esta suspendida. Contacta al administrador.',
      subscription,
      daysUntilExpiration: getDaysUntil(subscription.fecha_vencimiento)
    };
  }

  const daysUntilExpiration = getDaysUntil(subscription.fecha_vencimiento);

  if (daysUntilExpiration === null) {
    return {
      allowed: false,
      reason: 'subscription_without_due_date',
      message: 'Tu mensualidad no tiene fecha de vencimiento. Contacta al administrador.',
      subscription,
      daysUntilExpiration
    };
  }

  if (daysUntilExpiration < 0) {
    return {
      allowed: false,
      reason: 'subscription_expired',
      message: `Tu mensualidad vencio hace ${Math.abs(daysUntilExpiration)} dias. Contacta al administrador.`,
      subscription,
      daysUntilExpiration
    };
  }

  return {
    allowed: true,
    reason: 'active',
    message: daysUntilExpiration === 0
      ? 'Tu mensualidad vence hoy.'
      : `Tu mensualidad vence en ${daysUntilExpiration} dias.`,
    subscription,
    daysUntilExpiration
  };
};

export const logout = async (): Promise<void> => {
  const { error } = await supabase.auth.signOut();
  if (error) {
    throw new Error(error.message);
  }
};

export const getAuthErrorMessage = getErrorMessage;
