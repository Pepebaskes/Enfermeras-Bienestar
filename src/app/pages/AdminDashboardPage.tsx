import { useEffect, useMemo, useState } from 'react';
import {
  AlertTriangle,
  CalendarDays,
  CheckCircle2,
  CreditCard,
  Download,
  Search,
  ShieldCheck,
  Trash2,
  UserCheck,
  UserPlus,
  Users
} from 'lucide-react';
import { Profile, UserStatus } from '../models/profile.model';
import { Subscription } from '../models/subscription.model';
import {
  AdminSummary,
  createNurseUser,
  fetchAdminSummary,
  fetchProfiles,
  fetchSubscriptions,
  removeNurseUser,
  saveSubscription,
  updateNurseUser,
  updateProfilePaymentDate,
  updateProfileStatus
} from '../services/adminService';
import { fetchAllPatients, fetchPatientsPage } from '../services/patientService';
import { downloadCSV, exportAdminSummaryToCSV, exportToCSV } from '../services/csvService';
import { Person } from '../models/person.model';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Textarea } from '../components/ui/textarea';
import { toast } from 'sonner';

const PAGE_SIZE = 100;
const RENEWAL_DAYS = 30;

type StatusFilter = 'todos' | UserStatus;
type PaymentFilter = 'todos' | 'vencidas' | 'por_vencer' | 'al_corriente' | 'sin_suscripcion';

const getSubscriptionForUser = (subscriptions: Subscription[], userId: string) => {
  return subscriptions.find(subscription => subscription.user_id === userId);
};

const toDateInputValue = (date: Date) => {
  const local = new Date(date.getTime() - date.getTimezoneOffset() * 60000);
  return local.toISOString().slice(0, 10);
};

const addDays = (date: Date, days: number) => {
  const nextDate = new Date(date);
  nextDate.setDate(nextDate.getDate() + days);
  return nextDate;
};

const getDaysUntil = (dateValue?: string | null) => {
  if (!dateValue) {
    return null;
  }

  const today = new Date(`${toDateInputValue(new Date())}T00:00:00`);
  const targetDate = new Date(`${dateValue}T00:00:00`);
  return Math.ceil((targetDate.getTime() - today.getTime()) / 86400000);
};

const getPaymentState = (subscription?: Subscription) => {
  const daysUntil = getDaysUntil(subscription?.fecha_vencimiento);

  if (!subscription?.fecha_vencimiento || daysUntil === null) {
    return 'sin_suscripcion' as const;
  }

  if (daysUntil < 0 || subscription.estado === 'suspendido') {
    return 'vencidas' as const;
  }

  if (daysUntil <= 7) {
    return 'por_vencer' as const;
  }

  return 'al_corriente' as const;
};

const getPaymentBadge = (subscription?: Subscription) => {
  const paymentState = getPaymentState(subscription);
  const daysUntil = getDaysUntil(subscription?.fecha_vencimiento);

  if (paymentState === 'vencidas') {
    return {
      label: daysUntil === null ? 'Vencida' : `Vencida hace ${Math.abs(daysUntil)} dias`,
      className: 'bg-red-100 text-red-800'
    };
  }

  if (paymentState === 'por_vencer') {
    return {
      label: daysUntil === 0 ? 'Vence hoy' : `Vence en ${daysUntil} dias`,
      className: 'bg-amber-100 text-amber-800'
    };
  }

  if (paymentState === 'al_corriente') {
    return {
      label: `Al corriente hasta ${subscription?.fecha_vencimiento}`,
      className: 'bg-emerald-100 text-emerald-800'
    };
  }

  return {
    label: 'Sin mensualidad',
    className: 'bg-slate-100 text-slate-700'
  };
};

const selectClassName = 'h-10 w-full rounded-md border border-input bg-background px-3 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2';

