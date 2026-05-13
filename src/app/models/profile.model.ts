export type UserRole = 'admin' | 'enfermera';
export type UserStatus = 'activo' | 'suspendido';

export interface Profile {
  id: string;
  email: string;
  nombre: string;
  ciudad?: string | null;
  rol: UserRole;
  estado: UserStatus;
  fecha_pago?: string | null;
  creado_en: string;
  actualizado_en: string;
}
