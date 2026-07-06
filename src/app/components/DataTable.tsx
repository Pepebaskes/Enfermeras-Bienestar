import { useState } from 'react';
import { useNavigate } from 'react-router';
import { Person } from '../models/person.model';
import { StatusTags } from './StatusTags';
import { Button } from './ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { ArrowUpDown, CalendarDays, Edit, Eye, MapPin, Phone } from 'lucide-react';
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
    <>
      <div className="space-y-3 md:hidden">
        {persons.map((person) => (
          <div
            key={person.id}
            className="rounded-lg border bg-white p-4 shadow-sm"
          >
            <button
              type="button"
              className="w-full text-left"
              onClick={() => navigate(`/personas/${person.id}`)}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <p className="break-words text-base font-semibold leading-6 text-slate-950">
                    {person.nombreCompleto}
                  </p>
                  <div className="mt-2 flex items-start gap-2 text-sm leading-5 text-slate-600">
                    <MapPin className="mt-0.5 size-4 shrink-0 text-sky-700" />
                    <span>{person.calle} {person.numeroCasa}, {person.colonia}</span>
                  </div>
                </div>
                <span className="shrink-0 rounded-md border border-sky-200 bg-sky-50 px-2 py-1 text-xs font-medium text-sky-800">
                  {(person.numeroVisita || 0) > 0 ? `Visita ${person.numeroVisita}` : 'Sin visita'}
                </span>
              </div>

              <div className="mt-3 grid grid-cols-1 gap-2 text-sm text-slate-700">
                <div className="flex items-center gap-2">
                  <CalendarDays className="size-4 text-emerald-700" />
                  <span>
                    Fecha visita: {person.fechaVisita ? new Date(person.fechaVisita).toLocaleDateString('es-MX') : 'Sin fecha'}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="size-4 text-slate-500" />
                  <span>{person.telefono || 'Sin telefono'}</span>
                </div>
                <div>
                  Carnet: <span className="font-medium">{person.carnet ? 'Si' : 'No'}</span>
                </div>
              </div>

              <StatusTags estados={person.estados} className="mt-3" />
            </button>

            <div className="mt-4 grid grid-cols-2 gap-2">
              <Button
                variant="outline"
                size="sm"
                className="h-11"
                onClick={() => navigate(`/personas/${person.id}`)}
              >
                <Eye className="size-4" />
                Ver
              </Button>
              <Button
                size="sm"
                className="h-11"
                onClick={() => navigate(`/personas/${person.id}/editar`)}
              >
                <Edit className="size-4" />
                Editar
              </Button>
            </div>
          </div>
        ))}
      </div>

      <div className="hidden rounded-lg border overflow-hidden md:block">
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
              <TableHead className="min-w-[130px]">Fecha visita</TableHead>
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
                  {person.fechaVisita ? new Date(person.fechaVisita).toLocaleDateString('es-MX') : '-'}
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
    </>
  );
}
