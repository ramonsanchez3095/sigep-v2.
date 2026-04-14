'use client';

import clsx from 'clsx';
import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  AreaChartComponent,
  BarChartComparativo,
  ChartContainer,
  PieChartComponent,
} from '@/components/charts/Charts';
import { D1AdvancedTable } from '@/components/tables/D1AdvancedTable';
import { SectionHeader } from '@/components/ui/PageHeader';
import { StatCard } from '@/components/ui/StatCard';
import { guardarDatosComparativos } from '@/actions/datos';
import { obtenerEstadisticasMensuales } from '@/actions/estadisticas';
import {
  buildD1Dashboard,
  replaceD1RawTableRows,
  type D1RawRow,
  type D1RawTable,
} from '@/lib/d1-transform';
import { Activity, ShieldCheck, Users, VenusAndMars } from 'lucide-react';

interface DepartamentoInfo {
  id: string;
  codigo: string;
  nombre: string;
  color: string;
  orden: number;
}

interface D1DepartamentoViewProps {
  departamento: DepartamentoInfo;
  tables: D1RawTable[];
  periodoAnteriorLabel: string;
  periodoActualLabel: string;
  onTablesChange: (nextTables: D1RawTable[]) => void;
}

const formatDecimalMetric = (value: number) => value.toFixed(2);

const D1_TABLE_LAYOUT: Record<
  string,
  {
    badge: string;
    span?: 'half' | 'full';
    note?: string;
  }
> = {
  'd1-total-personal-policial': {
    badge: 'Base general',
    note: 'Consolida dotacion total, poblacion de referencia y densidad policial.',
  },
  'd1-personal-por-tipo': {
    badge: 'Dotacion',
    note: 'Desagregacion superior y subalterna con peso relativo sobre la fuerza.',
  },
  'd1-personal-por-genero': {
    badge: 'Genero',
    note: 'Distribucion actual y comparativa porcentual por genero.',
  },
  'd1-oficiales-superiores': { badge: 'Jerarquia A' },
  'd1-oficiales-jefes': { badge: 'Jerarquia B' },
  'd1-oficiales-subalternos': { badge: 'Jerarquia C' },
  'd1-suboficiales-y-agentes': {
    badge: 'Escalafon base',
    note: 'Bloque de mayor volumen operativo dentro de la fuerza efectiva.',
  },
  'd1-resumen-jerarquia': {
    badge: 'Cierre jerarquico',
    note: 'Resume oficiales y suboficiales sobre el total consolidado.',
  },
  'd1-dependencias-ddgg': {
    badge: 'Distribucion funcional',
    span: 'full',
    note: 'Dependencias centrales y direcciones generales del esquema D1.',
  },
  'd1-dependencias-divisiones-uurr': {
    badge: 'Territorial',
    span: 'full',
    note: 'Incluye casa central, divisiones e implantacion por UURR.',
  },
  'd1-situacion-particular': {
    badge: 'Novedades',
    note: 'Seguimiento de situaciones administrativas que afectan disponibilidad.',
  },
  'd1-renuncias-aceptadas': { badge: 'Bajas' },
  'd1-otras-situaciones': { badge: 'Movimientos' },
  'd1-ascensos': { badge: 'Promociones' },
};

