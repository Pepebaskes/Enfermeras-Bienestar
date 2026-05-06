import { useState } from 'react';
import { useNavigate } from 'react-router';
import { Person } from '../models/person.model';
import { StatusTags } from './StatusTags';
import { Button } from './ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { ArrowUpDown, Eye, Edit } from 'lucide-react';
import { SortField, SortOrder } from '../utils/sorters';

interface DataTableProps {
  persons: Person[];
  onSort: (field: SortField) => void;
  sortField: SortField;
  sortOrder: SortOrder;
}

export function DataTable({ persons, onSort, sortField, sortOrder }: DataTableProps) {
  const navigate = useNavigate();

  const SortButton = ({ field, children }: { field: SortField; children: React.ReactNode }) => (
    <button
      onClick={() => onSort(field)}
      className="flex items-center gap-1 hover:text-gray-900 transition-colors"
    >
      {children}
      <ArrowUpDown className="h-3 w-3" />
    </button>
  );

  if (persons.length === 0) {
    return (
      <div className="text-center py-12 text-gray-500">
        No se encontraron registros
      </div>
    );
  }

  return (
    <div className="rounded-lg border overflow-hidden">
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="min-w-[200px]">
                <SortButton field="nombre">Nombre Completo</SortButton>
              </TableHead>
              <TableHead className="min-w-[150px]">
                <SortButton field="calle">Calle</SortButton>
              </TableHead>
              <TableHead className="min-w-[100px]">
                <SortButton field="numero">Número</SortButton>
              </TableHead>
              <TableHead className="min-w-[150px]">
                <SortButton field="colonia">Colonia</SortButton>
              </TableHead>
              <TableHead className="min-w-[120px]">Carnet</TableHead>
              <TableHead className="min-w-[120px]">Teléfono</TableHead>
              <TableHead className="min-w-[110px]">
                <SortButton field="visita">Visita</SortButton>
              </TableHead>
              <TableHead className="min-w-[200px]">Estados</TableHead>
              <TableHead className="text-right min-w-[120px]">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {persons.map((person) => (
              <TableRow key={person.id} className="cursor-pointer hover:bg-gray-50">
                <TableCell onClick={() => navigate(`/personas/${person.id}`)}>
                  {person.nombreCompleto}
                </TableCell>
                <TableCell onClick={() => navigate(`/personas/${person.id}`)}>
                  {person.calle}
                </TableCell>
                <TableCell onClick={() => navigate(`/personas/${person.id}`)}>
                  {person.numeroCasa}
                </TableCell>
                <TableCell onClick={() => navigate(`/personas/${person.id}`)}>
                  {person.colonia}
                </TableCell>
                <TableCell onClick={() => navigate(`/personas/${person.id}`)}>
                  {person.carnet ? 'Si' : 'No'}
                </TableCell>
                <TableCell onClick={() => navigate(`/personas/${person.id}`)}>
                  {person.telefono || '-'}
                </TableCell>
                <TableCell onClick={() => navigate(`/personas/${person.id}`)}>
                  <span className="inline-flex items-center rounded-md border border-sky-200 bg-sky-50 px-2.5 py-1 text-sm font-medium text-sky-800">
                    {(person.numeroVisita || 0) > 0 ? `Visita ${person.numeroVisita}` : 'Sin visita'}
                  </span>
                </TableCell>
                <TableCell onClick={() => navigate(`/personas/${person.id}`)}>
                  <StatusTags estados={person.estados} />
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/personas/${person.id}`);
                      }}
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/personas/${person.id}/editar`);
                      }}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
