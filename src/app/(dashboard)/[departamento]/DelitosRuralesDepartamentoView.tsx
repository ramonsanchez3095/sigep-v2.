'use client';

import { useCallback, useMemo } from 'react';
import { SectionHeader } from '@/components/ui/PageHeader';
import { StatCard } from '@/components/ui/StatCard';
import { guardarDatosComparativos } from '@/actions/datos';
import {
  buildDelitosRuralesDashboard,
  replaceDRRawTableRows,
  type DRRawTable,
  type DRRawRow,
} from '@/lib/delitos-rurales-transform';
import { DR_TABLE_IDS } from '@/lib/delitos-rurales-definition';
import { DRComparisonTable } from '@/components/tables/DelitosRuralesTables';
import { Lock, FileText, Search, TreePine } from 'lucide-react';

// ─── Tipos locales ──────────────────────────────────────────────────────────
interface DepartamentoInfo {
  id: string;
  codigo: string;
  nombre: string;
  color: string;
  orden: number;
}

interface DelitosRuralesDepartamentoViewProps {
  departamento: DepartamentoInfo;
  tables: DRRawTable[];
  periodoAnteriorLabel: string;
  periodoActualLabel: string;
  onTablesChange: (nextTables: DRRawTable[]) => void;
}

// ─── Componente principal ──────────────────────────────────────────────────
export default function DelitosRuralesDepartamentoView({
  departamento,
  tables,
  periodoAnteriorLabel,
  periodoActualLabel,
  onTablesChange,
}: DelitosRuralesDepartamentoViewProps) {
  const dashboard = useMemo(() => buildDelitosRuralesDashboard(tables), [tables]);

  const color = departamento.color; // #22c55e (green)

  // ── Totales para StatCards ────────────────────────────────────────────────
  const totalPrivLibertad2025 = dashboard.privLibertad.reduce((a, r) => a + r.periodoActual, 0);
  const totalPrivLibertad2024 = dashboard.privLibertad.reduce((a, r) => a + r.periodoAnterior, 0);

  const totalProcedimientos2025 = dashboard.procedimientos.reduce((a, r) => a + r.periodoActual, 0);
  const totalProcedimientos2024 = dashboard.procedimientos.reduce((a, r) => a + r.periodoAnterior, 0);

  const totalAllanamientos2025 = dashboard.allanamientos.reduce((a, r) => a + r.periodoActual, 0);
  const totalAllanamientos2024 = dashboard.allanamientos.reduce((a, r) => a + r.periodoAnterior, 0);

  const totalSecuestros2025 =
    dashboard.vehiculos.reduce((a, r) => a + r.periodoActual, 0) +
    dashboard.animalesSecuestrados.reduce((a, r) => a + r.periodoActual, 0) +
    dashboard.armasFuego.reduce((a, r) => a + r.periodoActual, 0) +
    dashboard.cartuchos.reduce((a, r) => a + r.periodoActual, 0) +
    dashboard.armaBlanca.reduce((a, r) => a + r.periodoActual, 0) +
    dashboard.otrosSecuestros.reduce((a, r) => a + r.periodoActual, 0) +
    dashboard.secuestro.reduce((a, r) => a + r.periodoActual, 0);
  const totalSecuestros2024 =
    dashboard.vehiculos.reduce((a, r) => a + r.periodoAnterior, 0) +
    dashboard.animalesSecuestrados.reduce((a, r) => a + r.periodoAnterior, 0) +
    dashboard.armasFuego.reduce((a, r) => a + r.periodoAnterior, 0) +
    dashboard.cartuchos.reduce((a, r) => a + r.periodoAnterior, 0) +
    dashboard.armaBlanca.reduce((a, r) => a + r.periodoAnterior, 0) +
    dashboard.otrosSecuestros.reduce((a, r) => a + r.periodoAnterior, 0) +
    dashboard.secuestro.reduce((a, r) => a + r.periodoAnterior, 0);

  // ── Commit genérico ──────────────────────────────────────────────────────
  const handleCommit = useCallback(
    async (tablaId: string, nextRawRows: DRRawRow[]) => {
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

      onTablesChange(replaceDRRawTableRows(tables, tablaId, nextRawRows));
    },
    [onTablesChange, tables]
  );

  const hasTable = (tablaId: string) => tables.some(t => t.tablaId === tablaId);

  return (
    <div className="space-y-8">
      {/* ── Cabecera del modelo Delitos Rurales ──────────────────────────────── */}
      <div className="overflow-hidden rounded-[28px] border border-emerald-500/20 bg-white shadow-[0_20px_45px_rgba(15,29,48,0.08)]">
        <div className="grid gap-4 border-b border-slate-200/70 bg-[linear-gradient(135deg,rgba(34,197,94,0.06),rgba(34,197,94,0.14))] px-6 py-5 lg:grid-cols-[1.3fr_0.7fr]">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-slate-500">
              Modelo Delitos Rurales avanzado
            </p>
            <h2 className="font-institutional mt-2 text-2xl font-black uppercase italic text-slate-900">
              Cuadros estadísticos Delitos Rurales
            </h2>
            <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-600">
              Panel unificado para el seguimiento de privados de libertad, procedimientos,
              allanamientos, vehículos, secuestros de animales, armas y otros elementos,
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
              <div className="text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-500">Priv. Libertad</div>
              <div className="mt-1 text-2xl font-black text-slate-900">{totalPrivLibertad2025.toLocaleString('es-AR')}</div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Stat Cards ──────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-4">
        <StatCard
          titulo="Priv. de Libertad"
          valor={totalPrivLibertad2025}
          valorAnterior={totalPrivLibertad2024}
          porcentaje={
            totalPrivLibertad2024 > 0
              ? Math.round(((totalPrivLibertad2025 - totalPrivLibertad2024) / totalPrivLibertad2024) * 100)
              : 0
          }
          color={color}
          icon={<Lock size={20} />}
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
          icon={<FileText size={20} />}
        />
        <StatCard
          titulo="Allanamientos"
          valor={totalAllanamientos2025}
          valorAnterior={totalAllanamientos2024}
          porcentaje={
            totalAllanamientos2024 > 0
              ? Math.round(((totalAllanamientos2025 - totalAllanamientos2024) / totalAllanamientos2024) * 100)
              : 0
          }
          color={color}
          icon={<Search size={20} />}
        />
        <StatCard
          titulo="Total Secuestros"
          valor={totalSecuestros2025}
          valorAnterior={totalSecuestros2024}
          porcentaje={
            totalSecuestros2024 > 0
              ? Math.round(((totalSecuestros2025 - totalSecuestros2024) / totalSecuestros2024) * 100)
              : 0
          }
          color={color}
          icon={<TreePine size={20} />}
        />
      </div>

      {/* ── Sección: Personas ─────────────────────────────────────────────────── */}
      <section className="space-y-4">
        <SectionHeader titulo="Privados de Libertad y Procedimientos" color={color} />
        <div className="space-y-6">
          <DRComparisonTable
            title="Priv. de Libertad"
            badge="Privados de Libertad"
            color={color}
            rows={dashboard.privLibertad}
            labelAnterior={periodoAnteriorLabel}
            labelActual={periodoActualLabel}
            canSave={hasTable(DR_TABLE_IDS.PRIV_LIBERTAD)}
            onSave={async (rows) => {
              await handleCommit(DR_TABLE_IDS.PRIV_LIBERTAD, rows);
            }}
            charColumnName="Priv. de Libertad"
          />

          <DRComparisonTable
            title="Procedimientos"
            badge="Procedimientos"
            color={color}
            rows={dashboard.procedimientos}
            labelAnterior={periodoAnteriorLabel}
            labelActual={periodoActualLabel}
            canSave={hasTable(DR_TABLE_IDS.PROCEDIMIENTOS)}
            onSave={async (rows) => {
              await handleCommit(DR_TABLE_IDS.PROCEDIMIENTOS, rows);
            }}
            charColumnName="Procedimientos"
          />

          <DRComparisonTable
            title="Allanamientos"
            badge="Allanamientos"
            color={color}
            rows={dashboard.allanamientos}
            labelAnterior={periodoAnteriorLabel}
            labelActual={periodoActualLabel}
            canSave={hasTable(DR_TABLE_IDS.ALLANAMIENTOS)}
            onSave={async (rows) => {
              await handleCommit(DR_TABLE_IDS.ALLANAMIENTOS, rows);
            }}
            charColumnName="Allanamientos"
          />
        </div>
      </section>

      {/* ── Sección: Vehículos y Animales ──────────────────────────────────────── */}
      <section className="space-y-4">
        <SectionHeader titulo="Vehículos y Animales Secuestrados" color={color} />
        <div className="space-y-6">
          <DRComparisonTable
            title="Vehículos"
            badge="Vehículos"
            color={color}
            rows={dashboard.vehiculos}
            labelAnterior={periodoAnteriorLabel}
            labelActual={periodoActualLabel}
            canSave={hasTable(DR_TABLE_IDS.VEHICULOS)}
            onSave={async (rows) => {
              await handleCommit(DR_TABLE_IDS.VEHICULOS, rows);
            }}
            charColumnName="Detalle"
          />

          <DRComparisonTable
            title="Animales Secuestrados"
            badge="Animales Secuestrados"
            color={color}
            rows={dashboard.animalesSecuestrados}
            labelAnterior={periodoAnteriorLabel}
            labelActual={periodoActualLabel}
            canSave={hasTable(DR_TABLE_IDS.ANIMALES_SECUESTRADOS)}
            onSave={async (rows) => {
              await handleCommit(DR_TABLE_IDS.ANIMALES_SECUESTRADOS, rows);
            }}
            charColumnName="Detalle"
          />
        </div>
      </section>

      {/* ── Sección: Armas y Secuestros ──────────────────────────────────────── */}
      <section className="space-y-4">
        <SectionHeader titulo="Armas, Cartuchos y Otros Secuestros" color={color} />
        <div className="space-y-6">
          <DRComparisonTable
            title="Armas de Fuego (Causa e Infracción)"
            badge="Armas de Fuego"
            color={color}
            rows={dashboard.armasFuego}
            labelAnterior={periodoAnteriorLabel}
            labelActual={periodoActualLabel}
            canSave={hasTable(DR_TABLE_IDS.ARMAS_FUEGO)}
            onSave={async (rows) => {
              await handleCommit(DR_TABLE_IDS.ARMAS_FUEGO, rows);
            }}
            charColumnName="Detalle"
          />

          <DRComparisonTable
            title="Cartuchos"
            badge="Cartuchos"
            color={color}
            rows={dashboard.cartuchos}
            labelAnterior={periodoAnteriorLabel}
            labelActual={periodoActualLabel}
            canSave={hasTable(DR_TABLE_IDS.CARTUCHOS)}
            onSave={async (rows) => {
              await handleCommit(DR_TABLE_IDS.CARTUCHOS, rows);
            }}
            charColumnName="Detalle"
          />

          <DRComparisonTable
            title="Arma Blanca"
            badge="Arma Blanca"
            color={color}
            rows={dashboard.armaBlanca}
            labelAnterior={periodoAnteriorLabel}
            labelActual={periodoActualLabel}
            canSave={hasTable(DR_TABLE_IDS.ARMA_BLANCA)}
            onSave={async (rows) => {
              await handleCommit(DR_TABLE_IDS.ARMA_BLANCA, rows);
            }}
            charColumnName="Detalle"
          />

          <DRComparisonTable
            title="Otros Secuestros"
            badge="Otros Secuestros"
            color={color}
            rows={dashboard.otrosSecuestros}
            labelAnterior={periodoAnteriorLabel}
            labelActual={periodoActualLabel}
            canSave={hasTable(DR_TABLE_IDS.OTROS_SECUESTROS)}
            onSave={async (rows) => {
              await handleCommit(DR_TABLE_IDS.OTROS_SECUESTROS, rows);
            }}
            charColumnName="Detalle"
          />

          <DRComparisonTable
            title="Secuestro"
            badge="Secuestro"
            color={color}
            rows={dashboard.secuestro}
            labelAnterior={periodoAnteriorLabel}
            labelActual={periodoActualLabel}
            canSave={hasTable(DR_TABLE_IDS.SECUESTRO)}
            onSave={async (rows) => {
              await handleCommit(DR_TABLE_IDS.SECUESTRO, rows);
            }}
            charColumnName="Detalle"
          />
        </div>
      </section>
    </div>
  );
}