export default function D1DepartamentoView({
  departamento,
  tables,
  periodoAnteriorLabel,
  periodoActualLabel,
  onTablesChange,
}: D1DepartamentoViewProps) {
  const dashboard = useMemo(() => buildD1Dashboard(tables), [tables]);
  const [trendData, setTrendData] = useState<Awaited<
    ReturnType<typeof obtenerEstadisticasMensuales>
  > | null>(null);

  const forceMetric = dashboard.summaryMetrics.find(
    metric => metric.id === 'fuerza_efectiva'
  );
  const densityMetric = dashboard.summaryMetrics.find(
    metric => metric.id === 'densidad_policial'
  );
  const superiorMetric = dashboard.summaryMetrics.find(
    metric => metric.id === 'personal_superior'
  );
  const femaleMetric = dashboard.summaryMetrics.find(
    metric => metric.id === 'personal_femenino'
  );

  useEffect(() => {
    let cancelled = false;

    async function loadTrend() {
      if (!dashboard.trendTableConfigId) {
        if (!cancelled) {
          setTrendData(null);
        }
        return;
      }

      try {
        const data = await obtenerEstadisticasMensuales({
          escala: 'mensual',
          departamentoId: departamento.id,
          tablaConfigId: dashboard.trendTableConfigId,
        });

        if (!cancelled) {
          setTrendData(data);
        }
      } catch {
        if (!cancelled) {
          setTrendData(null);
        }
      }
    }

    void loadTrend();

    return () => {
      cancelled = true;
    };
  }, [dashboard.trendTableConfigId, departamento.id, tables]);

  const handleCommit = useCallback(
    async (sourceTableId: string, nextRows: D1RawRow[]) => {
      const sourceTable = tables.find(table => table.tablaId === sourceTableId);

      if (!sourceTable) {
        throw new Error('Tabla no encontrada');
      }

      await guardarDatosComparativos(
        sourceTable.id,
        nextRows.map(row => ({
          filaId: row.id,
          label: row.label,
          periodoAnterior: String(row.periodoAnterior),
          periodoActual: String(row.periodoActual),
        }))
      );

      onTablesChange(replaceD1RawTableRows(tables, sourceTableId, nextRows));
    },
    [onTablesChange, tables]
  );

  const hasTrendValues =
    trendData?.datosGrafico.some(item => item.valor > 0) ?? false;

  return (
    <div className="space-y-8">
      <div className="overflow-hidden rounded-[28px] border border-[#d7ad45]/20 bg-white shadow-[0_20px_45px_rgba(15,29,48,0.08)]">
        <div className="grid gap-4 border-b border-slate-200/70 bg-[linear-gradient(135deg,rgba(17,35,60,0.04),rgba(201,169,78,0.12))] px-6 py-5 lg:grid-cols-[1.3fr_0.7fr]">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-slate-500">
              Modelo D1 avanzado
            </p>
            <h2 className="font-institutional mt-2 text-2xl font-black uppercase italic text-slate-900">
              Cuadros comparativos estructurados
            </h2>
            <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-600">
              La vista replica el esquema D1 sobre tablas base editables y cierres calculados, usando el periodo activo configurado en SIGEP.
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <div className="rounded-2xl border border-slate-200 bg-white/80 px-4 py-3 shadow-sm">
              <div className="text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-500">
                Periodo anterior
              </div>
              <div className="mt-1 text-sm font-semibold text-slate-900">
                {periodoAnteriorLabel}
              </div>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-white/80 px-4 py-3 shadow-sm">
              <div className="text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-500">
                Periodo actual
              </div>
              <div className="mt-1 text-sm font-semibold text-slate-900">
                {periodoActualLabel}
              </div>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-white/80 px-4 py-3 shadow-sm">
              <div className="text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-500">
                Tablas activas
              </div>
              <div className="mt-1 text-2xl font-black text-slate-900">
                {dashboard.sections.reduce((acc, section) => acc + section.tables.length, 0)}
              </div>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-white/80 px-4 py-3 shadow-sm">
              <div className="text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-500">
                Secciones
              </div>
              <div className="mt-1 text-2xl font-black text-slate-900">
                {dashboard.sections.length}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-4">
        {forceMetric ? (
          <StatCard
            titulo="Fuerza efectiva"
            valor={forceMetric.periodoActual}
            valorAnterior={forceMetric.periodoAnterior}
            porcentaje={forceMetric.variacion}
            color={departamento.color}
            icon={<Users size={20} />}
          />
        ) : null}

        {superiorMetric ? (
          <StatCard
            titulo="Personal superior"
            valor={superiorMetric.periodoActual}
            valorAnterior={superiorMetric.periodoAnterior}
            porcentaje={superiorMetric.variacion}
            color="#0f766e"
            icon={<ShieldCheck size={20} />}
          />
        ) : null}

        {femaleMetric ? (
          <StatCard
            titulo="Personal femenino"
            valor={femaleMetric.periodoActual}
            valorAnterior={femaleMetric.periodoAnterior}
            porcentaje={femaleMetric.variacion}
            color="#be185d"
            icon={<VenusAndMars size={20} />}
          />
        ) : null}

        {densityMetric ? (
          <StatCard
            titulo="Densidad policial"
            valor={formatDecimalMetric(densityMetric.periodoActual)}
            porcentaje={densityMetric.variacion}
            color="#7c3aed"
            subtitulo={`Anterior: ${formatDecimalMetric(densityMetric.periodoAnterior)}`}
            icon={<Activity size={20} />}
          />
        ) : null}
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        <ChartContainer titulo="Comparativa de bloques principales">
          <BarChartComparativo
            datos={dashboard.barData}
            colorAnterior="#94a3b8"
            colorActual={departamento.color}
            height={320}
          />
        </ChartContainer>

        <ChartContainer titulo="Distribucion actual por genero">
          {dashboard.pieData.length > 0 ? (
            <PieChartComponent datos={dashboard.pieData} height={320} />
          ) : (
            <div className="flex h-[320px] items-center justify-center text-sm text-slate-500">
              Cargue valores en personal por genero para visualizar la distribucion.
            </div>
          )}
        </ChartContainer>

        <ChartContainer titulo="Evolucion mensual del bloque principal">
          {hasTrendValues && trendData ? (
            <AreaChartComponent
              datos={trendData.datosGrafico.map(item => ({
                nombre: item.nombre,
                valor: item.valor,
              }))}
              areas={[
                {
                  key: 'valor',
                  nombre: 'Total diario',
                  color: departamento.color,
                },
              ]}
              height={320}
            />
          ) : (
            <div className="flex h-[320px] items-center justify-center px-6 text-center text-sm text-slate-500">
              No hay historial suficiente en las estadisticas preagregadas para mostrar la tendencia de D1 todavia.
            </div>
          )}
        </ChartContainer>
      </div>

      {dashboard.sections.map(section => (
        <section key={section.id} className="space-y-4">
          <SectionHeader titulo={section.title} color={departamento.color} />
          {section.description ? (
            <p className="text-sm leading-6 text-slate-500">{section.description}</p>
          ) : null}

          <div className="mx-auto flex max-w-6xl flex-col gap-8">
            {section.tables.map(table => {
              const presentation = D1_TABLE_LAYOUT[table.tableId];

              return (
                <div
                  key={table.tableId}
                  className={clsx(
                    presentation?.span === 'full' && '2xl:col-span-2'
                  )}
                >
                  <D1AdvancedTable
                    table={table}
                    rawTables={tables}
                    color={departamento.color}
                    labelPeriodoAnterior={periodoAnteriorLabel}
                    labelPeriodoActual={periodoActualLabel}
                    badge={presentation?.badge}
                    note={presentation?.note}
                    onCommit={handleCommit}
                  />
                </div>
              );
            })}
          </div>
        </section>
      ))}
    </div>
  );
}