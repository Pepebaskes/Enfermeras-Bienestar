import { useState } from 'react';
import { Search } from 'lucide-react';
import { Input } from './ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { SearchType, SearchMode } from '../utils/filters';

interface SearchBarProps {
  onSearchChange: (query: string, type: SearchType, mode: SearchMode) => void;
}

export function SearchBar({ onSearchChange }: SearchBarProps) {
  const [query, setQuery] = useState('');
  const [searchType, setSearchType] = useState<SearchType>('all');
  const [searchMode, setSearchMode] = useState<SearchMode>('partial');

  const handleQueryChange = (value: string) => {
    setQuery(value);
    onSearchChange(value, searchType, searchMode);
  };

  const handleTypeChange = (value: SearchType) => {
    setSearchType(value);
    onSearchChange(query, value, searchMode);
  };

  const handleModeChange = (value: SearchMode) => {
    setSearchMode(value);
    onSearchChange(query, searchType, value);
  };

  return (
    <div className="w-full space-y-3">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
        <Input
          type="text"
          placeholder="Buscar personas..."
          value={query}
          onChange={(e) => handleQueryChange(e.target.value)}
          className="pl-10 h-12 text-base"
        />
      </div>
      <div className="grid grid-cols-2 gap-2">
        <Select value={searchType} onValueChange={handleTypeChange}>
          <SelectTrigger className="h-11">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Buscar en todos los campos</SelectItem>
            <SelectItem value="nombre">Buscar por nombre</SelectItem>
            <SelectItem value="domicilio">Buscar por domicilio</SelectItem>
            <SelectItem value="colonia">Buscar por colonia</SelectItem>
            <SelectItem value="telefono">Buscar por teléfono</SelectItem>
          </SelectContent>
        </Select>
        <Select value={searchMode} onValueChange={handleModeChange}>
          <SelectTrigger className="h-11">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="partial">Coincidencia parcial</SelectItem>
            <SelectItem value="exact">Coincidencia exacta</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
