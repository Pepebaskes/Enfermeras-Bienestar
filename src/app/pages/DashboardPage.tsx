import { useNavigate } from 'react-router';
import { Person } from '../models/person.model';
import { PatientStats } from '../services/patientService';
import { DashboardCards } from '../components/DashboardCards';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Plus, Search, Download, Upload, List } from 'lucide-react';
import { StatusTags } from '../components/StatusTags';
import { ImportCSV } from '../components/ImportCSV';

interface DashboardPageProps {
  persons: Person[];
  stats?: PatientStats | null;
  onImportCSV: (persons: Person[]) => void;
  onExportCSV: () => void;
}

export function DashboardPage({ persons, stats, onImportCSV, onExportCSV }: DashboardPageProps) {
  const navigate = useNavigate();

  const ultimosRegistros = [...persons]
    .sort((a, b) => new Date(b.ultimaActualizacion).getTime() - new Date(a.ultimaActualizacion).getTime())
    .slice(0, 5);

  return (
    <div className="space-y-6 p-4 md:p-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl">Enfermería de Campo</h1>
          <p className="text-gray-600 mt-1">Sistema de registro y seguimiento de visitas</p>
        </div>
      </div>

      <DashboardCards persons={persons} stats={stats} />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Button
          onClick={() => navigate('/personas/nuevo')}
          className="h-16 text-base"
          size="lg"
        >
          <Plus className="h-5 w-5 mr-2" />
          Nuevo Registro
        </Button>
        <Button
          onClick={() => navigate('/personas')}
          variant="outline"
          className="h-16 text-base"
          size="lg"
        >
          <List className="h-5 w-5 mr-2" />
          Ver Todas las Personas
        </Button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        <Button
          onClick={() => navigate('/personas')}
          variant="outline"
          className="h-14"
        >
          <Search className="h-4 w-4 mr-2" />
          Buscar
        </Button>
        <Button
          onClick={onExportCSV}
          variant="outline"
          className="h-14"
        >
          <Download className="h-4 w-4 mr-2" />
          Exportar CSV
        </Button>
        <ImportCSV onImport={onImportCSV} />
      </div>

      {ultimosRegistros.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Últimos Registros Modificados</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {ultimosRegistros.map((person) => (
                <div
                  key={person.id}
                  className="flex flex-col md:flex-row md:items-center justify-between p-3 border rounded-lg hover:bg-gray-50 cursor-pointer"
                  onClick={() => navigate(`/personas/${person.id}`)}
                >
                  <div className="flex-1">
                    <p className="font-medium">{person.nombreCompleto}</p>
                    <p className="text-sm text-gray-600">
                      {person.calle} {person.numeroCasa}, {person.colonia}
                    </p>
                    <StatusTags estados={person.estados} className="mt-1.5" />
                  </div>
                  <div className="text-xs text-gray-500 mt-2 md:mt-0">
                    {new Date(person.ultimaActualizacion).toLocaleDateString('es-MX')}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
