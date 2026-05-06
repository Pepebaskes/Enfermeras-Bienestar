import { useNavigate, useParams } from 'react-router';
import { Person } from '../models/person.model';
import { PersonForm } from '../components/PersonForm';
import { Button } from '../components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';

interface PersonFormPageProps {
  persons: Person[];
  onSave: (person: Person) => void;
}

export function PersonFormPage({ persons, onSave }: PersonFormPageProps) {
  const navigate = useNavigate();
  const { id } = useParams();

  const person = id ? persons.find(p => p.id === id) : undefined;
  const isEdit = !!person;

  const handleSave = (data: Partial<Person>) => {
    const newPerson: Person = {
      id: data.id || crypto.randomUUID(),
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
      enfermera: data.enfermera,
      ultimaActualizacion: new Date().toISOString(),
      fechaCreacion: data.fechaCreacion || new Date().toISOString()
    };

    onSave(newPerson);
    toast.success(isEdit ? 'Registro actualizado exitosamente' : 'Registro creado exitosamente');
    navigate('/personas');
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
        onSave={handleSave}
        onCancel={() => navigate(-1)}
      />
    </div>
  );
}