export function AdminDashboardPage() {
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [summary, setSummary] = useState<AdminSummary | null>(null);
  const [selectedNurseId, setSelectedNurseId] = useState('');
  const [patients, setPatients] = useState<Person[]>([]);
  const [patientTotal, setPatientTotal] = useState(0);
  const [patientPage, setPatientPage] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isPatientsLoading, setIsPatientsLoading] = useState(false);
  const [isCreatingUser, setIsCreatingUser] = useState(false);
  const [editingPasswordFor, setEditingPasswordFor] = useState('');
  const [savingSubscriptionFor, setSavingSubscriptionFor] = useState('');
  const [savingProfileFor, setSavingProfileFor] = useState('');
  const [markingPaidFor, setMarkingPaidFor] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('todos');
  const [cityFilter, setCityFilter] = useState('todos');
  const [paymentFilter, setPaymentFilter] = useState<PaymentFilter>('todos');
  const [backupNurseId, setBackupNurseId] = useState('all');
  const [backupFromDate, setBackupFromDate] = useState('');
  const [backupToDate, setBackupToDate] = useState('');
  const [backupProgress, setBackupProgress] = useState('');
  const [isExportingBackup, setIsExportingBackup] = useState(false);

  const nurses = useMemo(() => {
    return profiles.filter(profile => profile.rol === 'enfermera');
  }, [profiles]);

  const cityOptions = useMemo(() => {
    return Array.from(
      new Set(nurses.map(nurse => nurse.ciudad?.trim()).filter((city): city is string => Boolean(city)))
    ).sort((a, b) => a.localeCompare(b));
  }, [nurses]);

  const filteredNurses = useMemo(() => {
    const normalizedSearch = searchTerm.trim().toLowerCase();

    return nurses.filter(nurse => {
      const matchesSearch = !normalizedSearch
        || nurse.nombre.toLowerCase().includes(normalizedSearch)
        || nurse.email.toLowerCase().includes(normalizedSearch)
        || (nurse.ciudad || '').toLowerCase().includes(normalizedSearch);
      const matchesStatus = statusFilter === 'todos' || nurse.estado === statusFilter;
      const matchesCity = cityFilter === 'todos' || nurse.ciudad === cityFilter;

      return matchesSearch && matchesStatus && matchesCity;
    });
  }, [cityFilter, nurses, searchTerm, statusFilter]);

  const subscriptionStats = useMemo<Record<Exclude<PaymentFilter, 'todos'>, number>>(() => {
    return nurses.reduce(
      (acc, nurse) => {
        const subscription = getSubscriptionForUser(subscriptions, nurse.id);
        const paymentState = getPaymentState(subscription);
        acc[paymentState] += 1;
        return acc;
      },
      {
        vencidas: 0,
        por_vencer: 0,
        al_corriente: 0,
        sin_suscripcion: 0
      }
    );
  }, [nurses, subscriptions]);

  const subscriptionFilteredNurses = useMemo(() => {
    if (paymentFilter === 'todos') {
      return filteredNurses;
    }

    return filteredNurses.filter(nurse => {
      const subscription = getSubscriptionForUser(subscriptions, nurse.id);
      return getPaymentState(subscription) === paymentFilter;
    });
  }, [filteredNurses, paymentFilter, subscriptions]);

  const selectedNurse = nurses.find(nurse => nurse.id === selectedNurseId);

  const refreshAdminData = async () => {
    setIsLoading(true);
    try {
      const [profilesData, subscriptionsData, summaryData] = await Promise.all([
        fetchProfiles(),
        fetchSubscriptions(),
        fetchAdminSummary()
      ]);
      setProfiles(profilesData);
      setSubscriptions(subscriptionsData);
      setSummary(summaryData);

      if (!selectedNurseId) {
        const firstNurse = profilesData.find(profile => profile.rol === 'enfermera');
        if (firstNurse) {
          setSelectedNurseId(firstNurse.id);
        }
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Error al cargar el panel admin';
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  const loadPatientsForNurse = async (ownerId: string, page = 0, append = false) => {
    if (!ownerId) {
      setPatients([]);
      setPatientTotal(0);
      return;
    }

    setIsPatientsLoading(true);
    try {
      const result = await fetchPatientsPage({
        page,
        pageSize: PAGE_SIZE,
        ownerId,
        sortField: 'fecha',
        sortOrder: 'desc'
      });
      setPatientTotal(result.total);
      setPatients(prev => append ? [...prev, ...result.persons] : result.persons);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Error al cargar pacientes';
      toast.error(message);
    } finally {
      setIsPatientsLoading(false);
    }
  };

  useEffect(() => {
    refreshAdminData();
  }, []);

  useEffect(() => {
    if (selectedNurseId) {
      setPatientPage(0);
      loadPatientsForNurse(selectedNurseId, 0, false);
    }
  }, [selectedNurseId]);

  const replaceProfile = (updatedProfile: Profile) => {
    setProfiles(prev => prev.map(item => item.id === updatedProfile.id ? updatedProfile : item));
  };

  const replaceSubscription = (savedSubscription: Subscription) => {
    setSubscriptions(prev => {
      const exists = prev.some(item => item.id === savedSubscription.id);
      return exists
        ? prev.map(item => item.id === savedSubscription.id ? savedSubscription : item)
        : [...prev, savedSubscription];
    });
  };

  const handleStatusChange = async (profile: Profile) => {
    const nextStatus = profile.estado === 'activo' ? 'suspendido' : 'activo';
    try {
      const updatedProfile = await updateProfileStatus(profile.id, nextStatus);
      replaceProfile(updatedProfile);
      setSummary(await fetchAdminSummary());
      toast.success(nextStatus === 'activo' ? 'Usuario reactivado' : 'Usuario suspendido');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Error al actualizar usuario';
      toast.error(message);
    }
  };

  const handleNurseEdit = async (event: React.FormEvent<HTMLFormElement>, nurse: Profile) => {
    event.preventDefault();
    setSavingProfileFor(nurse.id);

    const formData = new FormData(event.currentTarget);

    try {
      const updatedProfile = await updateNurseUser({
        userId: nurse.id,
        nombre: String(formData.get('nombre') || ''),
        email: String(formData.get('email') || ''),
        ciudad: String(formData.get('ciudad') || ''),
        estado: String(formData.get('estado') || 'activo') as UserStatus
      });
      replaceProfile(updatedProfile);
      setSummary(await fetchAdminSummary());
      toast.success('Datos de enfermera actualizados');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Error al actualizar enfermera';
      toast.error(message);
    } finally {
      setSavingProfileFor('');
    }
  };

  const handleSubscriptionSave = async (event: React.FormEvent<HTMLFormElement>, nurse: Profile) => {
    event.preventDefault();
    setSavingSubscriptionFor(nurse.id);

    const formData = new FormData(event.currentTarget);
    const current = getSubscriptionForUser(subscriptions, nurse.id);
    const nextStatus = String(formData.get('estado') || 'activo') as UserStatus;

    try {
      const saved = await saveSubscription({
        id: current?.id,
        user_id: nurse.id,
        estado: nextStatus,
        fecha_inicio: String(formData.get('fecha_inicio') || toDateInputValue(new Date())),
        fecha_vencimiento: String(formData.get('fecha_vencimiento') || ''),
        notas: String(formData.get('notas') || '')
      });

      replaceSubscription(saved);

      if (nurse.estado !== nextStatus) {
        const updatedProfile = await updateProfileStatus(nurse.id, nextStatus);
        replaceProfile(updatedProfile);
        setSummary(await fetchAdminSummary());
      }

      toast.success('Suscripcion actualizada');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Error al guardar suscripcion';
      toast.error(message);
    } finally {
      setSavingSubscriptionFor('');
    }
  };

  const handleMarkPaid = async (nurse: Profile) => {
    setMarkingPaidFor(nurse.id);
    const current = getSubscriptionForUser(subscriptions, nurse.id);
    const today = toDateInputValue(new Date());
    const currentDueDays = getDaysUntil(current?.fecha_vencimiento);
    const baseDate = current?.fecha_vencimiento && currentDueDays !== null && currentDueDays > 0
      ? new Date(`${current.fecha_vencimiento}T00:00:00`)
      : new Date(`${today}T00:00:00`);
    const nextDueDate = toDateInputValue(addDays(baseDate, RENEWAL_DAYS));

    try {
      const saved = await saveSubscription({
        id: current?.id,
        user_id: nurse.id,
        estado: 'activo',
        fecha_inicio: today,
        fecha_vencimiento: nextDueDate,
        notas: current?.notas || ''
      });
      const updatedProfile = await updateProfilePaymentDate(nurse.id, today, 'activo');

      replaceSubscription(saved);
      replaceProfile(updatedProfile);
      setSummary(await fetchAdminSummary());
      toast.success(`Mensualidad registrada hasta ${nextDueDate}`);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Error al registrar mensualidad';
      toast.error(message);
    } finally {
      setMarkingPaidFor('');
    }
  };

  const handleCreateNurse = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsCreatingUser(true);

    const formData = new FormData(event.currentTarget);

    try {
      const result = await createNurseUser({
        email: String(formData.get('email') || ''),
        password: String(formData.get('password') || ''),
        nombre: String(formData.get('nombre') || ''),
        ciudad: String(formData.get('ciudad') || ''),
        estado: String(formData.get('estado') || 'activo') as UserStatus,
        fecha_vencimiento: String(formData.get('fecha_vencimiento') || ''),
        notas: String(formData.get('notas') || '')
      });

      setProfiles(prev => [result.profile, ...prev]);
      if (result.subscription) {
        setSubscriptions(prev => [result.subscription!, ...prev]);
      }
      setSummary(await fetchAdminSummary());
      toast.success('Enfermera creada correctamente');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Error al crear enfermera';
      toast.error(message);
    } finally {
      setIsCreatingUser(false);
    }
  };

  const handlePasswordChange = async (event: React.FormEvent<HTMLFormElement>, nurse: Profile) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const password = String(formData.get('password') || '');

    setEditingPasswordFor(nurse.id);
    try {
      await updateNurseUser({
        userId: nurse.id,
        password
      });
      toast.success('Contrasena temporal actualizada');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Error al cambiar contrasena';
      toast.error(message);
    } finally {
      setEditingPasswordFor('');
    }
  };

  const handleHardDelete = async (nurse: Profile) => {
    const confirmed = window.confirm(
      `Eliminar definitivamente a ${nurse.nombre}? Esto borra su acceso, perfil, suscripcion y pacientes asociados.`
    );

    if (!confirmed) {
      return;
    }

    try {
      await removeNurseUser(nurse.id, true);
      setProfiles(prev => prev.filter(profile => profile.id !== nurse.id));
      setSubscriptions(prev => prev.filter(subscription => subscription.user_id !== nurse.id));
      setSummary(await fetchAdminSummary());
      if (selectedNurseId === nurse.id) {
        setSelectedNurseId('');
        setPatients([]);
        setPatientTotal(0);
      }
      toast.success('Usuario eliminado');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Error al eliminar usuario';
      toast.error(message);
    }
  };

  const handleLoadMorePatients = () => {
    const nextPage = patientPage + 1;
    setPatientPage(nextPage);
    loadPatientsForNurse(selectedNurseId, nextPage, true);
  };

  const getBackupFilters = () => ({
    updatedFrom: backupFromDate || undefined,
    updatedTo: backupToDate || undefined
  });

  const getBackupDateSuffix = () => {
    if (backupFromDate && backupToDate) {
      return `${backupFromDate}_a_${backupToDate}`;
    }

    if (backupFromDate) {
      return `desde_${backupFromDate}`;
    }

    if (backupToDate) {
      return `hasta_${backupToDate}`;
    }

    return toDateInputValue(new Date());
  };

  const sanitizeFilename = (value: string) => {
    return value
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-zA-Z0-9]+/g, '_')
      .replace(/^_+|_+$/g, '')
      .toLowerCase();
  };

  const handleBackupExport = async () => {
    setIsExportingBackup(true);
    setBackupProgress('Preparando respaldo...');

    try {
      const selectedBackupNurse = backupNurseId === 'all'
        ? null
        : nurses.find(nurse => nurse.id === backupNurseId) || null;
      const exportedPatients = await fetchAllPatients({
        ...getBackupFilters(),
        ownerId: selectedBackupNurse?.id,
        pageSize: 500,
        sortField: 'fecha',
        sortOrder: 'desc',
        onProgress: (loaded, total) => {
          setBackupProgress(`Exportando ${Math.min(loaded, total)} de ${total} pacientes...`);
        }
      });

      if (exportedPatients.length === 0) {
        toast.error('No hay pacientes para respaldar con esos filtros');
        return;
      }

      const ownerName = selectedBackupNurse ? sanitizeFilename(selectedBackupNurse.nombre) : 'todas_las_enfermeras';
      const csvContent = exportToCSV(exportedPatients);
      downloadCSV(csvContent, `respaldo_pacientes_${ownerName}_${getBackupDateSuffix()}.csv`);
      toast.success(`Respaldo generado con ${exportedPatients.length} pacientes`);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Error al generar respaldo';
      toast.error(message);
    } finally {
      setIsExportingBackup(false);
      setBackupProgress('');
    }
  };

  const handleSummaryExport = async () => {
    setIsExportingBackup(true);
    setBackupProgress('Calculando resumen por enfermera...');

    try {
      const patientTotalsByOwner: Record<string, number> = {};

      for (const nurse of nurses) {
        const exportedPatients = await fetchAllPatients({
          ...getBackupFilters(),
          ownerId: nurse.id,
          pageSize: 500,
          onProgress: (loaded, total) => {
            setBackupProgress(`${nurse.nombre}: ${Math.min(loaded, total)} de ${total} pacientes...`);
          }
        });
        patientTotalsByOwner[nurse.id] = exportedPatients.length;
      }

      const csvContent = exportAdminSummaryToCSV(profiles, subscriptions, patientTotalsByOwner);
      downloadCSV(csvContent, `resumen_admin_${getBackupDateSuffix()}.csv`);
      toast.success('Resumen administrativo exportado');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Error al exportar resumen';
      toast.error(message);
    } finally {
      setIsExportingBackup(false);
      setBackupProgress('');
    }
  };

  const summaryCards = [
    { title: 'Perfiles', value: summary?.totalProfiles ?? 0, icon: Users, color: 'text-sky-700', bg: 'bg-sky-50' },
    { title: 'Enfermeras activas', value: summary?.activeNurses ?? 0, icon: UserCheck, color: 'text-emerald-700', bg: 'bg-emerald-50' },
    { title: 'Vencidas', value: subscriptionStats.vencidas, icon: AlertTriangle, color: 'text-red-700', bg: 'bg-red-50' },
    { title: 'Por vencer', value: subscriptionStats.por_vencer, icon: CalendarDays, color: 'text-amber-700', bg: 'bg-amber-50' },
    { title: 'Al corriente', value: subscriptionStats.al_corriente, icon: CheckCircle2, color: 'text-teal-700', bg: 'bg-teal-50' },
    { title: 'Pacientes', value: summary?.totalPatients ?? 0, icon: ShieldCheck, color: 'text-indigo-700', bg: 'bg-indigo-50' }
  ];

  return (
    <div className="space-y-6 p-4 md:p-6">
      <div>
        <h1 className="text-3xl leading-tight">Panel de Administracion</h1>
        <p className="mt-1 text-sm text-muted-foreground">Control de enfermeras, suscripciones y pacientes por usuario.</p>
      </div>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-6">
        {summaryCards.map((item) => {
          const Icon = item.icon;
          return (
            <Card key={item.title} className="rounded-lg">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm">{item.title}</CardTitle>
                <div className={`${item.bg} rounded-md p-2`}>
                  <Icon className={`size-4 ${item.color}`} />
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-semibold">{item.value}</p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Card className="rounded-lg">
        <CardContent className="grid gap-3 p-4 md:grid-cols-[minmax(220px,1fr)_180px_180px]">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              className="pl-9"
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              placeholder="Buscar por nombre, correo o ciudad"
            />
          </div>
          <select className={selectClassName} value={statusFilter} onChange={(event) => setStatusFilter(event.target.value as StatusFilter)}>
            <option value="todos">Todos los estados</option>
            <option value="activo">Activas</option>
            <option value="suspendido">Suspendidas</option>
          </select>
          <select className={selectClassName} value={cityFilter} onChange={(event) => setCityFilter(event.target.value)}>
            <option value="todos">Todas las ciudades</option>
            {cityOptions.map(city => (
              <option key={city} value={city}>{city}</option>
            ))}
          </select>
        </CardContent>
      </Card>

      <Tabs defaultValue="profiles" className="space-y-4">
        <TabsList className="h-auto w-full flex-wrap justify-start rounded-lg">
          <TabsTrigger value="profiles">Enfermeras</TabsTrigger>
          <TabsTrigger value="subscriptions">Suscripciones</TabsTrigger>
          <TabsTrigger value="patients">Pacientes por enfermera</TabsTrigger>
          <TabsTrigger value="backups">Respaldos</TabsTrigger>
          <TabsTrigger value="users">Altas y bajas</TabsTrigger>
        </TabsList>

        <TabsContent value="profiles">
          <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
            {filteredNurses.map(nurse => {
              const subscription = getSubscriptionForUser(subscriptions, nurse.id);
              const badge = getPaymentBadge(subscription);

              return (
                <Card key={nurse.id} className="rounded-lg">
                  <CardHeader>
                    <CardTitle className="flex flex-col gap-2 text-base sm:flex-row sm:items-center sm:justify-between">
                      <span>{nurse.nombre}</span>
                      <Badge className={badge.className}>{badge.label}</Badge>
                    </CardTitle>
                    <p className="text-sm text-muted-foreground">{nurse.email}</p>
                  </CardHeader>
                  <CardContent>
                    <form className="space-y-4" onSubmit={(event) => handleNurseEdit(event, nurse)}>
                      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                        <div className="space-y-2">
                          <Label>Nombre</Label>
                          <Input name="nombre" defaultValue={nurse.nombre} required />
                        </div>
                        <div className="space-y-2">
                          <Label>Correo</Label>
                          <Input name="email" type="email" defaultValue={nurse.email} required />
                        </div>
                        <div className="space-y-2">
                          <Label>Ciudad</Label>
                          <Input name="ciudad" defaultValue={nurse.ciudad || ''} />
                        </div>
                        <div className="space-y-2">
                          <Label>Estado</Label>
                          <select name="estado" className={selectClassName} defaultValue={nurse.estado}>
                            <option value="activo">Activo</option>
                            <option value="suspendido">Suspendido</option>
                          </select>
                        </div>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        <Button type="submit" disabled={savingProfileFor === nurse.id}>
                          {savingProfileFor === nurse.id ? 'Guardando...' : 'Guardar datos'}
                        </Button>
                        <Button type="button" variant="outline" onClick={() => handleStatusChange(nurse)}>
                          {nurse.estado === 'activo' ? 'Suspender' : 'Reactivar'}
                        </Button>
                        {getPaymentState(subscription) !== 'al_corriente' && (
                          <Button
                            type="button"
                            variant="outline"
                            disabled={markingPaidFor === nurse.id}
                            onClick={() => handleMarkPaid(nurse)}
                          >
                            <CreditCard className="size-4" />
                            {markingPaidFor === nurse.id ? 'Activando...' : 'Activar acceso'}
                          </Button>
                        )}
                      </div>
                    </form>
                  </CardContent>
                </Card>
              );
            })}
          </div>
          {filteredNurses.length === 0 && !isLoading && (
            <Card className="rounded-lg">
              <CardContent className="p-6 text-center text-sm text-muted-foreground">No hay enfermeras con esos filtros.</CardContent>
            </Card>
          )}
          {isLoading && <p className="mt-3 text-sm text-muted-foreground">Cargando perfiles...</p>}
        </TabsContent>

        <TabsContent value="subscriptions">
          <div className="mb-4 grid gap-3 md:grid-cols-[220px_1fr]">
            <select className={selectClassName} value={paymentFilter} onChange={(event) => setPaymentFilter(event.target.value as PaymentFilter)}>
              <option value="todos">Todas las mensualidades</option>
              <option value="vencidas">Vencidas</option>
              <option value="por_vencer">Por vencer</option>
              <option value="al_corriente">Al corriente</option>
              <option value="sin_suscripcion">Sin mensualidad</option>
            </select>
            <div className="rounded-md border bg-muted/30 px-3 py-2 text-sm text-muted-foreground">
              Mostrando {subscriptionFilteredNurses.length} de {nurses.length} enfermeras.
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
            {subscriptionFilteredNurses.map(nurse => {
              const subscription = getSubscriptionForUser(subscriptions, nurse.id);
              const badge = getPaymentBadge(subscription);

              return (
                <Card key={nurse.id} className="rounded-lg">
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between gap-3 text-base">
                      <span>{nurse.nombre}</span>
                      <Badge className={badge.className}>{badge.label}</Badge>
                    </CardTitle>
                    <p className="text-sm text-muted-foreground">{nurse.email}</p>
                    <p className="text-xs text-muted-foreground">Ultimo pago: {nurse.fecha_pago || 'Sin registro'}</p>
                  </CardHeader>
                  <CardContent>
                    <form className="space-y-4" onSubmit={(event) => handleSubscriptionSave(event, nurse)}>
                      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                        <div className="space-y-2">
                          <Label>Estado</Label>
                          <select name="estado" className={selectClassName} defaultValue={subscription?.estado || nurse.estado}>
                            <option value="activo">Activo</option>
                            <option value="suspendido">Suspendido</option>
                          </select>
                        </div>
                        <div className="space-y-2">
                          <Label>Inicio</Label>
                          <Input name="fecha_inicio" type="date" defaultValue={subscription?.fecha_inicio || toDateInputValue(new Date())} />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label>Vencimiento</Label>
                        <Input name="fecha_vencimiento" type="date" defaultValue={subscription?.fecha_vencimiento || ''} />
                      </div>
                      <div className="space-y-2">
                        <Label>Notas</Label>
                        <Textarea name="notas" defaultValue={subscription?.notas || ''} rows={3} />
                      </div>
                      <div className="flex flex-wrap gap-2">
                        <Button type="submit" disabled={savingSubscriptionFor === nurse.id}>
                          {savingSubscriptionFor === nurse.id ? 'Guardando...' : 'Guardar suscripcion'}
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          disabled={markingPaidFor === nurse.id}
                          onClick={() => handleMarkPaid(nurse)}
                        >
                          <CreditCard className="size-4" />
                          {markingPaidFor === nurse.id ? 'Registrando...' : 'Mensualidad pagada'}
                        </Button>
                      </div>
                    </form>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>

        <TabsContent value="patients">
          <Card className="rounded-lg">
            <CardHeader>
              <CardTitle>Pacientes separados por enfermera</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 gap-3 md:grid-cols-[minmax(240px,360px)_1fr] md:items-end">
                <div className="space-y-2">
                  <Label>Enfermera</Label>
                  <Select value={selectedNurseId} onValueChange={setSelectedNurseId}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecciona una enfermera" />
                    </SelectTrigger>
                    <SelectContent>
                      {filteredNurses.map(nurse => (
                        <SelectItem key={nurse.id} value={nurse.id}>
                          {nurse.nombre}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="rounded-md border bg-muted/30 px-3 py-2 text-sm text-muted-foreground">
                  {selectedNurse
                    ? `${selectedNurse.nombre} - ${selectedNurse.ciudad || 'Sin ciudad'} - ${patientTotal} pacientes`
                    : 'Selecciona una enfermera'}
                </div>
              </div>

              <div className="overflow-x-auto rounded-lg border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nombre</TableHead>
                      <TableHead>Colonia</TableHead>
                      <TableHead>Domicilio</TableHead>
                      <TableHead>Telefono</TableHead>
                      <TableHead>Carnet</TableHead>
                      <TableHead>Visita</TableHead>
                      <TableHead>Actualizado por</TableHead>
                      <TableHead>Ultima actualizacion</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {patients.map(patient => (
                      <TableRow key={patient.id}>
                        <TableCell>{patient.nombreCompleto}</TableCell>
                        <TableCell>{patient.colonia}</TableCell>
                        <TableCell>{patient.calle} {patient.numeroCasa}</TableCell>
                        <TableCell>{patient.telefono || '-'}</TableCell>
                        <TableCell>{patient.carnet ? 'Si' : 'No'}</TableCell>
                        <TableCell>{patient.numeroVisita > 0 ? `Visita ${patient.numeroVisita}` : 'Sin visita'}</TableCell>
                        <TableCell>{patient.actualizadoPorNombre || patient.enfermera || '-'}</TableCell>
                        <TableCell>{new Date(patient.ultimaActualizacion).toLocaleString('es-MX')}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {patients.length === 0 && !isPatientsLoading && (
                <p className="text-center text-sm text-muted-foreground">No hay pacientes para esta enfermera.</p>
              )}

              {patients.length < patientTotal && (
                <Button variant="outline" className="h-12 w-full" disabled={isPatientsLoading} onClick={handleLoadMorePatients}>
                  {isPatientsLoading ? 'Cargando...' : `Cargar ${Math.min(PAGE_SIZE, patientTotal - patients.length)} mas`}
                </Button>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="backups">
          <Card className="rounded-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Download className="size-5 text-sky-700" />
                Respaldos y exportaciones
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-5">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                <div className="space-y-2">
                  <Label>Enfermera</Label>
                  <Select value={backupNurseId} onValueChange={setBackupNurseId}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todas las enfermeras</SelectItem>
                      {nurses.map(nurse => (
                        <SelectItem key={nurse.id} value={nurse.id}>
                          {nurse.nombre}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Actualizados desde</Label>
                  <Input type="date" value={backupFromDate} onChange={(event) => setBackupFromDate(event.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label>Actualizados hasta</Label>
                  <Input type="date" value={backupToDate} onChange={(event) => setBackupToDate(event.target.value)} />
                </div>
              </div>

              <div className="grid gap-3 rounded-lg border bg-slate-50 p-4 md:grid-cols-[1fr_auto_auto] md:items-center">
                <div>
                  <p className="font-medium">CSV de pacientes</p>
                  <p className="text-sm text-muted-foreground">
                    Exporta pacientes por enfermera o todos, en lotes para no trabar equipos lentos.
                  </p>
                </div>
                <Button type="button" variant="outline" disabled={isExportingBackup} onClick={handleSummaryExport}>
                  Exportar resumen
                </Button>
                <Button type="button" disabled={isExportingBackup} onClick={handleBackupExport}>
                  <Download className="size-4" />
                  {isExportingBackup ? 'Exportando...' : 'Exportar pacientes'}
                </Button>
              </div>

              {backupProgress && (
                <p className="rounded-md bg-sky-50 px-3 py-2 text-sm text-sky-900">{backupProgress}</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="users">
          <div className="grid grid-cols-1 gap-4 xl:grid-cols-[minmax(320px,480px)_1fr]">
            <Card className="rounded-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <UserPlus className="size-5 text-sky-700" />
                  Crear enfermera
                </CardTitle>
              </CardHeader>
              <CardContent>
                <form className="space-y-4" onSubmit={handleCreateNurse}>
                  <div className="space-y-2">
                    <Label>Nombre</Label>
                    <Input name="nombre" required placeholder="Nombre completo" />
                  </div>
                  <div className="space-y-2">
                    <Label>Correo</Label>
                    <Input name="email" type="email" required placeholder="correo@ejemplo.com" />
                  </div>
                  <div className="space-y-2">
                    <Label>Contrasena temporal</Label>
                    <Input name="password" type="text" required minLength={8} placeholder="Minimo 8 caracteres" />
                  </div>
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label>Ciudad</Label>
                      <Input name="ciudad" placeholder="Ciudad" />
                    </div>
                    <div className="space-y-2">
                      <Label>Estado</Label>
                      <select name="estado" className={selectClassName} defaultValue="activo">
                        <option value="activo">Activo</option>
                        <option value="suspendido">Suspendido</option>
                      </select>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Vencimiento de mensualidad</Label>
                    <Input name="fecha_vencimiento" type="date" />
                  </div>
                  <div className="space-y-2">
                    <Label>Notas</Label>
                    <Textarea name="notas" rows={3} />
                  </div>
                  <Button type="submit" disabled={isCreatingUser} className="w-full">
                    {isCreatingUser ? 'Creando...' : 'Crear usuario'}
                  </Button>
                </form>
              </CardContent>
            </Card>

            <Card className="rounded-lg">
              <CardHeader>
                <CardTitle>Administrar acceso</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {filteredNurses.map(nurse => (
                  <div key={nurse.id} className="rounded-lg border p-4">
                    <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                      <div>
                        <p className="font-medium">{nurse.nombre}</p>
                        <p className="text-sm text-muted-foreground">{nurse.email}</p>
                        <Badge className={nurse.estado === 'activo' ? 'mt-2 bg-emerald-100 text-emerald-800' : 'mt-2 bg-red-100 text-red-800'}>
                          {nurse.estado}
                        </Badge>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        <Button variant="outline" size="sm" onClick={() => handleStatusChange(nurse)}>
                          {nurse.estado === 'activo' ? 'Suspender' : 'Reactivar'}
                        </Button>
                        <Button variant="outline" size="sm" className="text-red-700" onClick={() => handleHardDelete(nurse)}>
                          <Trash2 className="size-4" />
                          Eliminar
                        </Button>
                      </div>
                    </div>

                    <form className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-[1fr_auto]" onSubmit={(event) => handlePasswordChange(event, nurse)}>
                      <Input name="password" type="text" minLength={8} placeholder="Nueva contrasena temporal" required />
                      <Button type="submit" disabled={editingPasswordFor === nurse.id}>
                        {editingPasswordFor === nurse.id ? 'Guardando...' : 'Cambiar'}
                      </Button>
                    </form>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
