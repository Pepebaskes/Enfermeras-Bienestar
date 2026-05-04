import { Person } from '../models/person.model';

export type SortField = 'nombre' | 'colonia' | 'calle' | 'numero' | 'fecha' | 'visita';
export type SortOrder = 'asc' | 'desc';

export const sortPersons = (persons: Person[], field: SortField, order: SortOrder): Person[] => {
  const sorted = [...persons];

  sorted.sort((a, b) => {
    let comparison = 0;

    switch (field) {
      case 'nombre':
        comparison = a.nombreCompleto.localeCompare(b.nombreCompleto, 'es');
        break;
      case 'colonia':
        comparison = a.colonia.localeCompare(b.colonia, 'es');
        break;
      case 'calle':
        comparison = a.calle.localeCompare(b.calle, 'es');
        break;
      case 'numero':
        const numA = parseInt(a.numeroCasa) || 0;
        const numB = parseInt(b.numeroCasa) || 0;
        comparison = numA - numB;
        break;
      case 'fecha':
        comparison = new Date(a.ultimaActualizacion).getTime() - new Date(b.ultimaActualizacion).getTime();
        break;
      case 'visita':
        comparison = (a.numeroVisita || 1) - (b.numeroVisita || 1);
        break;
    }

    return order === 'asc' ? comparison : -comparison;
  });

  return sorted;
};
