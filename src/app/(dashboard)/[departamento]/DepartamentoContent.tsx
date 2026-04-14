'use client';

import Image from 'next/image';
import { useState, useCallback, useMemo } from 'react';
import { PageHeader, SectionHeader } from '@/components/ui/PageHeader';
import { StatCard } from '@/components/ui/StatCard';
import D1DepartamentoView from './D1DepartamentoView';
import {
  TablaComparativa,
  type FilaComparativa,
} from '@/components/tables/TablaComparativa';
import { ExportButtons } from '@/components/export/ExportButtons';
import { D1ExportButtons } from '@/components/export/D1ExportButtons';
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
import {
  buildD1Dashboard,
  hasD1StructuredTables,
  type D1RawTable,
} from '@/lib/d1-transform';

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
  d2: '/d2.png',
  d3: '/d3.png',
  d4: '/d4.png',
  d5: '/d5.png',
  asuntos_internos: '/ASUNTOS INT.png',
  delitos_rurales: '/DELITOSRURALES.png',
  digedrop: '/DIGEDROP.png',
  prevencion_ciudadana: '/PREVENCION.png',
  unidades_especiales: '/UNI ESP.png',
  institutos: '/INSTITUCIONES.png',
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

  const d1AvanzadoDisponible =
    departamento.codigo === 'd1' &&
    hasD1StructuredTables(tablasState as unknown as D1RawTable[]);

  const d1Dashboard = useMemo(
    () =>
      d1AvanzadoDisponible
        ? buildD1Dashboard(tablasState as unknown as D1RawTable[])
        : null,
    [d1AvanzadoDisponible, tablasState]
  );

  const Icon = ICON_MAP[departamento.codigo] ?? Activity;
  const shieldImg = SHIELD_MAP[departamento.codigo];
  const codigoLabel = departamento.codigo.toUpperCase().replace(/_/g, ' ');

  // Aplanar todas las filas para export
  const todasLasFilas = tablasState.flatMap(t => t.datos);

  return (
    <div className="space-y-8">
      <section className="division-hero relative overflow-hidden rounded-[28px] border border-[#d7ad45]/30 px-6 py-7 shadow-[0_24px_60px_rgba(15,29,48,0.18)] sm:px-8 sm:py-8 lg:px-10 lg:py-10">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(215,173,69,0.2),transparent_35%),linear-gradient(135deg,#11233c_0%,#1e3a5f_55%,#284a74_100%)]" />
        <div className="absolute -right-12 -top-12 h-40 w-40 rounded-full border border-white/10" />
        <div className="absolute bottom-5 left-5 h-24 w-24 rounded-full border border-white/10" />

        <div className="relative flex flex-col items-center gap-6 text-center lg:flex-row lg:items-center lg:gap-8 lg:text-left">
          <div className="shrink-0 rounded-[28px] bg-white/8 p-2.5 backdrop-blur-sm shadow-[0_18px_35px_rgba(0,0,0,0.18)] ring-1 ring-white/10">
            {shieldImg ? (
              <Image
                src={shieldImg}
                alt={`Escudo ${departamento.nombre}`}
                width={160}
                height={160}
                className="h-28 w-28 object-contain drop-shadow-[0_12px_24px_rgba(0,0,0,0.18)] sm:h-36 sm:w-36 lg:h-40 lg:w-40"
              />
            ) : (
              <div className="flex h-28 w-28 items-center justify-center rounded-[24px] bg-white/10 text-white sm:h-36 sm:w-36 lg:h-40 lg:w-40">
                <Icon size={60} />
              </div>
            )}
          </div>

          <div className="max-w-4xl">
            <div className="inline-flex items-center rounded-full border border-[#f2d47c]/35 bg-white/10 px-4 py-1.5 text-[11px] font-semibold uppercase tracking-[0.28em] text-[#f7e7b2] backdrop-blur-sm">
              {codigoLabel} · Policía de Tucumán · SIGEP
            </div>
            <h1 className="font-institutional mt-4 text-3xl font-black uppercase italic leading-[0.95] text-white drop-shadow-[0_4px_20px_rgba(0,0,0,0.18)] sm:text-4xl lg:text-5xl xl:text-[3.4rem]">
              {departamento.nombre}
            </h1>
            <div className="mx-auto mt-4 h-px w-36 bg-gradient-to-r from-transparent via-[#f2d47c] to-transparent lg:mx-0 lg:w-56" />
            <p className="font-institutional mt-4 text-lg font-bold uppercase italic tracking-[0.08em] text-[#f9efc7] sm:text-xl lg:text-2xl">
              Datos estadísticos comparativos
            </p>
            <p className="mx-auto mt-4 max-w-3xl text-sm leading-6 text-slate-200/95 lg:mx-0 lg:text-base">
              Panel operativo para consolidar, comparar y exportar la información
              del {departamento.nombre.toLowerCase()} entre {periodoAnteriorLabel} y {periodoActualLabel}.
            </p>
          </div>
        </div>
      </section>

      <PageHeader
        titulo={`Panel ${codigoLabel}`}
        subtitulo={`Resumen comparativo ${periodoAnteriorLabel} vs ${periodoActualLabel}`}
        color={departamento.color}
        icon={
          shieldImg ? (
            <Image
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
        {d1Dashboard ? (
          <D1ExportButtons
            titulo={departamento.nombre}
            departamento={departamento.nombre}
            departamentoId={departamento.id}
            periodo={`${periodoAnteriorLabel} vs ${periodoActualLabel}`}
            periodoAnteriorLabel={periodoAnteriorLabel}
            periodoActualLabel={periodoActualLabel}
            dashboard={d1Dashboard}
          />
        ) : (
          <ExportButtons
            titulo={departamento.nombre}
            datos={todasLasFilas}
            departamento={departamento.nombre}
            periodo={`${periodoAnteriorLabel} vs ${periodoActualLabel}`}
          />
        )}
      </PageHeader>

      {departamento.codigo === 'd1' && !d1AvanzadoDisponible ? (
        <div className="rounded-3xl border border-amber-200 bg-amber-50 px-5 py-4 text-sm leading-6 text-amber-800">
          La vista avanzada de D1 ya esta integrada en el sistema. Para verla con la nueva estructura completa hace falta reinicializar D1 con el seed actualizado o regenerar sus tablas base.
        </div>
      ) : null}

      {d1AvanzadoDisponible ? (
        <D1DepartamentoView
          departamento={departamento}
          tables={tablasState as unknown as D1RawTable[]}
          periodoAnteriorLabel={periodoAnteriorLabel}
          periodoActualLabel={periodoActualLabel}
          onTablesChange={nextTables =>
            setTablasState(nextTables as unknown as TablaData[])
          }
        />
      ) : (
        <>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
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

          {tablasState.length > 0 && (
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
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
              <p className="mt-2 text-sm text-gray-400">
                Contacte al administrador para agregar datos.
              </p>
            </div>
          )}
        </>
      )}
    </div>
  );
}
