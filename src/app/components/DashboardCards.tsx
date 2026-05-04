import { Person } from '../models/person.model';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Users, UserCheck, UserX, MapPin, XCircle, Globe, Ban } from 'lucide-react';

interface DashboardCardsProps {
  persons: Person[];
}

export function DashboardCards({ persons }: DashboardCardsProps) {
  const total = persons.length;
  const visitados = persons.filter(p => (p.numeroVisita || 0) > 0 || p.estados.includes('visitado')).length;
  const sinVisita = persons.filter(p => (p.numeroVisita || 0) === 0).length;
  const cambioDomicilio = persons.filter(p => p.estados.includes('cambio_domicilio')).length;
  const noQuiso = persons.filter(p => p.estados.includes('no_quiso_programa')).length;
  const fueraPais = persons.filter(p => p.estados.includes('fuera_del_pais')).length;
  const finados = persons.filter(p => p.estados.includes('finado')).length;

  const stats = [
    {
      title: 'Total de Registros',
      value: total,
      icon: Users,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50'
    },
    {
      title: 'Visitados',
      value: visitados,
      icon: UserCheck,
      color: 'text-green-600',
      bgColor: 'bg-green-50'
    },
    {
      title: 'Sin Visita',
      value: sinVisita,
      icon: UserX,
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-50'
    },
    {
      title: 'Cambio de Domicilio',
      value: cambioDomicilio,
      icon: MapPin,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50'
    },
    {
      title: 'No Quiso el Programa',
      value: noQuiso,
      icon: XCircle,
      color: 'text-red-600',
      bgColor: 'bg-red-50'
    },
    {
      title: 'Fuera del País',
      value: fueraPais,
      icon: Globe,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50'
    },
    {
      title: 'Finados',
      value: finados,
      icon: Ban,
      color: 'text-gray-600',
      bgColor: 'bg-gray-50'
    }
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-7 gap-4">
      {stats.map((stat) => {
        const Icon = stat.icon;
        return (
          <Card key={stat.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-xs md:text-sm">
                {stat.title}
              </CardTitle>
              <div className={`${stat.bgColor} p-2 rounded-lg`}>
                <Icon className={`h-4 w-4 ${stat.color}`} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl">{stat.value}</div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
