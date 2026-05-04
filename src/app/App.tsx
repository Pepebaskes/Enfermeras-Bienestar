import { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router';
import { Person } from './models/person.model';
import { INITIAL_PATIENTS } from './data/initialPatients';
import { DashboardPage } from './pages/DashboardPage';
import { PeopleListPage } from './pages/PeopleListPage';
import { PersonDetailPage } from './pages/PersonDetailPage';
import { PersonFormPage } from './pages/PersonFormPage';
import { ImportCSV } from './components/ImportCSV';
import { ExportButton } from './components/ExportButton';
import { exportToCSV, downloadCSV } from './services/csvService';
import { saveToLocalStorage } from './services/storageService';
import { Toaster } from './components/ui/sonner';
import { toast } from 'sonner';

export default function App() {
  const [persons, setPersons] = useState<Person[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setPersons(INITIAL_PATIENTS);
    saveToLocalStorage(INITIAL_PATIENTS);
    setIsLoading(false);
  }, []);

  useEffect(() => {
    if (!isLoading && persons.length > 0) {
      saveToLocalStorage(persons);
    }
  }, [persons, isLoading]);

  const handleSavePerson = (person: Person) => {
    setPersons(prev => {
      const existing = prev.find(p => p.id === person.id);
      if (existing) {
        return prev.map(p => p.id === person.id ? person : p);
      } else {
        return [...prev, person];
      }
    });
  };

  const handleRegisterNextVisit = (personId: string) => {
    setPersons(prev => prev.map(p => {
      if (p.id === personId) {
        return {
          ...p,
          numeroVisita: (p.numeroVisita || 0) + 1,
          estados: ['visitado'],
          referencias: 'VISITADO',
          fechaVisita: new Date().toISOString(),
          ultimaActualizacion: new Date().toISOString()
        };
      }
      return p;
    }));
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

  return (
    <BrowserRouter>
      <div className="min-h-screen bg-background">
        <Routes>
          <Route
            path="/"
            element={
              <DashboardPage
                persons={persons}
                onImportCSV={handleImportCSV}
                onExportCSV={handleExportCSV}
              />
            }
          />
          <Route
            path="/personas"
            element={<PeopleListPage persons={persons} />}
          />
          <Route
            path="/personas/nuevo"
            element={
              <PersonFormPage
                persons={persons}
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
                onSave={handleSavePerson}
              />
            }
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
        <Toaster position="top-right" />
      </div>
    </BrowserRouter>
  );
}

