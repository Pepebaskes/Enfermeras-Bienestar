import { useCallback, useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router';
import { Person } from './models/person.model';
import { DashboardPage } from './pages/DashboardPage';
import { PeopleListPage } from './pages/PeopleListPage';
import { PersonDetailPage } from './pages/PersonDetailPage';
import { PersonFormPage } from './pages/PersonFormPage';
import { LoginPage } from './pages/LoginPage';
import { AdminDashboardPage } from './pages/AdminDashboardPage';
import { AccessPausedPage } from './pages/AccessPausedPage';
import { ImportCSV } from './components/ImportCSV';
import { ExportButton } from './components/ExportButton';
import { exportToCSV, downloadCSV } from './services/csvService';
import {
  getAuthErrorMessage,
  getCurrentProfile,
  getNurseAccessStatus,
  logout,
  NurseAccessStatus
} from './services/authService';
import {
  fetchPatientsPage,
  fetchPatientStats,
  PatientQueryOptions,
  PatientStats,
  savePatient
} from './services/patientService';
import { Profile } from './models/profile.model';
import { Toaster } from './components/ui/sonner';
import { Button } from './components/ui/button';
import { LogOut } from 'lucide-react';
import { toast } from 'sonner';

export default function App() {
  const [persons, setPersons] = useState<Person[]>([]);
  const [patientTotal, setPatientTotal] = useState(0);
  const [patientStats, setPatientStats] = useState<PatientStats | null>(null);
  const [isPatientsLoading, setIsPatientsLoading] = useState(false);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [accessStatus, setAccessStatus] = useState<NurseAccessStatus | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loginMessage, setLoginMessage] = useState('');

  useEffect(() => {
    const initializeApp = async () => {
      try {
        const currentProfile = await getCurrentProfile();
        if (!currentProfile) {
          return;
        }

        setProfile(currentProfile);
        if (currentProfile.rol === 'enfermera') {
          const currentAccessStatus = await getNurseAccessStatus(currentProfile);
          setAccessStatus(currentAccessStatus);

          if (currentAccessStatus.allowed) {
            await loadInitialPatients();
          }
        } else {
          setAccessStatus({
            allowed: true,
            reason: 'active',
            message: 'Acceso de administrador activo.'
          });
        }
      } catch (error) {
        setLoginMessage(getAuthErrorMessage(error));
      } finally {
        setIsLoading(false);
      }
    };

    initializeApp();
  }, []);

  const loadInitialPatients = useCallback(async () => {
    setIsPatientsLoading(true);
    try {
      const [page, stats] = await Promise.all([
        fetchPatientsPage({
          page: 0,
          pageSize: 100,
          sortField: 'fecha',
          sortOrder: 'desc'
        }),
        fetchPatientStats()
      ]);
      setPersons(page.persons);
      setPatientTotal(page.total);
      setPatientStats(stats);
    } finally {
      setIsPatientsLoading(false);
    }
  }, []);

  const loadPatientPage = useCallback(async (options: PatientQueryOptions, append = false) => {
    setIsPatientsLoading(true);
    try {
      const page = await fetchPatientsPage(options);
      setPatientTotal(page.total);
      setPersons(prev => append ? [...prev, ...page.persons] : page.persons);
    } finally {
      setIsPatientsLoading(false);
    }
  }, []);

  const handleLogin = async (loggedProfile: Profile) => {
    setProfile(loggedProfile);
    setLoginMessage('');
    try {
      if (loggedProfile.rol === 'enfermera') {
        const currentAccessStatus = await getNurseAccessStatus(loggedProfile);
        setAccessStatus(currentAccessStatus);

        if (currentAccessStatus.allowed) {
          await loadInitialPatients();
        } else {
          setPersons([]);
          setPatientTotal(0);
          setPatientStats(null);
        }
      } else {
        setAccessStatus({
          allowed: true,
          reason: 'active',
          message: 'Acceso de administrador activo.'
        });
        setPersons([]);
        setPatientTotal(0);
        setPatientStats(null);
      }
    } catch (error) {
      toast.error(getAuthErrorMessage(error));
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      setProfile(null);
      setAccessStatus(null);
      setPersons([]);
      setPatientTotal(0);
      setPatientStats(null);
      toast.success('Sesion cerrada');
    } catch (error) {
      toast.error(getAuthErrorMessage(error));
    }
  };

  const handleSavePerson = async (person: Person) => {
    if (!profile || !accessStatus?.allowed) {
      throw new Error('No hay una sesion activa');
    }

    const savedPerson = await savePatient(person, profile);
    setPatientStats(await fetchPatientStats());
    setPersons(prev => {
      const existing = prev.find(p => p.id === savedPerson.id);
      if (existing) {
        return prev.map(p => p.id === savedPerson.id ? savedPerson : p);
      } else {
        return [savedPerson, ...prev];
      }
    });
  };

  const handleRegisterNextVisit = async (personId: string) => {
    if (!profile || !accessStatus?.allowed) {
      throw new Error('No hay una sesion activa');
    }

    const person = persons.find(p => p.id === personId);
    if (!person) {
      throw new Error('Registro no encontrado');
    }

    const savedPerson = await savePatient({
      ...person,
      numeroVisita: (person.numeroVisita || 0) + 1,
      estados: ['visitado'],
      referencias: 'VISITADO',
      fechaVisita: new Date().toISOString(),
      ultimaActualizacion: new Date().toISOString()
    }, profile);

    setPersons(prev => prev.map(p => p.id === savedPerson.id ? savedPerson : p));
    setPatientStats(await fetchPatientStats());
  };

  const handleImportCSV = (importedPersons: Person[]) => {
    setPersons(prev => {
      const merged = [...prev];
      importedPersons.forEach(imported => {
        const existing = merged.find(p =>
          p.nombreCompleto === imported.nombreCompleto &&
          p.calle === imported.calle
        );
        if (!existing) {
          merged.push(imported);
        }
      });
      return merged;
    });
  };

  const handleExportCSV = () => {
    try {
      if (persons.length === 0) {
        toast.error('No hay registros para exportar');
        return;
      }
      const csvContent = exportToCSV(persons);
      const filename = `enfermeria_campo_${new Date().toISOString().split('T')[0]}.csv`;
      downloadCSV(csvContent, filename);
      toast.success(`${persons.length} registros exportados exitosamente`);
    } catch (error) {
      console.error('Error al exportar CSV:', error);
      toast.error('Error al exportar los datos');
    }
  };

  if (isLoading) {
    return (
      <div className="size-full flex items-center justify-center">
        <div className="text-center">
          <p className="text-xl text-gray-600">Cargando...</p>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <>
        <LoginPage onLogin={handleLogin} message={loginMessage} />
        <Toaster position="top-right" />
      </>
    );
  }

  return (
    <BrowserRouter>
      <div className="min-h-screen bg-background">
        <header className="border-b bg-background px-4 py-3 md:px-6">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-sm font-medium">{profile.nombre}</p>
              <p className="text-xs text-muted-foreground">
                {profile.rol === 'admin' ? 'Administrador' : 'Enfermera'}
                {profile.ciudad ? ` - ${profile.ciudad}` : ''}
              </p>
            </div>
            <Button variant="outline" size="sm" onClick={handleLogout} className="w-fit">
              <LogOut className="h-4 w-4" />
              Cerrar sesion
            </Button>
          </div>
        </header>
        {profile.rol === 'admin' ? (
          <Routes>
            <Route path="/" element={<AdminDashboardPage />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        ) : accessStatus && !accessStatus.allowed ? (
          <AccessPausedPage profile={profile} accessStatus={accessStatus} onLogout={handleLogout} />
        ) : (
          <Routes>
            <Route
              path="/"
              element={
                <DashboardPage
                  persons={persons}
                  stats={patientStats}
                  onImportCSV={handleImportCSV}
                  onExportCSV={handleExportCSV}
                />
              }
            />
            <Route
              path="/personas"
              element={
                <PeopleListPage
                  persons={persons}
                  total={patientTotal}
                  isLoading={isPatientsLoading}
                  onLoadPatients={loadPatientPage}
                />
              }
            />
            <Route
              path="/personas/nuevo"
              element={
                <PersonFormPage
                  persons={persons}
                  profile={profile}
                  onSave={handleSavePerson}
                />
              }
            />
            <Route
              path="/personas/:id"
              element={
                <PersonDetailPage
                  persons={persons}
                  onRegisterNextVisit={handleRegisterNextVisit}
                />
              }
            />
            <Route
              path="/personas/:id/editar"
              element={
                <PersonFormPage
                  persons={persons}
                  profile={profile}
                  onSave={handleSavePerson}
                />
              }
            />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        )}
        <Toaster position="top-right" />
      </div>
    </BrowserRouter>
  );
}

