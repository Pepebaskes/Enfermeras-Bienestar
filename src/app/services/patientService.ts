import { Person, PersonStatus } from '../models/person.model';
import { Profile } from '../models/profile.model';
import { CarnetFilter, SearchMode, SearchType } from '../utils/filters';
import { SortField, SortOrder } from '../utils/sorters';
import { supabase } from './supabaseClient';

interface PatientRow {
  id: string;
  owner_id: string;
  nombre_completo: string;
  calle: string;
  numero_casa: string;
  colonia: string;
  telefono: string | null;
  referencias: string | null;
  observaciones: string | null;
  carnet: boolean;
  estados: PersonStatus[];
  numero_visita: number;
  fecha_visita: string | null;
  enfermera: string | null;
  created_by: string | null;
  created_by_name: string | null;
  updated_by: string | null;
  updated_by_name: string | null;
  edad: number | null;
  pam_o_pcd: string | null;
  enfermedades: string | null;
  exploracion_fisica: string | null;
  diagnostico: string | null;
  tratamiento: string | null;
  ta_sistolica: number | null;
  ta_diastolica: number | null;
  frecuencia_respiratoria: number | null;
  temperatura: number | null;
  escala_glasgow: number | null;
  grupo_riesgo: string | null;
  frecuencia_cardiaca: number | null;
  peso: number | null;
  talla: number | null;
  saturacion: number | null;
  pruebas_horas_ayuno: number | null;
  pruebas_fecha_hora_muestra: string | null;
  lancetas_usadas: number | null;
  tiras_usadas: number | null;
  glucosa_resultado: number | null;
  trigliceridos_resultado: number | null;
  colesterol_resultado: number | null;
  pantorrilla_cm: number | null;
  brazo_cm: number | null;
  cintura_cm: number | null;
  discapacidad: string | null;
  nota: string | null;
  creado_en: string;
  actualizado_en: string;
}

export interface PatientStats {
  total: number;
  visitados: number;
  sinVisita: number;
  cambioDomicilio: number;
  noQuiso: number;
  fueraPais: number;
  finados: number;
}

export interface PatientQueryOptions {
  page: number;
  pageSize: number;
  searchQuery?: string;
  searchType?: SearchType;
  searchMode?: SearchMode;
  carnetFilter?: CarnetFilter;
  estados?: PersonStatus[];
  estadosMode?: 'any' | 'all';
  ownerId?: string;
  updatedFrom?: string;
  updatedTo?: string;
  visitDateFrom?: string;
  visitDateTo?: string;
  visitNumber?: number | null;
  visitPresence?: 'all' | 'with' | 'without';
  sortField?: SortField;
  sortOrder?: SortOrder;
}

export interface PatientPage {
  persons: Person[];
  total: number;
}

export interface FetchAllPatientsOptions extends Partial<Omit<PatientQueryOptions, 'page' | 'pageSize'>> {
  pageSize?: number;
  onProgress?: (loaded: number, total: number) => void;
}

const toDateValue = (value?: string) => value ? value.slice(0, 10) : null;

const sortColumnByField: Record<SortField, string> = {
  nombre: 'nombre_completo',
  colonia: 'colonia',
  calle: 'calle',
  numero: 'numero_casa',
  fecha: 'actualizado_en',
  visita: 'numero_visita'
};

const escapeSearchValue = (value: string) => value.replace(/[%_]/g, '\\$&').replace(/,/g, '\\,');

const nullableString = (value?: string) => {
  const trimmedValue = value?.trim();
  return trimmedValue ? trimmedValue : null;
};

const nullableNumber = (value?: number) => {
  return typeof value === 'number' && Number.isFinite(value) ? value : null;
};

