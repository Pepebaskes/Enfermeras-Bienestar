export type PersonStatus =
  | 'visitado'
  | 'fuera_del_pais'
  | 'sin_visita'
  | 'no_encontrado'
  | 'no_quiso_programa'
  | 'cambio_domicilio'
  | 'finado';

export const STATUS_LABELS: Record<PersonStatus, string> = {
  visitado: 'Visitado',
  fuera_del_pais: 'Fuera del pais',
  sin_visita: 'Sin visita',
  no_encontrado: 'No se localizo',
  no_quiso_programa: 'Rechazo el programa',
  cambio_domicilio: 'Cambio de domicilio',
  finado: 'Finado'
};

export const STATUS_COLORS: Record<PersonStatus, string> = {
  visitado: 'bg-green-100 text-green-800 border-green-300',
  fuera_del_pais: 'bg-blue-100 text-blue-800 border-blue-300',
  sin_visita: 'bg-yellow-100 text-yellow-800 border-yellow-300',
  no_encontrado: 'bg-fuchsia-100 text-fuchsia-800 border-fuchsia-300',
  no_quiso_programa: 'bg-red-100 text-red-800 border-red-300',
  cambio_domicilio: 'bg-amber-100 text-amber-800 border-amber-300',
  finado: 'bg-gray-100 text-gray-800 border-gray-300'
};

export interface Person {
  id: string;
  nombreCompleto: string;
  calle: string;
  numeroCasa: string;
  colonia: string;
  carnet?: boolean;
  telefono?: string;
  referencias?: string;
  observaciones?: string;
  estados: PersonStatus[];
  numeroVisita: number;
  fechaVisita?: string;
  enfermera?: string;
  creadoPorId?: string;
  creadoPorNombre?: string;
  actualizadoPorId?: string;
  actualizadoPorNombre?: string;
  edad?: number;
  pamOPcd?: string;
  enfermedades?: string;
  exploracionFisica?: string;
  diagnostico?: string;
  tratamiento?: string;
  taSistolica?: number;
  taDiastolica?: number;
  frecuenciaRespiratoria?: number;
  temperatura?: number;
  escalaGlasgow?: number;
  grupoRiesgo?: string;
  frecuenciaCardiaca?: number;
  peso?: number;
  talla?: number;
  saturacion?: number;
  glucosaHorasAyuno?: number;
  glucosaResultado?: number;
  glucosaFechaHoraMuestra?: string;
  trigliceridosHorasAyuno?: number;
  trigliceridosResultado?: number;
  trigliceridosFechaHoraMuestra?: string;
  colesterolHorasAyuno?: number;
  colesterolResultado?: number;
  colesterolFechaHoraMuestra?: string;
  pantorrillaCm?: number;
  brazoCm?: number;
  cinturaCm?: number;
  discapacidad?: string;
  nota?: string;
  ultimaActualizacion: string;
  fechaCreacion: string;
}

export interface PersonFormData {
  nombreCompleto: string;
  calle: string;
  numeroCasa: string;
  colonia: string;
  carnet: boolean;
  telefono: string;
  referencias: string;
  observaciones: string;
  estados: PersonStatus[];
  numeroVisita: number;
  fechaVisita: string;
  enfermera: string;
  edad: string;
  pamOPcd: string;
  enfermedades: string;
  exploracionFisica: string;
  diagnostico: string;
  tratamiento: string;
  taSistolica: string;
  taDiastolica: string;
  frecuenciaRespiratoria: string;
  temperatura: string;
  escalaGlasgow: string;
  grupoRiesgo: string;
  frecuenciaCardiaca: string;
  peso: string;
  talla: string;
  saturacion: string;
  glucosaHorasAyuno: string;
  glucosaResultado: string;
  glucosaFechaHoraMuestra: string;
  trigliceridosHorasAyuno: string;
  trigliceridosResultado: string;
  trigliceridosFechaHoraMuestra: string;
  colesterolHorasAyuno: string;
  colesterolResultado: string;
  colesterolFechaHoraMuestra: string;
  pantorrillaCm: string;
  brazoCm: string;
  cinturaCm: string;
  discapacidad: string;
  nota: string;
}
