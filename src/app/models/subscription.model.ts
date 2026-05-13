import { UserStatus } from './profile.model';

export interface Subscription {
  id: string;
  user_id: string;
  estado: UserStatus;
  fecha_inicio: string;
  fecha_vencimiento?: string | null;
  notas?: string | null;
  creado_en: string;
  actualizado_en: string;
}
