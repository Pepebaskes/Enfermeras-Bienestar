import { useNavigate, useParams } from 'react-router';
import { useEffect, useState } from 'react';
import { Person } from '../models/person.model';
import { StatusTags } from '../components/StatusTags';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { ArrowLeft, Edit, MapPin, Phone, Calendar, FileText, Clock, PlusCircle } from 'lucide-react';
import { toast } from 'sonner';
import { fetchPatientById } from '../services/patientService';
import { calculateImc } from '../utils/imc';

interface PersonDetailPageProps {
  persons: Person[];
  onRegisterNextVisit: (personId: string) => Promise<void>;
}

export function PersonDetailPage({ persons, onRegisterNextVisit }: PersonDetailPageProps) {
  const navigate = useNavigate();
  const { id } = useParams();

  const localPerson = persons.find(p => p.id === id);
  const [freshPerson, setFreshPerson] = useState<Person | undefined>(localPerson);
  const [isLoadingFreshPerson, setIsLoadingFreshPerson] = useState(Boolean(id));
  const person = freshPerson || localPerson;

  useEffect(() => {
    let isMounted = true;

    const loadFreshPerson = async () => {
      if (!id) {
        setIsLoadingFreshPerson(false);
        return;
      }

      setIsLoadingFreshPerson(true);
      try {
        const loadedPerson = await fetchPatientById(id);
        if (isMounted) {
          setFreshPerson(loadedPerson);
        }
      } catch (error) {
        const message = error instanceof Error ? error.message : 'No se pudo cargar la informacion actualizada';
        toast.error(message);
      } finally {
        if (isMounted) {
          setIsLoadingFreshPerson(false);
        }
      }
    };

    loadFreshPerson();

    return () => {
      isMounted = false;
    };
  }, [id]);

  if (isLoadingFreshPerson && !person) {
    return (
      <div className="p-4 md:p-6">
        <div className="rounded-lg border bg-white p-6 text-center text-muted-foreground">
          Cargando informacion actualizada del paciente...
        </div>
      </div>
    );
  }

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
  const imc = calculateImc(person.peso, person.talla, person.edad);
  const sexLabelByValue: Record<string, string> = {
    femenino: 'Femenino',
    masculino: 'Masculino',
    otro: 'Otro'
  };
  const hasValue = (value: unknown) => value !== undefined && value !== null && value !== '';
  const hasHealthData = [
    person.edad,
    person.sexo,
    person.pamOPcd,
    person.enfermedades,
    person.exploracionFisica,
    person.diagnostico,
    person.tratamiento,
    person.taSistolica,
    person.taDiastolica,
    person.frecuenciaRespiratoria,
    person.temperatura,
    person.escalaGlasgow,
    person.grupoRiesgo,
    person.frecuenciaCardiaca,
    person.peso,
    person.talla,
    person.saturacion,
    person.pruebasHorasAyuno,
    person.pruebasFechaHoraMuestra,
    person.lancetasUsadas,
    person.glucosaResultado,
    person.glucosaTirasUsadas,
    person.trigliceridosResultado,
    person.trigliceridosTirasUsadas,
    person.colesterolResultado,
    person.colesterolTirasUsadas,
    person.pantorrillaCm,
    person.brazoCm,
    person.cinturaCm,
    person.discapacidad,
    person.nota
  ].some(hasValue);
  const renderField = (label: string, value: unknown) => hasValue(value) ? (
    <div>
      <span className="text-sm text-gray-600">{label}:</span>
      <p className="text-base whitespace-pre-wrap">{String(value)}</p>
    </div>
  ) : null;
  const renderDateTimeField = (label: string, value?: string) => value ? (
    <div>
      <span className="text-sm text-gray-600">{label}:</span>
      <p className="text-base">{new Date(value).toLocaleString('es-MX')}</p>
    </div>
  ) : null;

  const handleRegisterNextVisit = async () => {
    try {
      await onRegisterNextVisit(person.id);
      const updatedPerson = await fetchPatientById(person.id);
      setFreshPerson(updatedPerson);
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

      {!hasHealthData && (
        <Card>
          <CardHeader>
            <CardTitle>Salud Casa por Casa / Bienestar</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600">
              Este paciente todavia no tiene datos capturados del formato nuevo.
            </p>
          </CardContent>
        </Card>
      )}

      {(hasValue(person.edad) || hasValue(person.sexo) || hasValue(person.pamOPcd) || hasValue(person.grupoRiesgo) || hasValue(person.enfermedades)) && (
        <Card>
          <CardHeader>
            <CardTitle>Datos generales Salud Casa por Casa</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {renderField('Edad', person.edad)}
            {renderField('Sexo', person.sexo ? sexLabelByValue[person.sexo] || person.sexo : undefined)}
            {renderField('PAM o PCD', person.pamOPcd)}
            {renderField('Grupo de riesgo', person.grupoRiesgo)}
            <div className="sm:col-span-2">{renderField('Enfermedades', person.enfermedades)}</div>
          </CardContent>
        </Card>
      )}

      {(hasValue(person.taSistolica) || hasValue(person.taDiastolica) || hasValue(person.frecuenciaRespiratoria) || hasValue(person.temperatura) || hasValue(person.escalaGlasgow) || hasValue(person.frecuenciaCardiaca) || hasValue(person.peso) || hasValue(person.talla) || hasValue(person.saturacion) || Boolean(imc)) && (
        <Card>
          <CardHeader>
            <CardTitle>Signos vitales</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            {renderField('TA sistolica', person.taSistolica)}
            {renderField('TA diastolica', person.taDiastolica)}
            {renderField('Frecuencia respiratoria', person.frecuenciaRespiratoria)}
            {renderField('Temperatura', person.temperatura)}
            {renderField('Escala Glasgow', person.escalaGlasgow)}
            {renderField('Frecuencia cardiaca', person.frecuenciaCardiaca)}
            {renderField('Peso', person.peso)}
            {renderField('Talla / altura', person.talla)}
            {renderField('Saturacion', person.saturacion)}
            {imc && (
              <div className="rounded-md border border-emerald-200 bg-emerald-50 p-3 sm:col-span-3">
                <span className="text-sm text-emerald-900">IMC:</span>
                <p className="text-xl font-semibold text-emerald-950">{imc.formattedValue}</p>
                <p className="text-sm text-emerald-900">{imc.label}</p>
                {imc.note && (
                  <p className="text-xs leading-5 text-emerald-800">{imc.note}</p>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {(hasValue(person.exploracionFisica) || hasValue(person.diagnostico) || hasValue(person.tratamiento)) && (
        <Card>
          <CardHeader>
            <CardTitle>Exploracion / diagnostico / tratamiento</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {renderField('Exploracion fisica', person.exploracionFisica)}
            {renderField('Diagnostico', person.diagnostico)}
            {renderField('Tratamiento', person.tratamiento)}
          </CardContent>
        </Card>
      )}

      {(hasValue(person.pruebasHorasAyuno) || hasValue(person.pruebasFechaHoraMuestra) || hasValue(person.lancetasUsadas) || hasValue(person.glucosaResultado) || hasValue(person.glucosaTirasUsadas) || hasValue(person.trigliceridosResultado) || hasValue(person.trigliceridosTirasUsadas) || hasValue(person.colesterolResultado) || hasValue(person.colesterolTirasUsadas)) && (
        <Card>
          <CardHeader>
            <CardTitle>Pruebas medicas</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 gap-3 rounded-md border p-3 sm:grid-cols-2">
              {renderField('Horas de ayuno', person.pruebasHorasAyuno)}
              {renderDateTimeField('Fecha y hora de muestra', person.pruebasFechaHoraMuestra)}
              {renderField('Lancetas usadas', person.lancetasUsadas)}
            </div>
            <div className="grid grid-cols-1 gap-3 rounded-md border p-3 sm:grid-cols-2">
              {renderField('Glucosa resultado', person.glucosaResultado)}
              {renderField('Tiras usadas', person.glucosaTirasUsadas)}
            </div>
            <div className="grid grid-cols-1 gap-3 rounded-md border p-3 sm:grid-cols-2">
              {renderField('Trigliceridos resultado', person.trigliceridosResultado)}
              {renderField('Tiras usadas', person.trigliceridosTirasUsadas)}
            </div>
            <div className="grid grid-cols-1 gap-3 rounded-md border p-3 sm:grid-cols-2">
              {renderField('Colesterol resultado', person.colesterolResultado)}
              {renderField('Tiras usadas', person.colesterolTirasUsadas)}
            </div>
          </CardContent>
        </Card>
      )}

      {(hasValue(person.pantorrillaCm) || hasValue(person.brazoCm) || hasValue(person.cinturaCm)) && (
        <Card>
          <CardHeader>
            <CardTitle>Mediciones</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            {renderField('Pantorrilla (cm)', person.pantorrillaCm)}
            {renderField('Brazo (cm)', person.brazoCm)}
            {renderField('Cintura (cm)', person.cinturaCm)}
          </CardContent>
        </Card>
      )}

      {(hasValue(person.discapacidad) || hasValue(person.nota)) && (
        <Card>
          <CardHeader>
            <CardTitle>Discapacidad / notas</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {renderField('Discapacidad', person.discapacidad)}
            {renderField('Nota', person.nota)}
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
