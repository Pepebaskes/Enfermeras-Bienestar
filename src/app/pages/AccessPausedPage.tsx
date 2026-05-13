import { AlertTriangle, CreditCard, LogOut } from 'lucide-react';
import { NurseAccessStatus } from '../services/authService';
import { Profile } from '../models/profile.model';
import { Button } from '../components/ui/button';
import { Card, CardContent } from '../components/ui/card';

interface AccessPausedPageProps {
  profile: Profile;
  accessStatus: NurseAccessStatus;
  onLogout: () => void;
}

const getTitle = (reason: NurseAccessStatus['reason']) => {
  if (reason === 'profile_suspended') {
    return 'Cuenta suspendida';
  }

  if (reason === 'subscription_expired') {
    return 'Mensualidad vencida';
  }

  if (reason === 'subscription_missing') {
    return 'Mensualidad pendiente';
  }

  return 'Acceso pausado';
};

const getRecoveryMessage = (reason: NurseAccessStatus['reason']) => {
  if (reason === 'profile_suspended') {
    return 'El administrador debe reactivar la cuenta desde el panel admin.';
  }

  return 'El administrador debe registrar la mensualidad como pagada desde el panel admin.';
};

export function AccessPausedPage({ profile, accessStatus, onLogout }: AccessPausedPageProps) {
  return (
    <main className="flex min-h-[calc(100vh-73px)] items-center justify-center bg-slate-50 p-4">
      <Card className="w-full max-w-xl rounded-lg border-amber-200 bg-white shadow-lg">
        <CardContent className="space-y-6 p-6 md:p-8">
          <div className="flex items-start gap-4">
            <div className="rounded-lg bg-amber-100 p-3 text-amber-700">
              <AlertTriangle className="size-7" />
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">{profile.nombre}</p>
              <h1 className="mt-1 text-2xl font-semibold text-slate-950">{getTitle(accessStatus.reason)}</h1>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">{accessStatus.message}</p>
            </div>
          </div>

          <div className="grid gap-3 rounded-lg border bg-slate-50 p-4 text-sm">
            <div className="flex items-center justify-between gap-4">
              <span className="text-muted-foreground">Estado de cuenta</span>
              <span className="font-medium text-slate-950">{profile.estado}</span>
            </div>
            <div className="flex items-center justify-between gap-4">
              <span className="text-muted-foreground">Vencimiento</span>
              <span className="font-medium text-slate-950">
                {accessStatus.subscription?.fecha_vencimiento || 'Sin registro'}
              </span>
            </div>
            <div className="flex items-center justify-between gap-4">
              <span className="text-muted-foreground">Suscripcion</span>
              <span className="font-medium text-slate-950">
                {accessStatus.subscription?.estado || 'Sin registro'}
              </span>
            </div>
          </div>

          <div className="rounded-lg bg-sky-50 p-4 text-sm leading-6 text-sky-900">
            <div className="mb-2 flex items-center gap-2 font-medium">
              <CreditCard className="size-4" />
              Para reactivar el acceso
            </div>
            {getRecoveryMessage(accessStatus.reason)}
          </div>

          <Button variant="outline" onClick={onLogout}>
            <LogOut className="size-4" />
            Cerrar sesion
          </Button>
        </CardContent>
      </Card>
    </main>
  );
}
