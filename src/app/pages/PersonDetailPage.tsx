import { useNavigate, useParams } from 'react-router';
import { Person } from '../models/person.model';
import { StatusTags } from '../components/StatusTags';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { ArrowLeft, Edit, MapPin, Phone, Calendar, FileText, Clock, PlusCircle } from 'lucide-react';
import { toast } from 'sonner';

interface PersonDetailPageProps {
  persons: Person[];
  onRegisterNextVisit: (personId: string) => Promise<void>;
}

export function PersonDetailPage({ persons, onRegisterNextVisit }: PersonDetailPageProps) {
  const navigate = useNavigate();
  const { id } = useParams();

  const person = persons.find(p => p.id === id);

  if (!person) {
    return (
      <div className="p-4 md:p-6">
        <div className="text-center py-12">
          <p className="text-gray-600">Registro no encontrado</p>
          <Button
            onClick={() => navigate('/personas')}
            className="mt-4"
          >
            Volver al listado
          </Button>
        </div>
      </div>
    );
  }

  const currentVisitNumber = person.numeroVisita || 0;
  const nextVisitNumber = currentVisitNumber + 1;

  const handleRegisterNextVisit = async () => {
    try {
      await onRegisterNextVisit(person.id);
      toast.success(`Visita ${nextVisitNumber} registrada`);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Error al registrar la visita';
      toast.error(message);
    }
  };

  const handleCopyInfo = () => {
    const info = `
Nombre: ${person.nombreCompleto}
Domicilio: ${person.calle} ${person.numeroCasa}, ${person.colonia}
Teléfono: ${person.telefono || 'No disponible'}
    `.trim();

    navigator.clipboard.writeText(info);
    toast.success('Información copiada al portapapeles');
  };

  return (
    <div className="space-y-6 p-4 md:p-6 max-w-4xl mx-auto">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate(-1)}
          >
            <ArrowLeft className="h-4 w-4 mr-1" />
            Volver
          </Button>
        </div>
        <Button
          onClick={() => navigate(`/personas/${person.id}/editar`)}
          size="sm"
        >
          <Edit className="h-4 w-4 mr-1" />
          Editar
        </Button>
      </div>

      <div>
        <h1 className="text-3xl">{person.nombreCompleto}</h1>
        <div className="mt-3 flex flex-wrap items-center gap-2">
          <span className="inline-flex items-center rounded-md border border-sky-200 bg-sky-50 px-3 py-1.5 text-sm font-medium text-sky-800">
            {currentVisitNumber > 0 ? `Visita ${currentVisitNumber}` : 'Sin visita'}
          </span>
          <StatusTags estados={person.estados} />
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5" />
            Domicilio
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <div>
            <span className="text-sm text-gray-600">Calle:</span>
            <p className="text-base">{person.calle}</p>
          </div>
          <div>
            <span className="text-sm text-gray-600">Número:</span>
            <p className="text-base">{person.numeroCasa || 'No especificado'}</p>
          </div>
          <div>
            <span className="text-sm text-gray-600">Colonia:</span>
            <p className="text-base">{person.colonia}</p>
          </div>
          {person.referencias && (
            <div>
              <span className="text-sm text-gray-600">Referencias:</span>
              <p className="text-base">{person.referencias}</p>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Phone className="h-5 w-5" />
            Contacto
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div>
            <span className="text-sm text-gray-600">Teléfono:</span>
            <p className="text-base">{person.telefono || 'No disponible'}</p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Información de Visita
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <div>
            <span className="text-sm text-gray-600">Visita actual:</span>
            <p className="text-base">{currentVisitNumber > 0 ? `Visita ${currentVisitNumber}` : 'Sin visita'}</p>
          </div>
          <div>
            <span className="text-sm text-gray-600">Siguiente visita:</span>
            <p className="text-base">Visita {nextVisitNumber}</p>
          </div>
          <div>
            <span className="text-sm text-gray-600">Fecha de visita:</span>
            <p className="text-base">
              {person.fechaVisita
                ? new Date(person.fechaVisita).toLocaleDateString('es-MX')
                : 'No visitado aún'
              }
            </p>
          </div>
          {person.enfermera && (
            <div>
              <span className="text-sm text-gray-600">Enfermera responsable:</span>
              <p className="text-base">{person.enfermera}</p>
            </div>
          )}
        </CardContent>
      </Card>

      {person.observaciones && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Observaciones
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-base whitespace-pre-wrap">{person.observaciones}</p>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Historial
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <div>
            <span className="text-sm text-gray-600">Fecha de creación:</span>
            <p className="text-base">
              {new Date(person.fechaCreacion).toLocaleString('es-MX')}
            </p>
          </div>
          <div>
            <span className="text-sm text-gray-600">Última actualización:</span>
            <p className="text-base">
              {new Date(person.ultimaActualizacion).toLocaleString('es-MX')}
            </p>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <Button
          onClick={handleRegisterNextVisit}
          size="lg"
          className="h-12"
        >
          <PlusCircle className="h-5 w-5 mr-2" />
          Registrar visita {nextVisitNumber}
        </Button>
        <Button
          onClick={handleCopyInfo}
          variant="outline"
          size="lg"
          className="h-12"
        >
          Copiar Información
        </Button>
      </div>
    </div>
  );
}