const mapPatientRowToPerson = (row: PatientRow): Person => ({
  id: row.id,
  nombreCompleto: row.nombre_completo,
  calle: row.calle,
  numeroCasa: row.numero_casa,
  colonia: row.colonia,
  telefono: row.telefono || undefined,
  referencias: row.referencias || undefined,
  observaciones: row.observaciones || undefined,
  carnet: row.carnet,
  estados: row.estados || [],
  numeroVisita: row.numero_visita || 0,
  fechaVisita: row.fecha_visita || undefined,
  enfermera: row.enfermera || undefined,
  creadoPorId: row.created_by || undefined,
  creadoPorNombre: row.created_by_name || undefined,
  actualizadoPorId: row.updated_by || undefined,
  actualizadoPorNombre: row.updated_by_name || undefined,
  edad: row.edad ?? undefined,
  pamOPcd: row.pam_o_pcd ?? undefined,
  enfermedades: row.enfermedades ?? undefined,
  exploracionFisica: row.exploracion_fisica ?? undefined,
  diagnostico: row.diagnostico ?? undefined,
  tratamiento: row.tratamiento ?? undefined,
  taSistolica: row.ta_sistolica ?? undefined,
  taDiastolica: row.ta_diastolica ?? undefined,
  frecuenciaRespiratoria: row.frecuencia_respiratoria ?? undefined,
  temperatura: row.temperatura ?? undefined,
  escalaGlasgow: row.escala_glasgow ?? undefined,
  grupoRiesgo: row.grupo_riesgo ?? undefined,
  frecuenciaCardiaca: row.frecuencia_cardiaca ?? undefined,
  peso: row.peso ?? undefined,
  talla: row.talla ?? undefined,
  saturacion: row.saturacion ?? undefined,
  pruebasHorasAyuno: row.pruebas_horas_ayuno ?? undefined,
  pruebasFechaHoraMuestra: row.pruebas_fecha_hora_muestra ?? undefined,
  lancetasUsadas: row.lancetas_usadas ?? undefined,
  tirasUsadas: row.tiras_usadas ?? undefined,
  glucosaResultado: row.glucosa_resultado ?? undefined,
  trigliceridosResultado: row.trigliceridos_resultado ?? undefined,
  colesterolResultado: row.colesterol_resultado ?? undefined,
  pantorrillaCm: row.pantorrilla_cm ?? undefined,
  brazoCm: row.brazo_cm ?? undefined,
  cinturaCm: row.cintura_cm ?? undefined,
  discapacidad: row.discapacidad ?? undefined,
  nota: row.nota ?? undefined,
  fechaCreacion: row.creado_en,
  ultimaActualizacion: row.actualizado_en
});

const mapPersonToPatientBase = (person: Person, profile: Profile) => ({
  nombre_completo: person.nombreCompleto,
  calle: person.calle,
  numero_casa: person.numeroCasa,
  colonia: person.colonia,
  telefono: nullableString(person.telefono),
  referencias: nullableString(person.referencias),
  observaciones: nullableString(person.observaciones),
  carnet: person.carnet ?? false,
  estados: person.estados || [],
  numero_visita: person.numeroVisita || 0,
  fecha_visita: toDateValue(person.fechaVisita),
  enfermera: profile.nombre,
  edad: nullableNumber(person.edad),
  pam_o_pcd: nullableString(person.pamOPcd),
  enfermedades: nullableString(person.enfermedades),
  exploracion_fisica: nullableString(person.exploracionFisica),
  diagnostico: nullableString(person.diagnostico),
  tratamiento: nullableString(person.tratamiento),
  ta_sistolica: nullableNumber(person.taSistolica),
  ta_diastolica: nullableNumber(person.taDiastolica),
  frecuencia_respiratoria: nullableNumber(person.frecuenciaRespiratoria),
  temperatura: nullableNumber(person.temperatura),
  escala_glasgow: nullableNumber(person.escalaGlasgow),
  grupo_riesgo: nullableString(person.grupoRiesgo),
  frecuencia_cardiaca: nullableNumber(person.frecuenciaCardiaca),
  peso: nullableNumber(person.peso),
  talla: nullableNumber(person.talla),
  saturacion: nullableNumber(person.saturacion),
  pruebas_horas_ayuno: nullableNumber(person.pruebasHorasAyuno),
  pruebas_fecha_hora_muestra: person.pruebasFechaHoraMuestra || null,
  lancetas_usadas: nullableNumber(person.lancetasUsadas),
  tiras_usadas: nullableNumber(person.tirasUsadas),
  glucosa_resultado: nullableNumber(person.glucosaResultado),
  trigliceridos_resultado: nullableNumber(person.trigliceridosResultado),
  colesterol_resultado: nullableNumber(person.colesterolResultado),
  pantorrilla_cm: nullableNumber(person.pantorrillaCm),
  brazo_cm: nullableNumber(person.brazoCm),
  cintura_cm: nullableNumber(person.cinturaCm),
  discapacidad: nullableString(person.discapacidad),
  nota: nullableString(person.nota)
});

const mapPersonToPatientInsert = (person: Person, profile: Profile) => ({
  owner_id: profile.id,
  ...mapPersonToPatientBase(person, profile),
  created_by: profile.id,
  created_by_name: profile.nombre,
  updated_by: profile.id,
  updated_by_name: profile.nombre
});

const mapPersonToPatientUpdate = (person: Person, profile: Profile) => ({
  ...mapPersonToPatientBase(person, profile),
  updated_by: profile.id,
  updated_by_name: profile.nombre,
  actualizado_en: new Date().toISOString()
});

const removeAuditFields = <T extends Record<string, unknown>>(payload: T) => {
  const {
    created_by,
    created_by_name,
    updated_by,
    updated_by_name,
    ...payloadWithoutAuditFields
  } = payload;

  return payloadWithoutAuditFields;
};

