import { useNavigate, useParams } from 'react-router';
import { useState } from 'react';
import { Person } from '../models/person.model';
import { Profile } from '../models/profile.model';
import { PersonForm } from '../components/PersonForm';
import { Button } from '../components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';

interface PersonFormPageProps {
  persons: Person[];
  profile: Profile;
  onSave: (person: Person) => Promise<void>;
}

export function PersonFormPage({ persons, profile, onSave }: PersonFormPageProps) {
  const navigate = useNavigate();
  const { id } = useParams();

  const person = id ? persons.find(p => p.id === id) : undefined;
  const isEdit = !!person;
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async (data: Partial<Person>) => {
    const newPerson: Person = {
      id: data.id || '',
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

      <PersonForm
        person={person}
        responsibleName={profile.nombre}
        onSave={handleSave}
        onCancel={() => navigate(-1)}
        isSaving={isSaving}
      />
    </div>
  );
}
