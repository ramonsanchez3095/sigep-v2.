'use client';

import clsx from 'clsx';
import { useCallback, useMemo } from 'react';
import {
  BarChartComparativo,
  ChartContainer,
  PieChartComponent,
} from '@/components/charts/Charts';
import { D1AdvancedTable } from '@/components/tables/D1AdvancedTable';
import { D3HomicidiosTable, D3HomicidiosResumenTable } from '@/components/tables/D3HomicidiosTable';
import { SectionHeader } from '@/components/ui/PageHeader';
import { StatCard } from '@/components/ui/StatCard';
import { guardarDatosComparativos } from '@/actions/datos';
import {
  buildD3Dashboard,
  replaceD3RawTableRows,
  type D3RawRow,
  type D3RawTable,
} from '@/lib/d3-transform';
import { Activity, Shield, TrendingDown, Users } from 'lucide-react';
import type { D1RawTable, D1RawRow } from '@/lib/d1-transform';

// ─── Tipos locales ─────────────────────────────────────────────────────────
interface DepartamentoInfo {
  id: string;
  codigo: string;
  nombre: string;
  color: string;
  orden: number;
}

interface D3DepartamentoViewProps {
  departamento: DepartamentoInfo;
  tables: D3RawTable[];
  periodoAnteriorLabel: string;
  periodoActualLabel: string;
  onTablesChange: (nextTables: D3RawTable[]) => void;
}

// ─── Layout de presentación por tabla ─────────────────────────────────────
const D3_TABLE_LAYOUT: Record<string, { badge: string; span?: 'full'; note?: string }> = {
  'd3-delitos-propiedad-uurr': {
    badge: 'Por Unidad Regional',
    span: 'full',
    note: 'Comparativo de delitos contra la propiedad desagregado por URCs con cierre provincial automático.',
  },
  'd3-suicidios-total': {
    badge: 'Total Provincial',
    note: 'Total de suicidios registrados a nivel provincial en los períodos comparados.',
  },
  'd3-suicidios-sexo': {
    badge: 'Sexo / Género',
    note: 'Distribución de suicidios por sexo/género con participación relativa sobre el total.',
  },
  'd3-suicidios-modalidades': {
    badge: 'Modalidades',
    span: 'full',
    note: 'Detalle de la modalidad empleada en cada caso de suicidio registrado.',
  },
  'd3-homicidios-dolosos': {
    badge: 'Homicidios Dolosos',
    span: 'full',
    note: 'Estadísticas de hechos de homicidios dolosos clasificadas por ámbito/situación y móvil de crimen.',
  },
  'd3-homicidios-victimas': {
    badge: 'Homicidios Dolosos - Víctimas',
    span: 'full',
    note: 'Estadísticas de cantidad de víctimas por móvil de crimen.',
  },
  'd3-homicidios-resumen': {
    badge: 'Resumen',
    span: 'full',
  },
};

