import { PersonFormData } from '../models/person.model';

export interface ValidationError {
  field: string;
  message: string;
}

export const validatePersonForm = (data: Partial<PersonFormData>): ValidationError[] => {
  const errors: ValidationError[] = [];

  if (!data.nombreCompleto || data.nombreCompleto.trim() === '') {
    errors.push({ field: 'nombreCompleto', message: 'El nombre completo es obligatorio' });
  }

  if (!data.calle || data.calle.trim() === '') {
    errors.push({ field: 'calle', message: 'La calle es obligatoria' });
  }

  if (!data.numeroCasa || data.numeroCasa.trim() === '') {
    errors.push({ field: 'numeroCasa', message: 'El numero de casa es obligatorio' });
  }

  if (!data.colonia || data.colonia.trim() === '') {
    errors.push({ field: 'colonia', message: 'La colonia es obligatoria' });
  }

  if (!data.referencias || data.referencias.trim() === '') {
    errors.push({ field: 'referencias', message: 'Las referencias del domicilio son obligatorias' });
  }

  if (data.numeroVisita === undefined || data.numeroVisita < 0) {
    errors.push({ field: 'numeroVisita', message: 'El numero de visita debe ser 0 o mayor' });
  }

  if (!data.telefono || data.telefono.trim() === '') {
    errors.push({ field: 'telefono', message: 'El telefono es obligatorio' });
  } else {
    const phoneRegex = /^[\d\s\-\(\)\+]+$/;
    if (!phoneRegex.test(data.telefono)) {
      errors.push({ field: 'telefono', message: 'El formato del telefono no es valido' });
    }
  }

  if (!data.fechaVisita || data.fechaVisita.trim() === '') {
    errors.push({ field: 'fechaVisita', message: 'La fecha de visita es obligatoria' });
  }

  if (!data.enfermera || data.enfermera.trim() === '') {
    errors.push({ field: 'enfermera', message: 'La enfermera o responsable es obligatorio' });
  }

  return errors;
};

export const isValidPhoneNumber = (phone: string): boolean => {
  if (!phone || phone.trim() === '') return false;
  const phoneRegex = /^[\d\s\-\(\)\+]+$/;
  return phoneRegex.test(phone);
};
