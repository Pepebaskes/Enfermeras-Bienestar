import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router';
import { Person, PersonStatus } from '../models/person.model';
import { SearchBar } from '../components/SearchBar';
import { FilterPanel } from '../components/FilterPanel';
import { DataTable } from '../components/DataTable';
import { Button } from '../components/ui/button';
import { ArrowLeft, Plus } from 'lucide-react';
import { filterPersons, SearchType, SearchMode } from '../utils/filters';
import { sortPersons, SortField, SortOrder } from '../utils/sorters';

interface PeopleListPageProps {
  persons: Person[];
}

export function PeopleListPage({ persons }: PeopleListPageProps) {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [searchType, setSearchType] = useState<SearchType>('all');
  const [searchMode, setSearchMode] = useState<SearchMode>('partial');
  const [selectedEstados, setSelectedEstados] = useState<PersonStatus[]>([]);
  const [estadosMode, setEstadosMode] = useState<'any' | 'all'>('any');
  const [sortField, setSortField] = useState<SortField>('nombre');
  const [sortOrder, setSortOrder] = useState<SortOrder>('asc');

  const filteredPersons = useMemo(() => {
    const filtered = filterPersons(persons, {
      searchQuery,
      searchType,
      searchMode,
      estados: selectedEstados,
      estadosMode
    });

    return sortPersons(filtered, sortField, sortOrder);
  }, [persons, searchQuery, searchType, searchMode, selectedEstados, estadosMode, sortField, sortOrder]);

  const handleSearchChange = (query: string, type: SearchType, mode: SearchMode) => {
    setSearchQuery(query);
    setSearchType(type);
    setSearchMode(mode);
  };

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
  };

  const handleClearFilters = () => {
    setSelectedEstados([]);
    setSearchQuery('');
  };

  return (
    <div className="space-y-6 p-4 md:p-6">
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate('/')}
        >
          <ArrowLeft className="h-4 w-4 mr-1" />
          Volver
        </Button>
        <h1 className="text-3xl">Listado de Personas</h1>
      </div>

      <Button
        onClick={() => navigate('/personas/nuevo')}
        className="w-full md:w-auto h-12"
        size="lg"
      >
        <Plus className="h-5 w-5 mr-2" />
        Nuevo Registro
      </Button>

      <SearchBar onSearchChange={handleSearchChange} />

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-1">
          <FilterPanel
            selectedEstados={selectedEstados}
            estadosMode={estadosMode}
            onEstadosChange={setSelectedEstados}
            onEstadosModeChange={setEstadosMode}
            onClearFilters={handleClearFilters}
          />
        </div>

        <div className="lg:col-span-3 space-y-4">
          <div className="text-sm text-gray-600">
            Mostrando {filteredPersons.length} de {persons.length} registros
          </div>
          <DataTable
            persons={filteredPersons}
            onSort={handleSort}
            sortField={sortField}
            sortOrder={sortOrder}
          />
        </div>
      </div>
    </div>
  );
}