// ─── Componente principal ──────────────────────────────────────────────────
export default function D3DepartamentoView({
  departamento,
  tables,
  periodoAnteriorLabel,
  periodoActualLabel,
  onTablesChange,
}: D3DepartamentoViewProps) {
  const dashboard = useMemo(() => buildD3Dashboard(tables), [tables]);

  // ── Métricas de resumen ───────────────────────────────────────────────────
  const propiedadMetric = dashboard.summaryMetrics.find(m => m.id === 'total_delitos_propiedad');
  const suicidiosMetric = dashboard.summaryMetrics.find(m => m.id === 'total_suicidios');
  const masculinoMetric = dashboard.summaryMetrics.find(m => m.id === 'suicidios_masculino');
  const femeninoMetric  = dashboard.summaryMetrics.find(m => m.id === 'suicidios_femenino');

  // ── Commit de cambios hacia la BD ─────────────────────────────────────────
  const handleCommit = useCallback(
    async (sourceTableId: string, nextRows: D3RawRow[]) => {
      const sourceTable = tables.find(t => t.tablaId === sourceTableId);
      if (!sourceTable) throw new Error('Tabla no encontrada');

      await guardarDatosComparativos(
        sourceTable.id,
        nextRows.map(row => ({
          filaId: row.id,
          label: row.label,
          periodoAnterior: String(row.periodoAnterior),
          periodoActual: String(row.periodoActual),
        }))
      );

      onTablesChange(replaceD3RawTableRows(tables, sourceTableId, nextRows));
    },
    [onTablesChange, tables]
  );

  return (
    <div className="space-y-8">
      {/* ── Cabecera del modelo D3 ─────────────────────────────────────────── */}
      <div className="overflow-hidden rounded-[28px] border border-[#ef4444]/20 bg-white shadow-[0_20px_45px_rgba(15,29,48,0.08)]">
        <div className="grid gap-4 border-b border-slate-200/70 bg-[linear-gradient(135deg,rgba(239,68,68,0.06),rgba(239,68,68,0.14))] px-6 py-5 lg:grid-cols-[1.3fr_0.7fr]">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-slate-500">
              Modelo D3 avanzado
            </p>
            <h2 className="font-institutional mt-2 text-2xl font-black uppercase italic text-slate-900">
              Cuadros estadísticos estructurados
            </h2>
            <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-600">
              Vista organizada de Delitos contra la Propiedad y Suicidios, con cierres calculados
              automáticamente y comparativa entre {periodoAnteriorLabel} y {periodoActualLabel}.
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <div className="rounded-2xl border border-slate-200 bg-white/80 px-4 py-3 shadow-sm">
              <div className="text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-500">Período anterior</div>
              <div className="mt-1 text-sm font-semibold text-slate-900">{periodoAnteriorLabel}</div>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-white/80 px-4 py-3 shadow-sm">
              <div className="text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-500">Período actual</div>
              <div className="mt-1 text-sm font-semibold text-slate-900">{periodoActualLabel}</div>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-white/80 px-4 py-3 shadow-sm">
              <div className="text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-500">Tablas activas</div>
              <div className="mt-1 text-2xl font-black text-slate-900">
                {dashboard.sections.reduce((acc, s) => acc + s.tables.length, 0)}
              </div>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-white/80 px-4 py-3 shadow-sm">
              <div className="text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-500">Secciones</div>
              <div className="mt-1 text-2xl font-black text-slate-900">{dashboard.sections.length}</div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Stat Cards ─────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-4">
        {propiedadMetric ? (
          <StatCard
            titulo="Delitos contra la propiedad"
            valor={propiedadMetric.periodoActual}
            valorAnterior={propiedadMetric.periodoAnterior}
            porcentaje={propiedadMetric.variacion}
            color={departamento.color}
            icon={<Shield size={20} />}
          />
        ) : null}

        {suicidiosMetric ? (
          <StatCard
            titulo="Total suicidios"
            valor={suicidiosMetric.periodoActual}
            valorAnterior={suicidiosMetric.periodoAnterior}
            porcentaje={suicidiosMetric.variacion}
            color="#7c3aed"
            icon={<Activity size={20} />}
          />
        ) : null}

        {masculinoMetric ? (
          <StatCard
            titulo="Suicidios masculinos"
            valor={masculinoMetric.periodoActual}
            valorAnterior={masculinoMetric.periodoAnterior}
            porcentaje={masculinoMetric.variacion}
            color="#1e3a5f"
            icon={<Users size={20} />}
          />
        ) : null}

        {femeninoMetric ? (
          <StatCard
            titulo="Suicidios femeninos"
            valor={femeninoMetric.periodoActual}
            valorAnterior={femeninoMetric.periodoAnterior}
            porcentaje={femeninoMetric.variacion}
            color="#be185d"
            icon={<TrendingDown size={20} />}
          />
        ) : null}
      </div>

      {/* ── Gráficos ───────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        <ChartContainer titulo="Delitos contra la propiedad por Unidad Regional">
          {dashboard.barData.some(d => d.anterior > 0 || d.actual > 0) ? (
            <BarChartComparativo
              datos={dashboard.barData}
              colorAnterior="#94a3b8"
              colorActual={departamento.color}
              height={320}
            />
          ) : (
            <div className="flex h-[320px] items-center justify-center text-sm text-slate-500">
              Cargue valores para visualizar el comparativo por unidad regional.
            </div>
          )}
        </ChartContainer>

        <ChartContainer titulo="Modalidades de suicidios – período actual">
          {dashboard.pieData.length > 0 ? (
            <PieChartComponent datos={dashboard.pieData} height={320} />
          ) : (
            <div className="flex h-[320px] items-center justify-center text-sm text-slate-500">
              Cargue las modalidades de suicidios para visualizar la distribución.
            </div>
          )}
        </ChartContainer>
      </div>

      {/* ── Secciones con tablas ───────────────────────────────────────────── */}
      {dashboard.sections.map(section => (
        <section key={section.id} className="space-y-4">
          <SectionHeader titulo={section.title} color={departamento.color} />
          {section.description ? (
            <p className="text-sm leading-6 text-slate-500">{section.description}</p>
          ) : null}

          <div className="mx-auto flex max-w-6xl flex-col gap-8">
            {section.tables.map(table => {
              const presentation = D3_TABLE_LAYOUT[table.tableId];
              const isHomicidiosTable =
                table.tableId === 'd3-homicidios-dolosos' ||
                table.tableId === 'd3-homicidios-victimas';

              return (
                <div
                  key={table.tableId}
                  className={clsx(presentation?.span === 'full' && '2xl:col-span-2')}
                >
                  {isHomicidiosTable ? (
                    <D3HomicidiosTable
                      table={table}
                      rawTables={tables}
                      color={departamento.color}
                      labelPeriodoAnterior={periodoAnteriorLabel}
                      labelPeriodoActual={periodoActualLabel}
                      badge={presentation?.badge}
                      note={presentation?.note}
                      onCommit={handleCommit}
                    />
                  ) : table.tableId === 'd3-homicidios-resumen' ? (
                    <D3HomicidiosResumenTable
                      table={table}
                      color={departamento.color}
                      labelPeriodoAnterior={periodoAnteriorLabel}
                      labelPeriodoActual={periodoActualLabel}
                      badge={presentation?.badge}
                      note={presentation?.note}
                    />
                  ) : (
                    <D1AdvancedTable
                      table={table as unknown as Parameters<typeof D1AdvancedTable>[0]['table']}
                      rawTables={tables as unknown as D1RawTable[]}
                      color={departamento.color}
                      labelPeriodoAnterior={periodoAnteriorLabel}
                      labelPeriodoActual={periodoActualLabel}
                      badge={presentation?.badge}
                      note={presentation?.note}
                      onCommit={handleCommit as unknown as (sourceTableId: string, nextRows: D1RawRow[]) => Promise<void>}
                    />
                  )}
                </div>
              );
            })}
          </div>
        </section>
      ))}
    </div>
  );
}
