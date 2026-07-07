import { useNavigate, useParams } from 'react-router';
import { useEffect, useState } from 'react';
import { Person } from '../models/person.model';
import { Profile } from '../models/profile.model';
import { PersonForm } from '../components/PersonForm';
import { Button } from '../components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';
import { fetchPatientById } from '../services/patientService';

interface PersonFormPageProps {
  persons: Person[];
  profile: Profile;
  onSave: (person: Person) => Promise<void>;
}

export function PersonFormPage({ persons, profile, onSave }: PersonFormPageProps) {
  const navigate = useNavigate();
  const { id } = useParams();

  const localPerson = id ? persons.find(p => p.id === id) : undefined;
  const [remotePerson, setRemotePerson] = useState<Person | undefined>(localPerson);
  const [isLoadingPerson, setIsLoadingPerson] = useState(Boolean(id));
  const person = remotePerson || localPerson;
  const isEdit = Boolean(id);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    let isMounted = true;

    const loadFreshPerson = async () => {
      if (!id) {
        setIsLoadingPerson(false);
        setRemotePerson(undefined);
        return;
      }

      setIsLoadingPerson(true);
      try {
        const freshPerson = await fetchPatientById(id);
        if (isMounted) {
          setRemotePerson(freshPerson);
        }
      } catch (error) {
        const message = error instanceof Error ? error.message : 'No se pudo cargar el paciente';
        toast.error(message);
      } finally {
        if (isMounted) {
          setIsLoadingPerson(false);
        }
      }
    };

    loadFreshPerson();

    return () => {
      isMounted = false;
    };
  }, [id]);

  const handleSave = async (data: Partial<Person>) => {
    const newPerson: Person = {
      id: data.id || id || '',
      nombreCompleto: data.nombreCompleto!,
      calle: data.calle!,
      numeroCasa: data.numeroCasa!,
      colonia: data.colonia!,
      carnet: data.carnet ?? false,
      telefono: data.telefono,
      referencias: data.referencias,
      observaciones: data.observaciones,
      estados: data.estados || [],
      numeroVisita: data.numeroVisita ?? 0,
      fechaVisita: data.fechaVisita,
      enfermera: profile.nombre,
      edad: data.edad,
      pamOPcd: data.pamOPcd,
      enfermedades: data.enfermedades,
      exploracionFisica: data.exploracionFisica,
      diagnostico: data.diagnostico,
      tratamiento: data.tratamiento,
      taSistolica: data.taSistolica,
      taDiastolica: data.taDiastolica,
      frecuenciaRespiratoria: data.frecuenciaRespiratoria,
      temperatura: data.temperatura,
      escalaGlasgow: data.escalaGlasgow,
      grupoRiesgo: data.grupoRiesgo,
      frecuenciaCardiaca: data.frecuenciaCardiaca,
      peso: data.peso,
      talla: data.talla,
      saturacion: data.saturacion,
      pruebasHorasAyuno: data.pruebasHorasAyuno,
      pruebasFechaHoraMuestra: data.pruebasFechaHoraMuestra,
      lancetasUsadas: data.lancetasUsadas,
      tirasUsadas: data.tirasUsadas,
      glucosaResultado: data.glucosaResultado,
      trigliceridosResultado: data.trigliceridosResultado,
      colesterolResultado: data.colesterolResultado,
      pantorrillaCm: data.pantorrillaCm,
      brazoCm: data.brazoCm,
      cinturaCm: data.cinturaCm,
      discapacidad: data.discapacidad,
      nota: data.nota,
      ultimaActualizacion: new Date().toISOString(),
      fechaCreacion: data.fechaCreacion || new Date().toISOString()
    };

    try {
      setIsSaving(true);
      await onSave(newPerson);
      toast.success(isEdit ? 'Registro actualizado exitosamente' : 'Registro creado exitosamente');
      navigate('/personas');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Error al guardar el registro';
      toast.error(message);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="mx-auto max-w-4xl space-y-5 px-4 pb-8 pt-4 sm:space-y-6 sm:px-6 sm:pt-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate(-1)}
          className="w-fit"
        >
          <ArrowLeft className="h-4 w-4 mr-1" />
          Volver
        </Button>
        <h1 className="text-2xl leading-tight sm:text-3xl">
          {isEdit ? 'Editar Registro' : 'Nuevo Registro'}
        </h1>
      </div>

      {isLoadingPerson ? (
        <div className="rounded-lg border bg-white p-6 text-center text-muted-foreground">
          Cargando informacion actualizada del paciente...
        </div>
      ) : isEdit && !person ? (
        <div className="rounded-lg border bg-white p-6 text-center">
          <p className="text-muted-foreground">No se encontro el paciente.</p>
          <Button className="mt-4" onClick={() => navigate('/personas')}>Volver al listado</Button>
        </div>
      ) : (
        <PersonForm
          person={person}
          responsibleName={profile.nombre}
          onSave={handleSave}
          onCancel={() => navigate(-1)}
          isSaving={isSaving}
        />
      )}
    </div>
  );
}