const isAuditSchemaCacheError = (message: string) => {
  const normalizedMessage = message.toLowerCase();
  return normalizedMessage.includes('schema cache')
    && (
      normalizedMessage.includes('created_by')
      || normalizedMessage.includes('created_by_name')
      || normalizedMessage.includes('updated_by')
      || normalizedMessage.includes('updated_by_name')
    );
};

const isHealthSchemaCacheError = (message: string) => {
  const normalizedMessage = message.toLowerCase();
  return normalizedMessage.includes('schema cache')
    && (
      normalizedMessage.includes('edad')
      || normalizedMessage.includes('pam_o_pcd')
      || normalizedMessage.includes('enfermedades')
      || normalizedMessage.includes('exploracion_fisica')
      || normalizedMessage.includes('diagnostico')
      || normalizedMessage.includes('tratamiento')
      || normalizedMessage.includes('ta_sistolica')
      || normalizedMessage.includes('pruebas_horas_ayuno')
      || normalizedMessage.includes('pruebas_fecha_hora_muestra')
      || normalizedMessage.includes('lancetas_usadas')
      || normalizedMessage.includes('tiras_usadas')
      || normalizedMessage.includes('glucosa_resultado')
      || normalizedMessage.includes('trigliceridos_resultado')
      || normalizedMessage.includes('colesterol_resultado')
      || normalizedMessage.includes('pantorrilla_cm')
      || normalizedMessage.includes('discapacidad')
    );
};

const getHealthSchemaErrorMessage = () => {
  return 'Faltan columnas del formato Salud/Bienestar en Supabase. Ejecuta patient-health-fields.sql, medical-tests-shared-sample-fields.sql y medical-test-supplies.sql; despues recarga el schema.';
};

export const fetchPatients = async (): Promise<Person[]> => {
  const page = await fetchPatientsPage({
    page: 0,
    pageSize: 100,
    sortField: 'fecha',
    sortOrder: 'desc'
  });

  return page.persons;
};

const applyPatientFilters = (
  query: any,
  options: Partial<PatientQueryOptions>
) => {
  let filteredQuery = query;
  const searchQuery = options.searchQuery?.trim();
  const searchMode = options.searchMode || 'partial';
  const searchType = options.searchType || 'all';

  if (options.ownerId) {
    filteredQuery = filteredQuery.eq('owner_id', options.ownerId);
  }

  if (options.updatedFrom) {
    filteredQuery = filteredQuery.gte('actualizado_en', `${options.updatedFrom}T00:00:00`);
  }

  if (options.updatedTo) {
    filteredQuery = filteredQuery.lte('actualizado_en', `${options.updatedTo}T23:59:59.999`);
  }

  if (options.visitDateFrom) {
    filteredQuery = filteredQuery.gte('fecha_visita', options.visitDateFrom);
  }

  if (options.visitDateTo) {
    filteredQuery = filteredQuery.lte('fecha_visita', options.visitDateTo);
  }

  if (options.visitPresence === 'with') {
    filteredQuery = filteredQuery.gt('numero_visita', 0);
  }

  if (options.visitPresence === 'without') {
    filteredQuery = filteredQuery.eq('numero_visita', 0);
  }

  if (typeof options.visitNumber === 'number' && options.visitNumber >= 0) {
    filteredQuery = filteredQuery.eq('numero_visita', options.visitNumber);
  }

  if (searchQuery) {
    const value = escapeSearchValue(searchQuery);
    const pattern = searchMode === 'exact' ? value : `%${value}%`;
    const operator = searchMode === 'exact' ? 'eq' : 'ilike';

    if (searchType === 'nombre') {
      filteredQuery = filteredQuery.filter('nombre_completo', operator, pattern);
    } else if (searchType === 'colonia') {
      filteredQuery = filteredQuery.filter('colonia', operator, pattern);
    } else if (searchType === 'telefono') {
      filteredQuery = filteredQuery.filter('telefono', operator, pattern);
    } else if (searchType === 'domicilio') {
      filteredQuery = filteredQuery.or(`calle.${operator}.${pattern},numero_casa.${operator}.${pattern}`);
    } else {
      filteredQuery = filteredQuery.or([
        `nombre_completo.${operator}.${pattern}`,
        `calle.${operator}.${pattern}`,
        `numero_casa.${operator}.${pattern}`,
        `colonia.${operator}.${pattern}`,
        `telefono.${operator}.${pattern}`,
        `enfermera.${operator}.${pattern}`
      ].join(','));
    }
  }

  if (options.carnetFilter === 'with') {
    filteredQuery = filteredQuery.eq('carnet', true);
  }

  if (options.carnetFilter === 'without') {
    filteredQuery = filteredQuery.eq('carnet', false);
  }

  if (options.estados && options.estados.length > 0) {
    filteredQuery = options.estadosMode === 'all'
      ? filteredQuery.contains('estados', options.estados)
      : filteredQuery.overlaps('estados', options.estados);
  }

  return filteredQuery;
};

