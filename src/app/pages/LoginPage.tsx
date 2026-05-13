import { useState } from 'react';
import { HeartPulse, LockKeyhole, ShieldCheck } from 'lucide-react';
import { Profile } from '../models/profile.model';
import { getAuthErrorMessage, login } from '../services/authService';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import loginIllustration from '../../assets/login-nurses-illustration.png';

interface LoginPageProps {
  onLogin: (profile: Profile) => void;
  message?: string;
}

export function LoginPage({ onLogin, message }: LoginPageProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(message || '');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const profile = await login(email.trim(), password);
      onLogin(profile);
    } catch (loginError) {
      setError(getAuthErrorMessage(loginError));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#f4fbfb]">
      <img
        src={loginIllustration}
        alt=""
        className="absolute inset-0 hidden size-full object-cover lg:block"
      />
      <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(244,251,251,0.98)_0%,rgba(244,251,251,0.92)_36%,rgba(244,251,251,0.38)_72%,rgba(244,251,251,0.12)_100%)]" />

      <section className="relative z-10 grid min-h-screen grid-cols-1 lg:grid-cols-[minmax(420px,0.92fr)_1.08fr]">
        <div className="flex items-center justify-center px-4 py-8 sm:px-6 lg:px-12">
          <Card className="w-full max-w-md overflow-hidden rounded-lg border-sky-100/80 bg-white/92 shadow-2xl shadow-sky-900/10 backdrop-blur">
            <CardHeader className="space-y-4 px-6 pt-7 text-center sm:px-8 sm:pt-8">
              <div className="mx-auto flex size-14 items-center justify-center rounded-full bg-gradient-to-br from-sky-100 to-emerald-100 text-sky-700 shadow-sm">
                <LockKeyhole className="size-7" />
              </div>
              <div>
                <CardTitle className="text-2xl leading-tight text-slate-900 sm:text-3xl">Modulo Enfermeria</CardTitle>
                <p className="mt-2 text-sm leading-6 text-slate-600">Acceso privado para personal autorizado</p>
              </div>
            </CardHeader>
            <CardContent className="px-6 pb-7 sm:px-8 sm:pb-8">
              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-sm font-medium text-sky-800">Correo</Label>
                  <Input
                    id="email"
                    type="email"
                    autoComplete="email"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    className="h-12 border-sky-200 bg-sky-50/70 text-base shadow-sm focus-visible:border-sky-500"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password" className="text-sm font-medium text-emerald-800">Contrasena</Label>
                  <Input
                    id="password"
                    type="password"
                    autoComplete="current-password"
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    className="h-12 border-emerald-200 bg-emerald-50/60 text-base shadow-sm focus-visible:border-emerald-500"
                    required
                  />
                </div>

                {error && (
                  <p className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm leading-5 text-red-700">
                    {error}
                  </p>
                )}

                <Button
                  type="submit"
                  className="h-12 w-full bg-sky-700 text-base shadow-lg shadow-sky-700/20 hover:bg-sky-800"
                  disabled={isLoading}
                >
                  {isLoading ? 'Entrando...' : 'Entrar'}
                </Button>
              </form>

              <div className="mt-6 grid grid-cols-2 gap-3 text-xs text-slate-600">
                <div className="flex min-h-12 items-center gap-2 rounded-md border border-sky-100 bg-sky-50/70 px-3">
                  <ShieldCheck className="size-4 shrink-0 text-sky-700" />
                  <span>Datos protegidos</span>
                </div>
                <div className="flex min-h-12 items-center gap-2 rounded-md border border-emerald-100 bg-emerald-50/70 px-3">
                  <HeartPulse className="size-4 shrink-0 text-emerald-700" />
                  <span>Atencion en campo</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="hidden items-end justify-end p-8 lg:flex">
          <div className="max-w-md rounded-lg border border-white/60 bg-white/68 p-5 shadow-xl shadow-sky-950/10 backdrop-blur">
            <p className="text-sm font-medium text-slate-900">Seguimiento claro, rapido y privado</p>
            <p className="mt-1 text-sm leading-6 text-slate-600">
              Cada enfermera trabaja con su propia lista de pacientes.
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}
