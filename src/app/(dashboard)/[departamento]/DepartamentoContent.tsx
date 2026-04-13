'use client';

import { useState, useCallback, useMemo } from 'react';
import { PageHeader, SectionHeader } from '@/components/ui/PageHeader';
import { StatCard } from '@/components/ui/StatCard';
import {
  TablaComparativa,
  type FilaComparativa,
} from '@/components/tables/TablaComparativa';
import { ExportButtons } from '@/components/export/ExportButtons';
import {
  BarChartComparativo,
  PieChartComponent,
  ChartContainer,
} from '@/components/charts/Charts';
import {
  Users,
  Shield,
  Activity,
  Truck,
  Scale,
  AlertTriangle,
  TreePine,
  Pill,
  Phone,
  Star,
  GraduationCap,
  MapPin,
  type LucideIcon,
} from 'lucide-react';

interface TablaData {
  id: string;
  tablaId: string;
  nombre: string;
  orden: number;
  datos: FilaComparativa[];
}

interface DepartamentoInfo {
  id: string;
  codigo: string;
  nombre: string;
  color: string;
  orden: number;
}

interface Props {
  departamento: DepartamentoInfo;
  tablas: TablaData[];
  periodoAnteriorLabel: string;
  periodoActualLabel: string;
}

const ICON_MAP: Record<string, LucideIcon> = {
  d1: Users,
  d2: Shield,
  d3: Activity,
  d4: Truck,
  d5: Scale,
  asuntos_internos: AlertTriangle,
  delitos_rurales: TreePine,
  digedrop: Pill,
  prevencion_ciudadana: Phone,
  unidades_especiales: Star,
  institutos: GraduationCap,
  unidades_regionales: MapPin,
};

// Escudos institucionales disponibles por departamento
const SHIELD_MAP: Record<string, string> = {
  d1: '/shields/d1.png',
};

const COLORS_PALETTE = [
  '#1e3a5f',
  '#0ea5e9',
  '#ef4444',
  '#22c55e',
  '#f59e0b',
  '#8b5cf6',
  '#ec4899',
  '#06b6d4',
];

export function DepartamentoContent({
  departamento,
  tablas: tablasIniciales,
  periodoAnteriorLabel,
  periodoActualLabel,
}: Props) {
  // Estado reactivo de todas las tablas — cuando se edita una tabla, los gráficos se actualizan
  const [tablasState, setTablasState] = useState<TablaData[]>(tablasIniciales);

  /** Callback invocado cuando TablaComparativa guarda cambios */
  const handleDataChange = useCallback(
    (tablaId: string, filasNuevas: FilaComparativa[]) => {
      setTablasState(prev =>
        prev.map(t =>
          t.tablaId === tablaId ? { ...t, datos: filasNuevas } : t
        )
      );
    },
    []
  );

  // Datos derivados reactivos para gráficos
  const chartData = useMemo(() => {
    // Gráfico de barras: agrupa todas las tablas
    const barData = tablasState.flatMap(tabla =>
      tabla.datos.map(f => ({
        nombre: f.label.length > 20 ? f.label.substring(0, 20) + '…' : f.label,
        anterior: f.periodoAnterior,
        actual: f.periodoActual,
      }))
    );

    // Gráfico de torta: totales por tabla
    const pieData = tablasState.map((tabla, i) => ({
      nombre: tabla.nombre,
      valor: tabla.datos.reduce((acc, f) => acc + f.periodoActual, 0),
      color: COLORS_PALETTE[i % COLORS_PALETTE.length],
    }));

    // Stats: totales globales
    const totalAnterior = tablasState.reduce(
      (acc, t) => acc + t.datos.reduce((a, f) => a + f.periodoAnterior, 0),
      0
    );
    const totalActual = tablasState.reduce(
      (acc, t) => acc + t.datos.reduce((a, f) => a + f.periodoActual, 0),
      0
    );
    const porcentaje =
      totalAnterior === 0
        ? 0
        : Math.round(((totalActual - totalAnterior) / totalAnterior) * 100);

    return { barData, pieData, totalAnterior, totalActual, porcentaje };
  }, [tablasState]);

  const Icon = ICON_MAP[departamento.codigo] ?? Activity;
  const shieldImg = SHIELD_MAP[departamento.codigo];

  // Aplanar todas las filas para export
  const todasLasFilas = tablasState.flatMap(t => t.datos);

  return (
    <div>
      <PageHeader
        titulo={departamento.nombre}
        subtitulo="Datos estadísticos comparativos"
        color={departamento.color}
        icon={
          shieldImg ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={shieldImg}
              alt={departamento.nombre}
              width={28}
              height={28}
              className="object-contain"
            />
          ) : (
            <Icon size={24} />
          )
        }
      >
        <ExportButtons
          titulo={departamento.nombre}
          datos={todasLasFilas}
          departamento={departamento.nombre}
          periodo={`${periodoAnteriorLabel} vs ${periodoActualLabel}`}
        />
      </PageHeader>

      {/* Escudo del departamento (si existe) */}
      {shieldImg && (
        <div className="flex justify-center mb-8">
          <div className="flex flex-col items-center gap-3 p-6 bg-white rounded-2xl shadow-sm border border-gray-100">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={shieldImg}
              alt={`Escudo ${departamento.nombre}`}
              width={180}
              height={200}
              className="object-contain drop-shadow-md"
            />
            <p className="text-sm font-semibold text-gray-600 uppercase tracking-wider">
              {departamento.nombre}
            </p>
          </div>
        </div>
      )}

      {/* Stats resumen */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <StatCard
          titulo="Total Período Anterior"
          valor={chartData.totalAnterior}
          icon={<Icon size={20} />}
          color={departamento.color}
        />
        <StatCard
          titulo="Total Período Actual"
          valor={chartData.totalActual}
          valorAnterior={chartData.totalAnterior}
          porcentaje={chartData.porcentaje}
          icon={<Icon size={20} />}
          color={departamento.color}
        />
        <StatCard
          titulo="Tablas de Datos"
          valor={tablasState.length}
          subtitulo={`${todasLasFilas.length} filas en total`}
          icon={<Icon size={20} />}
          color={departamento.color}
        />
      </div>

      {/* Gráficos reactivos */}
      {tablasState.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <ChartContainer titulo="Comparativo por Períodos">
            <BarChartComparativo
              datos={chartData.barData.slice(0, 10)}
              colorAnterior="#94a3b8"
              colorActual={departamento.color}
            />
          </ChartContainer>
          {chartData.pieData.length > 1 && (
            <ChartContainer titulo="Distribución Actual por Categoría">
              <PieChartComponent datos={chartData.pieData} />
            </ChartContainer>
          )}
        </div>
      )}

      {/* Tablas editables */}
      <SectionHeader titulo="Datos Comparativos" color={departamento.color} />
      <div className="space-y-6">
        {tablasState.map(tabla => (
          <TablaComparativa
            key={tabla.tablaId}
            titulo={tabla.nombre}
            tablaId={tabla.tablaId}
            tablaConfigId={tabla.id}
            departamento={departamento.nombre}
            color={departamento.color}
            labelPeriodoAnterior={periodoAnteriorLabel}
            labelPeriodoActual={periodoActualLabel}
            filas={tabla.datos}
            onDataChange={handleDataChange}
          />
        ))}
      </div>

      {tablasState.length === 0 && (
        <div className="card p-12 text-center">
          <p className="text-gray-500 text-lg">
            No hay tablas configuradas para este departamento.
          </p>
          <p className="text-gray-400 text-sm mt-2">
            Contacte al administrador para agregar datos.
          </p>
        </div>
      )}
    </div>
  );
}
