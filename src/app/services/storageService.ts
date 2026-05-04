import { Person } from '../models/person.model';

const STORAGE_KEY = 'enfermeria_campo_data';

export const saveToLocalStorage = (persons: Person[]): void => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(persons));
  } catch (error) {
    console.error('Error al guardar en localStorage:', error);
  }
};

export const loadFromLocalStorage = (): Person[] => {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    if (data) {
      return JSON.parse(data);
    }
  } catch (error) {
    console.error('Error al cargar desde localStorage:', error);
  }
  return [];
};

export const clearLocalStorage = (): void => {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (error) {
    console.error('Error al limpiar localStorage:', error);
  }
};
