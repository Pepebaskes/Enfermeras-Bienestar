import { useState } from 'react';
import { Person, PersonStatus, STATUS_LABELS } from '../models/person.model';
import { validatePersonForm } from '../utils/validators';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Checkbox } from './ui/checkbox';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';

interface PersonFormProps {
  person?: Person;
  responsibleName: string;
  onSave: (data: Partial<Person>) => void;
  onCancel: () => void;
  isSaving?: boolean;
}

const allEstados: PersonStatus[] = [
  'visitado',
  'fuera_del_pais',
  'sin_visita',
  'no_encontrado',
  'no_quiso_programa',
  'cambio_domicilio',
  'finado'
];

const getTodayDate = () => {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, '0');
  const day = String(today.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const toUpperValue = (value: string) => value.trim().toUpperCase();

export function PersonForm({ person, responsibleName, onSave, onCancel, isSaving = false }: PersonFormProps) {
  const [formData, setFormData] = useState({
    nombreCompleto: person?.nombreCompleto || '',
    calle: person?.calle || '',
    numeroCasa: person?.numeroCasa || '',
    colonia: person?.colonia || '',
    carnet: person?.carnet ?? false,
    telefono: person?.telefono || '',
    referencias: person?.referencias || '',
    observaciones: person?.observaciones || '',
    estados: person?.estados || [] as PersonStatus[],
    numeroVisita: person?.numeroVisita ?? 0,
    fechaVisita: person?.fechaVisita || getTodayDate()
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const handleNumberChange = (field: string, value: string) => {
    const numericValue = Math.max(0, Number(value) || 0);
    setFormData(prev => ({ ...prev, [field]: numericValue }));
    if (errors[field]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const handleEstadoToggle = (estado: PersonStatus) => {
    setFormData(prev => ({
      ...prev,
      estados: prev.estados.includes(estado)
        ? prev.estados.filter(e => e !== estado)
        : [...prev.estados, estado]
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const validationErrors = validatePersonForm(formData);
    if (validationErrors.length > 0) {
      const errorMap: Record<string, string> = {};
      validationErrors.forEach(error => {
        errorMap[error.field] = error.message;
      });
      setErrors(errorMap);
      return;
    }

    setErrors({});

    if (formData.observaciones.trim() === '') {
      const shouldSave = window.confirm('Sin observaciones, desea guardar');
      if (!shouldSave) {
        return;
      }
    }

    const dataToSave: Partial<Person> = {
      ...formData,
      nombreCompleto: toUpperValue(formData.nombreCompleto),
      calle: toUpperValue(formData.calle),
      numeroCasa: toUpperValue(formData.numeroCasa),
      colonia: toUpperValue(formData.colonia),
      carnet: formData.carnet,
      telefono: formData.telefono.trim() || undefined,
      referencias: formData.referencias ? toUpperValue(formData.referencias) : undefined,
      observaciones: formData.observaciones ? toUpperValue(formData.observaciones) : undefined,
      fechaVisita: formData.fechaVisita || undefined,
      enfermera: responsibleName
    };

    if (person) {
      dataToSave.id = person.id;
      dataToSave.fechaCreacion = person.fechaCreacion;
    }

    onSave(dataToSave);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5 sm:space-y-6">
      <Card className="overflow-hidden rounded-lg shadow-sm">
        <CardHeader className="px-4 pt-4 sm:px-6 sm:pt-6">
          <CardTitle className="text-lg leading-tight">Datos Personales</CardTitle>
        </CardHeader>
        <CardContent className="space-y-5 px-4 pb-4 sm:px-6 sm:pb-6">
          <div className="min-w-0 space-y-2">
            <Label htmlFor="nombreCompleto" className="block text-sm leading-5 text-foreground">
              Nombre Completo <span className="text-red-500">*</span>
            </Label>
            <Input
              id="nombreCompleto"
              value={formData.nombreCompleto}
              onChange={(e) => handleChange('nombreCompleto', e.target.value)}
              className={`min-h-12 border-sky-200 bg-sky-50/80 py-3 text-base leading-6 shadow-sm focus-visible:border-sky-500 ${errors.nombreCompleto ? 'border-red-500' : ''}`}
            />
            {errors.nombreCompleto && (
              <p className="text-sm leading-5 text-red-500">{errors.nombreCompleto}</p>
            )}
          </div>
        </CardContent>
      </Card>

      <Card className="overflow-hidden rounded-lg shadow-sm">
        <CardHeader className="px-4 pt-4 sm:px-6 sm:pt-6">
          <CardTitle className="text-lg leading-tight">Domicilio</CardTitle>
        </CardHeader>
        <CardContent className="space-y-5 px-4 pb-4 sm:px-6 sm:pb-6">
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            <div className="min-w-0 space-y-2">
              <Label htmlFor="calle" className="block text-sm leading-5 text-foreground">
                Calle <span className="text-red-500">*</span>
              </Label>
              <Input
                id="calle"
                value={formData.calle}
                onChange={(e) => handleChange('calle', e.target.value)}
                className={`min-h-12 border-sky-200 bg-sky-50/80 py-3 text-base leading-6 shadow-sm focus-visible:border-sky-500 ${errors.calle ? 'border-red-500' : ''}`}
              />
              {errors.calle && (
                <p className="text-sm leading-5 text-red-500">{errors.calle}</p>
              )}
            </div>

            <div>
              <Label htmlFor="numeroCasa">Número de Casa</Label>
              <Input
                id="numeroCasa"
                value={formData.numeroCasa}
                onChange={(e) => handleChange('numeroCasa', e.target.value)}
                className={`min-h-12 border-sky-200 bg-sky-50/80 py-3 text-base leading-6 shadow-sm focus-visible:border-sky-500 ${errors.numeroCasa ? 'border-red-500' : ''}`}
              />
              {errors.numeroCasa && (
                <p className="text-sm leading-5 text-red-500">{errors.numeroCasa}</p>
              )}
            </div>
          </div>

          <div className="min-w-0 space-y-2">
            <Label htmlFor="colonia" className="block text-sm leading-5 text-foreground">
              Colonia <span className="text-red-500">*</span>
            </Label>
            <Input
              id="colonia"
              value={formData.colonia}
              onChange={(e) => handleChange('colonia', e.target.value)}
              className={`min-h-12 border-sky-200 bg-sky-50/80 py-3 text-base leading-6 shadow-sm focus-visible:border-sky-500 ${errors.colonia ? 'border-red-500' : ''}`}
            />
            {errors.colonia && (
              <p className="text-sm leading-5 text-red-500">{errors.colonia}</p>
            )}
          </div>

          <div className="min-w-0 space-y-2">
            <Label htmlFor="referencias" className="block text-sm leading-5 text-foreground">
              Referencias del Domicilio <span className="text-red-500">*</span>
            </Label>
            <Textarea
              id="referencias"
              value={formData.referencias}
              onChange={(e) => handleChange('referencias', e.target.value)}
              placeholder="Ej: Casa de dos pisos, portón azul"
              rows={2}
              className={`min-h-24 border-sky-200 bg-sky-50/80 text-base leading-6 shadow-sm focus-visible:border-sky-500 ${errors.referencias ? 'border-red-500' : ''}`}
            />
            {errors.referencias && (
              <p className="text-sm leading-5 text-red-500">{errors.referencias}</p>
            )}
          </div>
        </CardContent>
      </Card>

      <Card className="overflow-hidden rounded-lg shadow-sm">
        <CardHeader className="px-4 pt-4 sm:px-6 sm:pt-6">
          <CardTitle className="text-lg leading-tight">Contacto</CardTitle>
        </CardHeader>
        <CardContent className="space-y-5 px-4 pb-4 sm:px-6 sm:pb-6">
          <div className="min-w-0 space-y-2">
            <Label htmlFor="telefono">Teléfono</Label>
            <Input
              id="telefono"
              type="tel"
              value={formData.telefono}
              onChange={(e) => handleChange('telefono', e.target.value)}
              className={`min-h-12 border-sky-200 bg-sky-50/80 py-3 text-base leading-6 shadow-sm focus-visible:border-sky-500 ${errors.telefono ? 'border-red-500' : ''}`}
              placeholder="Ej: 555-123-4567"
            />
            {errors.telefono && (
              <p className="text-sm leading-5 text-red-500">{errors.telefono}</p>
            )}
          </div>
        </CardContent>
      </Card>

      <Card className="overflow-hidden rounded-lg shadow-sm">
        <CardHeader className="px-4 pt-4 sm:px-6 sm:pt-6">
          <CardTitle className="text-lg leading-tight">Control de Visitas</CardTitle>
        </CardHeader>
        <CardContent className="space-y-5 px-4 pb-4 sm:px-6 sm:pb-6">
          <div className="min-w-0 space-y-2">
            <Label htmlFor="numeroVisita" className="block text-sm leading-5 text-foreground">
              Numero de visita <span className="text-red-500">*</span>
            </Label>
            <Input
              id="numeroVisita"
              type="number"
              min={0}
              step={1}
              value={formData.numeroVisita}
              onChange={(e) => handleNumberChange('numeroVisita', e.target.value)}
              className={`min-h-12 border-sky-200 bg-sky-50/80 py-3 text-base leading-6 shadow-sm focus-visible:border-sky-500 ${errors.numeroVisita ? 'border-red-500' : ''}`}
            />
            {errors.numeroVisita && (
              <p className="text-sm leading-5 text-red-500">{errors.numeroVisita}</p>
            )}
            <p className="text-sm leading-5 text-muted-foreground">
              La siguiente visita sera la numero {(formData.numeroVisita || 0) + 1}.
            </p>
          </div>
        </CardContent>
      </Card>

      <Card className="overflow-hidden rounded-lg shadow-sm">
        <CardHeader className="px-4 pt-4 sm:px-6 sm:pt-6">
          <CardTitle className="text-lg leading-tight">Estados y Validaciones</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 px-4 pb-4 sm:px-6 sm:pb-6">
          <div className="flex min-h-10 items-start gap-3 rounded-md border bg-muted/30 p-3">
            <Checkbox
              id="carnet"
              checked={formData.carnet}
              onCheckedChange={(checked) => setFormData(prev => ({ ...prev, carnet: checked === true }))}
              className="mt-0.5 size-5"
            />
            <label
              htmlFor="carnet"
              className="min-w-0 flex-1 cursor-pointer text-sm leading-5"
            >
              Carnet
            </label>
          </div>

          {allEstados.map((estado) => (
            <div key={estado} className="flex min-h-10 items-start gap-3 rounded-md border bg-muted/30 p-3">
              <Checkbox
                id={`estado-${estado}`}
                checked={formData.estados.includes(estado)}
                onCheckedChange={() => handleEstadoToggle(estado)}
                className="mt-0.5 size-5"
              />
              <label
                htmlFor={`estado-${estado}`}
                className="min-w-0 flex-1 cursor-pointer text-sm leading-5"
              >
                {STATUS_LABELS[estado]}
              </label>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card className="overflow-hidden rounded-lg shadow-sm">
        <CardHeader className="px-4 pt-4 sm:px-6 sm:pt-6">
          <CardTitle>Información de Visita</CardTitle>
        </CardHeader>
        <CardContent className="space-y-5 px-4 pb-4 sm:px-6 sm:pb-6">
          <div className="min-w-0 space-y-2">
            <Label htmlFor="fechaVisita" className="block text-sm leading-5 text-foreground">Fecha de Visita</Label>
            <Input
              id="fechaVisita"
              type="date"
              value={formData.fechaVisita}
              onChange={(e) => handleChange('fechaVisita', e.target.value)}
              className={`min-h-12 border-sky-200 bg-sky-50/80 py-3 text-base leading-6 shadow-sm focus-visible:border-sky-500 ${errors.fechaVisita ? 'border-red-500' : ''}`}
            />
            {errors.fechaVisita && (
              <p className="text-sm leading-5 text-red-500">{errors.fechaVisita}</p>
            )}
          </div>

          <div className="min-w-0 space-y-2">
            <Label className="block text-sm leading-5 text-foreground">
              Enfermera responsable
            </Label>
            <div className="min-h-12 rounded-md border border-sky-200 bg-slate-50 px-3 py-3 text-base leading-6 text-slate-900">
              {responsibleName}
            </div>
          </div>

          <div className="min-w-0 space-y-2">
            <Label htmlFor="observaciones" className="block text-sm leading-5 text-foreground">Observaciones</Label>
            <Textarea
              id="observaciones"
              value={formData.observaciones}
              onChange={(e) => handleChange('observaciones', e.target.value)}
              placeholder="Notas adicionales"
              rows={3}
              className="min-h-28 border-sky-200 bg-sky-50/80 text-base leading-6 shadow-sm focus-visible:border-sky-500"
            />
          </div>
        </CardContent>
      </Card>

      <div className="flex flex-col gap-3 pt-2 sm:flex-row">
        <Button
          type="submit"
          className="min-h-12 flex-1 text-base"
          size="lg"
          disabled={isSaving}
        >
          {isSaving ? 'Guardando...' : person ? 'Guardar Cambios' : 'Crear Registro'}
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          className="min-h-12 flex-1 text-base"
          size="lg"
          disabled={isSaving}
        >
          Cancelar
        </Button>
      </div>
    </form>
  );
}
