'use client';

import { useCallback, useMemo } from 'react';
import { SectionHeader } from '@/components/ui/PageHeader';
import { StatCard } from '@/components/ui/StatCard';
import { guardarDatosComparativos } from '@/actions/datos';
import {
  buildDigedropDashboard,
  replaceDigedropRawTableRows,
  type DigedropRawTable,
  type DigedropRawRow,
} from '@/lib/digedrop-transform';
import { DIGEDROP_TABLE_IDS } from '@/lib/digedrop-definition';
import {
  DigedropComparisonTable,
  DigedropDetenidosTable,
  DigedropTextTable,
} from '@/components/tables/DigedropTables';
import { Pill, Search, Users, AlertTriangle } from 'lucide-react';

// ─── Tipos locales ──────────────────────────────────────────────────────────
interface DepartamentoInfo {
  id: string;
  codigo: string;
  nombre: string;
  color: string;
  orden: number;
}

interface DigedropDepartamentoViewProps {
  departamento: DepartamentoInfo;
  tables: DigedropRawTable[];
  periodoAnteriorLabel: string;
  periodoActualLabel: string;
  onTablesChange: (nextTables: DigedropRawTable[]) => void;
}

// ─── Componente principal ──────────────────────────────────────────────────
export default function DigedropDepartamentoView({
  departamento,
  tables,
  periodoAnteriorLabel,
  periodoActualLabel,
  onTablesChange,
}: DigedropDepartamentoViewProps) {
  const dashboard = useMemo(() => buildDigedropDashboard(tables), [tables]);

  const color = departamento.color; // #dc2626 (red)

  // ── Totales para StatCards ────────────────────────────────────────────────
  const totalSustancias2025 = dashboard.sustancias.reduce((a, r) => a + r.periodoActual, 0);
  const totalSustancias2024 = dashboard.sustancias.reduce((a, r) => a + r.periodoAnterior, 0);

  const totalElementos2025 = dashboard.elementos.reduce((a, r) => a + r.periodoActual, 0);
  const totalElementos2024 = dashboard.elementos.reduce((a, r) => a + r.periodoAnterior, 0);

  const totalProcedimientos2025 = dashboard.allanamientos.reduce((a, r) => a + r.periodoActual, 0);
  const totalProcedimientos2024 = dashboard.allanamientos.reduce((a, r) => a + r.periodoAnterior, 0);

  const totalDetenidos2025 = dashboard.detenidos.reduce((a, r) => a + r.periodoActual, 0);
  const totalDetenidos2024 = dashboard.detenidos.reduce((a, r) => a + r.periodoAnterior, 0);
  const totalPrevenidos2025 = dashboard.prevenidos.reduce((a, r) => a + r.periodoActual, 0);
  const totalPrevenidos2024 = dashboard.prevenidos.reduce((a, r) => a + r.periodoAnterior, 0);
  const totalPersonas2025 = totalDetenidos2025 + totalPrevenidos2025;
  const totalPersonas2024 = totalDetenidos2024 + totalPrevenidos2024;

  // ── Commit genérico ──────────────────────────────────────────────────────
  const handleCommit = useCallback(
    async (tablaId: string, nextRawRows: DigedropRawRow[]) => {
      const sourceTable = tables.find(t => t.tablaId === tablaId);
      if (!sourceTable) throw new Error('Tabla no encontrada');

      await guardarDatosComparativos(
        sourceTable.id,
        nextRawRows.map(row => ({
          filaId: row.id,
          label: row.label,
          periodoAnterior: String(row.periodoAnterior),
          periodoActual: String(row.periodoActual),
        }))
      );

      onTablesChange(replaceDigedropRawTableRows(tables, tablaId, nextRawRows));
    },
    [onTablesChange, tables]
  );

  const hasTable = (tablaId: string) => tables.some(t => t.tablaId === tablaId);

  return (
    <div className="space-y-8">
      {/* ── Cabecera del modelo DIGEDROP ──────────────────────────────── */}
      <div className="overflow-hidden rounded-[28px] border border-red-500/20 bg-white shadow-[0_20px_45px_rgba(15,29,48,0.08)]">
        <div className="grid gap-4 border-b border-slate-200/70 bg-[linear-gradient(135deg,rgba(220,38,38,0.06),rgba(220,38,38,0.14))] px-6 py-5 lg:grid-cols-[1.3fr_0.7fr]">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-slate-500">
              Modelo DIGEDROP avanzado
            </p>
            <h2 className="font-institutional mt-2 text-2xl font-black uppercase italic text-slate-900">
              Cuadros estadísticos DIGEDROP
            </h2>
            <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-600">
              Panel unificado para el seguimiento de secuestros de sustancias prohibidas,
              elementos, allanamientos, procedimientos, detenidos y prevenidos,
              con comparativa anual detallada.
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
              <div className="mt-1 text-2xl font-black text-slate-900">{tables.length}</div>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-white/80 px-4 py-3 shadow-sm">
              <div className="text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-500">Sustancias (act.)</div>
              <div className="mt-1 text-2xl font-black text-slate-900">{totalSustancias2025.toLocaleString('es-AR')}</div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Stat Cards ──────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-4">
        <StatCard
          titulo="Sustancias"
          valor={totalSustancias2025}
          valorAnterior={totalSustancias2024}
          porcentaje={
            totalSustancias2024 > 0
              ? Math.round(((totalSustancias2025 - totalSustancias2024) / totalSustancias2024) * 100)
              : 0
          }
          color={color}
          icon={<Pill size={20} />}
        />
        <StatCard
          titulo="Elementos"
          valor={totalElementos2025}
          valorAnterior={totalElementos2024}
          porcentaje={
            totalElementos2024 > 0
              ? Math.round(((totalElementos2025 - totalElementos2024) / totalElementos2024) * 100)
              : 0
          }
          color={color}
          icon={<Search size={20} />}
        />
        <StatCard
          titulo="Procedimientos"
          valor={totalProcedimientos2025}
          valorAnterior={totalProcedimientos2024}
          porcentaje={
            totalProcedimientos2024 > 0
              ? Math.round(((totalProcedimientos2025 - totalProcedimientos2024) / totalProcedimientos2024) * 100)
              : 0
          }
          color={color}
          icon={<AlertTriangle size={20} />}
        />
        <StatCard
          titulo="Detenidos + Prevenidos"
          valor={totalPersonas2025}
          valorAnterior={totalPersonas2024}
          porcentaje={
            totalPersonas2024 > 0
              ? Math.round(((totalPersonas2025 - totalPersonas2024) / totalPersonas2024) * 100)
              : 0
          }
          color={color}
          icon={<Users size={20} />}
        />
      </div>

      {/* ── Sección: Sustancias Prohibidas ─────────────────────────────────── */}
      <section className="space-y-4">
        <SectionHeader titulo="Secuestro de Sustancias Prohibidas" color={color} />
        <div className="space-y-6">
          <DigedropComparisonTable
            title="Secuestro de Sustancias Prohibidas"
            badge="Sustancias"
            color={color}
            rows={dashboard.sustancias}
            labelAnterior={periodoAnteriorLabel}
            labelActual={periodoActualLabel}
            canSave={hasTable(DIGEDROP_TABLE_IDS.SUSTANCIAS)}
            onSave={async (rows) => {
              await handleCommit(DIGEDROP_TABLE_IDS.SUSTANCIAS, rows);
            }}
            charColumnName="Detalle"
          />
        </div>
      </section>

      {/* ── Sección: Secuestro de Elementos ──────────────────────────────────── */}
      <section className="space-y-4">
        <SectionHeader titulo="Secuestro de Elementos" color={color} />
        <div className="space-y-6">
          <DigedropComparisonTable
            title="Secuestro de Elementos"
            badge="Elementos"
            color={color}
            rows={dashboard.elementos}
            labelAnterior={periodoAnteriorLabel}
            labelActual={periodoActualLabel}
            canSave={hasTable(DIGEDROP_TABLE_IDS.ELEMENTOS)}
            onSave={async (rows) => {
              await handleCommit(DIGEDROP_TABLE_IDS.ELEMENTOS, rows);
            }}
            charColumnName="Detalle"
          />

          <DigedropTextTable
            title="Secuestro de Elementos – Código Aduanero"
            badge="Código Aduanero"
            color={color}
            rows={dashboard.codigoAduanero}
            labelAnterior={periodoAnteriorLabel}
            labelActual={periodoActualLabel}
          />
        </div>
      </section>

      {/* ── Sección: Allanamientos y Procedimientos ──────────────────────────── */}
      <section className="space-y-4">
        <SectionHeader titulo="Allanamientos y Procedimientos" color={color} />
        <div className="space-y-6">
          <DigedropComparisonTable
            title="Secuestro de Sustancias Prohibidas"
            badge="Allanamientos"
            color={color}
            rows={dashboard.allanamientos}
            labelAnterior={periodoAnteriorLabel}
            labelActual={periodoActualLabel}
            canSave={hasTable(DIGEDROP_TABLE_IDS.ALLANAMIENTOS)}
            onSave={async (rows) => {
              await handleCommit(DIGEDROP_TABLE_IDS.ALLANAMIENTOS, rows);
            }}
            charColumnName="Detalle"
          />
        </div>
      </section>

      {/* ── Sección: Detenidos y Prevenidos ──────────────────────────────────── */}
      <section className="space-y-4">
        <SectionHeader titulo="Detenidos y Prevenidos" color={color} />
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <DigedropDetenidosTable
            title="Detenidos"
            badge="Detenidos"
            color={color}
            rows={dashboard.detenidos}
            labelAnterior={periodoAnteriorLabel}
            labelActual={periodoActualLabel}
            canSave={hasTable(DIGEDROP_TABLE_IDS.DETENIDOS)}
            onSave={async (rows) => {
              await handleCommit(DIGEDROP_TABLE_IDS.DETENIDOS, rows);
            }}
            charColumnName="Detalle"
          />

          <DigedropDetenidosTable
            title="Prevenidos"
            badge="Prevenidos"
            color={color}
            rows={dashboard.prevenidos}
            labelAnterior={periodoAnteriorLabel}
            labelActual={periodoActualLabel}
            canSave={hasTable(DIGEDROP_TABLE_IDS.PREVENIDOS)}
            onSave={async (rows) => {
              await handleCommit(DIGEDROP_TABLE_IDS.PREVENIDOS, rows);
            }}
            charColumnName="Detalle"
          />
        </div>
      </section>
    </div>
  );
}
