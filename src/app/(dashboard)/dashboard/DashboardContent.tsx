'use client';

import Link from 'next/link';
import { PageHeader } from '@/components/ui/PageHeader';
import { StatCard } from '@/components/ui/StatCard';
import {
  BarChartComparativo,
  PieChartComponent,
  ChartContainer,
} from '@/components/charts/Charts';
import { DivisionBrand } from '@/components/branding/DivisionBrand';
import { Home, TrendingUp, Database, BarChart3 } from 'lucide-react';

interface DeptData {
  id: string;
  codigo: string;
  nombre: string;
  color: string;
  orden: number;
  totalAnterior: number;
  totalActual: number;
  porcentaje: number;
  cantidadTablas: number;
}

interface Props {
  departamentos: DeptData[];
  periodoAnteriorLabel: string;
  periodoActualLabel: string;
}

export function DashboardContent({
  departamentos,
  periodoAnteriorLabel,
  periodoActualLabel,
}: Props) {
  const totalGenAnterior = departamentos.reduce(
    (acc, d) => acc + d.totalAnterior,
    0
  );
  const totalGenActual = departamentos.reduce(
    (acc, d) => acc + d.totalActual,
    0
  );
  const pctGeneral =
    totalGenAnterior === 0
      ? 0
      : Math.round(
          ((totalGenActual - totalGenAnterior) / totalGenAnterior) * 100
        );

  const barData = departamentos
    .filter(d => d.totalActual > 0 || d.totalAnterior > 0)
    .map(d => ({
      nombre: d.codigo.toUpperCase().replace(/_/g, ' ').substring(0, 12),
      anterior: d.totalAnterior,
      actual: d.totalActual,
    }));

  const pieData = departamentos
    .filter(d => d.totalActual > 0)
    .map(d => ({
      nombre: d.nombre.length > 25 ? d.nombre.substring(0, 25) + '…' : d.nombre,
      valor: d.totalActual,
      color: d.color,
    }));

  return (
    <div>
      <DivisionBrand variant="hero" className="mb-8" />

      <PageHeader
        titulo="Dashboard General"
        subtitulo={`Resumen comparativo ${periodoAnteriorLabel} vs ${periodoActualLabel}`}
        color="#1e3a5f"
        icon={<Home size={24} />}
      />

      {/* Stats generales */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <StatCard
          titulo="Total Período Anterior"
          valor={totalGenAnterior}
          icon={<Database size={20} />}
          color="#1e3a5f"
        />
        <StatCard
          titulo="Total Período Actual"
          valor={totalGenActual}
          valorAnterior={totalGenAnterior}
          porcentaje={pctGeneral}
          icon={<TrendingUp size={20} />}
          color="#0ea5e9"
        />
        <StatCard
          titulo="Departamentos"
          valor={departamentos.length}
          subtitulo="áreas monitoreadas"
          icon={<BarChart3 size={20} />}
          color="#22c55e"
        />
        <StatCard
          titulo="Tablas de datos"
          valor={departamentos.reduce((acc, d) => acc + d.cantidadTablas, 0)}
          subtitulo="tablas comparativas"
          icon={<Database size={20} />}
          color="#8b5cf6"
        />
      </div>

      {/* Gráficos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <ChartContainer titulo="Comparativo por Departamento">
          <BarChartComparativo datos={barData} />
        </ChartContainer>
        <ChartContainer titulo="Distribución Actual">
          <PieChartComponent datos={pieData} />
        </ChartContainer>
      </div>

      {/* Grid de departamentos */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {departamentos.map(dept => (
          <Link
            key={dept.id}
            href={`/${dept.codigo}`}
            className="card p-5 hover:shadow-lg transition-all duration-200 group"
          >
            <div className="flex items-center gap-3 mb-3">
              <div
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: dept.color }}
              />
              <h3 className="font-semibold text-gray-800 text-sm group-hover:text-policia-primary transition-colors">
                {dept.nombre}
              </h3>
            </div>
            <div className="flex items-end justify-between">
              <div>
                <p className="text-2xl font-bold text-gray-900">
                  {new Intl.NumberFormat('es-AR').format(dept.totalActual)}
                </p>
                <p className="text-xs text-gray-400">
                  Anterior:{' '}
                  {new Intl.NumberFormat('es-AR').format(dept.totalAnterior)}
                </p>
              </div>
              {dept.porcentaje !== 0 && (
                <span
                  className={`text-sm font-medium px-2 py-0.5 rounded-full ${
                    dept.porcentaje > 0
                      ? 'bg-green-100 text-green-700'
                      : 'bg-red-100 text-red-700'
                  }`}
                >
                  {dept.porcentaje > 0 ? '+' : ''}
                  {dept.porcentaje}%
                </span>
              )}
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