export const fetchPatientsPage = async (options: PatientQueryOptions): Promise<PatientPage> => {
  const from = options.page * options.pageSize;
  const to = from + options.pageSize - 1;
  const sortField = options.sortField || 'fecha';
  const sortOrder = options.sortOrder || 'desc';

  let query = supabase
    .from('patients')
    .select('*', { count: 'exact' });

  query = applyPatientFilters(query, options)
    .order(sortColumnByField[sortField], { ascending: sortOrder === 'asc' })
    .range(from, to);

  const result = await query;

  if (result.error) {
    throw new Error(result.error.message);
  }

  return {
    persons: (result.data || []).map((row) => mapPatientRowToPerson(row as PatientRow)),
    total: result.count || 0
  };
};

export const fetchAllPatients = async (options: FetchAllPatientsOptions = {}): Promise<Person[]> => {
  const pageSize = options.pageSize || 500;
  const firstPage = await fetchPatientsPage({
    ...options,
    page: 0,
    pageSize,
    sortField: options.sortField || 'fecha',
    sortOrder: options.sortOrder || 'desc'
  });

  const allPatients = [...firstPage.persons];
  options.onProgress?.(allPatients.length, firstPage.total);

  const totalPages = Math.ceil(firstPage.total / pageSize);
  for (let page = 1; page < totalPages; page++) {
    const nextPage = await fetchPatientsPage({
      ...options,
      page,
      pageSize,
      sortField: options.sortField || 'fecha',
      sortOrder: options.sortOrder || 'desc'
    });
    allPatients.push(...nextPage.persons);
    options.onProgress?.(allPatients.length, firstPage.total);
  }

  return allPatients;
};

export const fetchPatientById = async (patientId: string): Promise<Person> => {
  const { data, error } = await supabase
    .from('patients')
    .select('*')
    .eq('id', patientId)
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return mapPatientRowToPerson(data as PatientRow);
};

const countPatients = async (
  applyFilters?: (query: any) => any
) => {
  let query = supabase
    .from('patients')
    .select('id', { count: 'exact', head: true });

  if (applyFilters) {
    query = applyFilters(query);
  }

  const { count, error } = await query;

  if (error) {
    throw new Error(error.message);
  }

  return count || 0;
};

export const fetchPatientStats = async (): Promise<PatientStats> => {
  const [
    total,
    visitados,
    sinVisita,
    cambioDomicilio,
    noQuiso,
    fueraPais,
    finados
  ] = await Promise.all([
    countPatients(),
    countPatients((query) => query.or('numero_visita.gt.0,estados.cs.{visitado}')),
    countPatients((query) => query.eq('numero_visita', 0)),
    countPatients((query) => query.contains('estados', ['cambio_domicilio'])),
    countPatients((query) => query.contains('estados', ['no_quiso_programa'])),
    countPatients((query) => query.contains('estados', ['fuera_del_pais'])),
    countPatients((query) => query.contains('estados', ['finado']))
  ]);

  return {
    total,
    visitados,
    sinVisita,
    cambioDomicilio,
    noQuiso,
    fueraPais,
    finados
  };
};

export const savePatient = async (person: Person, profile: Profile): Promise<Person> => {
  const isNew = !person.id || person.id.startsWith('temp-');

  if (isNew) {
    const insertPayload = mapPersonToPatientInsert(person, profile);
    let { data, error } = await supabase
      .from('patients')
      .insert(insertPayload)
      .select('*')
      .single();

    if (error && isHealthSchemaCacheError(error.message)) {
      throw new Error(getHealthSchemaErrorMessage());
    }

    if (error && isAuditSchemaCacheError(error.message)) {
      const retry = await supabase
        .from('patients')
        .insert(removeAuditFields(insertPayload))
        .select('*')
        .single();

      data = retry.data;
      error = retry.error;
    }

    if (error) {
      throw new Error(error.message);
    }

    return mapPatientRowToPerson(data as PatientRow);
  }

  const updatePayload = mapPersonToPatientUpdate(person, profile);
  let { data, error } = await supabase
    .from('patients')
    .update(updatePayload)
    .eq('id', person.id)
    .select('*')
    .single();

  if (error && isHealthSchemaCacheError(error.message)) {
    throw new Error(getHealthSchemaErrorMessage());
  }

  if (error && isAuditSchemaCacheError(error.message)) {
    const retry = await supabase
      .from('patients')
      .update(removeAuditFields(updatePayload))
      .eq('id', person.id)
      .select('*')
      .single();

    data = retry.data;
    error = retry.error;
  }

  if (error) {
    throw new Error(error.message);
  }

  return mapPatientRowToPerson(data as PatientRow);
};
