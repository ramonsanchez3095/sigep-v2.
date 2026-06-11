'use client';

import { useCallback, useMemo } from 'react';
import { SectionHeader } from '@/components/ui/PageHeader';
import { StatCard } from '@/components/ui/StatCard';
import { guardarDatosComparativos } from '@/actions/datos';
import {
  buildD5Dashboard,
  replaceD5RawTableRows,
  type D5RawTable,
  type D5RawRow,
} from '@/lib/d5-transform';
import {
  D5_TABLE_IDS,
  D5_PENDIENTES_CONCEPTS,
  D5_CONTRAVENCIONALES_CONCEPTS,
  D5_LIBERADOS_CONCEPTS,
  D5_LLAMADAS_CONCEPTS,
  type D5ComparisonRow,
} from '@/lib/d5-definition';
import {
  D5ComparisonTable,
  D5HabeasCorpusTable,
  D5MonthlyGroupedTable,
  D5SingleYearMonthlyTable,
  type D5MonthlyInputRow,
} from '@/components/tables/D5JudicialTables';
import { Shield, Scale, HelpCircle, FileText, Lock, UserX, AlertTriangle } from 'lucide-react';

// ─── Tipos locales ──────────────────────────────────────────────────────────
interface DepartamentoInfo {
  id: string;
  codigo: string;
  nombre: string;
  color: string;
  orden: number;
}

interface D5DepartamentoViewProps {
  departamento: DepartamentoInfo;
  tables: D5RawTable[];
  periodoAnteriorLabel: string;
  periodoActualLabel: string;
  onTablesChange: (nextTables: D5RawTable[]) => void;
}

// ─── Helpers de conversión ──────────────────────────────────────────────────

function monthlyToRawRows(rows: D5MonthlyInputRow[]): D5RawRow[] {
  return rows.map(r => ({
    id: `${r.concept}_${r.mes.toLowerCase()}_${r.anio}`,
    label: `${r.label} - ${r.mes} ${r.anio}`,
    periodoAnterior: 0,
    periodoActual: r.valor,
  }));
}

// ─── Componente principal ──────────────────────────────────────────────────
export default function D5DepartamentoView({
  departamento,
  tables,
  periodoAnteriorLabel,
  periodoActualLabel,
  onTablesChange,
}: D5DepartamentoViewProps) {
  const dashboard = useMemo(() => buildD5Dashboard(tables), [tables]);

  const color = departamento.color; // #8b5cf6 (violet)

  // ── Totales para StatCards ────────────────────────────────────────────────
  const totalDetenidos2025 = dashboard.detenidosProcesales.reduce((a, r) => a + r.periodoActual, 0);
  const totalDetenidos2024 = dashboard.detenidosProcesales.reduce((a, r) => a + r.periodoAnterior, 0);
  
  const totalConsignas2025 = dashboard.consignasRegionales.reduce((a, r) => a + r.periodoActual, 0);
  const totalConsignas2024 = dashboard.consignasRegionales.reduce((a, r) => a + r.periodoAnterior, 0);

  const totalHabeas2025 = dashboard.recursosHabeasCorpus.reduce((a, r) => a + r.periodoActual, 0);
  const totalHabeas2024 = dashboard.recursosHabeasCorpus.reduce((a, r) => a + r.periodoAnterior, 0);

  const totalArmas2025 = dashboard.armasSecuestradas.reduce((a, r) => a + r.periodoActual, 0);

  // ── Commit genérico ──────────────────────────────────────────────────────
  const handleCommit = useCallback(
    async (tablaId: string, nextRawRows: D5RawRow[]) => {
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

      onTablesChange(replaceD5RawTableRows(tables, tablaId, nextRawRows));
    },
    [onTablesChange, tables]
  );

  const hasTable = (tablaId: string) => tables.some(t => t.tablaId === tablaId);

  return (
    <div className="space-y-8">
      {/* ── Cabecera del modelo D5 ──────────────────────────────────────────── */}
      <div className="overflow-hidden rounded-[28px] border border-[#8b5cf6]/20 bg-white shadow-[0_20px_45px_rgba(15,29,48,0.08)]">
        <div className="grid gap-4 border-b border-slate-200/70 bg-[linear-gradient(135deg,rgba(139,92,246,0.06),rgba(139,92,246,0.14))] px-6 py-5 lg:grid-cols-[1.3fr_0.7fr]">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-slate-500">
              Modelo D5 avanzado
            </p>
            <h2 className="font-institutional mt-2 text-2xl font-black uppercase italic text-slate-900">
              Cuadros estadísticos Judiciales
            </h2>
            <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-600">
              Panel unificado para el seguimiento de detenidos procesales/contravencionales, 
              consignas judiciales, recursos de habeas corpus y secuestro de armas, con comparativa 
              anual y mensual.
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
              <div className="text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-500">Total detenidos</div>
              <div className="mt-1 text-2xl font-black text-slate-900">{totalDetenidos2025.toLocaleString('es-AR')}</div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Stat Cards ──────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-4">
        <StatCard
          titulo="Detenidos Procesales"
          valor={totalDetenidos2025}
          valorAnterior={totalDetenidos2024}
          porcentaje={
            totalDetenidos2024 > 0
              ? Math.round(((totalDetenidos2025 - totalDetenidos2024) / totalDetenidos2024) * 100)
              : 0
          }
          color={color}
          icon={<Lock size={20} />}
        />
        <StatCard
          titulo="Consignas Judiciales"
          valor={totalConsignas2025}
          valorAnterior={totalConsignas2024}
          porcentaje={
            totalConsignas2024 > 0
              ? Math.round(((totalConsignas2025 - totalConsignas2024) / totalConsignas2024) * 100)
              : 0
          }
          color={color}
          icon={<Shield size={20} />}
        />
        <StatCard
          titulo="Habeas Corpus"
          valor={totalHabeas2025}
          valorAnterior={totalHabeas2024}
          porcentaje={
            totalHabeas2024 > 0
              ? Math.round(((totalHabeas2025 - totalHabeas2024) / totalHabeas2024) * 100)
              : 0
          }
          color={color}
          icon={<FileText size={20} />}
        />
        <StatCard
          titulo="Armas Secuestradas"
          valor={totalArmas2025}
          subtitulo="Armas de fuego"
          color={color}
          icon={<Scale size={20} />}
        />
      </div>

      {/* ── Sección: Detención y Custodia ────────────────────────────────────── */}
      <section className="space-y-4">
        <SectionHeader titulo="Detención y Custodia de Personas" color={color} />
        <div className="space-y-6">
          <D5ComparisonTable
            title="Detenidos Procesales - 2024 - 2025"
            badge="Detenidos Procesales"
            color={color}
            rows={dashboard.detenidosProcesales}
            labelAnterior={periodoAnteriorLabel}
            labelActual={periodoActualLabel}
            canSave={hasTable(D5_TABLE_IDS.PROCESALES)}
            onSave={async (rows) => {
              await handleCommit(D5_TABLE_IDS.PROCESALES, rows);
            }}
          />

          <D5ComparisonTable
            title="Personal Policial Detenido"
            badge="Policial Detenido"
            color={color}
            rows={dashboard.personalPolicialDetenido}
            labelAnterior={periodoAnteriorLabel}
            labelActual={periodoActualLabel}
            canSave={hasTable(D5_TABLE_IDS.PERSONAL_POLICIAL_DETENIDO)}
            onSave={async (rows) => {
              await handleCommit(D5_TABLE_IDS.PERSONAL_POLICIAL_DETENIDO, rows);
            }}
            charColumnName="Policías Detenidos"
          />

          <D5MonthlyGroupedTable
            title="Detenidos con Pendientes (Capturas)"
            badge="Capturas Pendientes"
            color={color}
            concepts={Array.from(D5_PENDIENTES_CONCEPTS)}
            rows={dashboard.detenidosPendientes as D5MonthlyInputRow[]}
            canSave={hasTable(D5_TABLE_IDS.PENDIENTES)}
            onSave={async (rows) => {
              await handleCommit(D5_TABLE_IDS.PENDIENTES, monthlyToRawRows(rows));
            }}
          />

          <D5MonthlyGroupedTable
            title="Detenidos Contravencionales - 2024 - 2025"
            badge="Contravencionales"
            color={color}
            concepts={Array.from(D5_CONTRAVENCIONALES_CONCEPTS)}
            rows={dashboard.detenidosContravencionales as D5MonthlyInputRow[]}
            canSave={hasTable(D5_TABLE_IDS.CONTRAVENCIONALES)}
            onSave={async (rows) => {
              await handleCommit(D5_TABLE_IDS.CONTRAVENCIONALES, monthlyToRawRows(rows));
            }}
            charColumnName="Regional / Dependencia"
          />

          <D5MonthlyGroupedTable
            title="Detenidos Procesales Liberados"
            badge="Liberados"
            color={color}
            concepts={Array.from(D5_LIBERADOS_CONCEPTS)}
            rows={dashboard.detenidosLiberados as D5MonthlyInputRow[]}
            canSave={hasTable(D5_TABLE_IDS.DETENIDOS_LIBERADOS)}
            onSave={async (rows) => {
              await handleCommit(D5_TABLE_IDS.DETENIDOS_LIBERADOS, monthlyToRawRows(rows));
            }}
            charColumnName="Dependencias / Penales"
          />

          <D5ComparisonTable
            title="Detenidos Trasladados al Servicio Penitenciario"
            badge="Servicio Penitenciario"
            color={color}
            rows={dashboard.detenidosServicioPenitenciario}
            labelAnterior={periodoAnteriorLabel}
            labelActual={periodoActualLabel}
            canSave={hasTable(D5_TABLE_IDS.SERVICIO_PENITENCIARIO)}
            onSave={async (rows) => {
              await handleCommit(D5_TABLE_IDS.SERVICIO_PENITENCIARIO, rows);
            }}
            charColumnName="Servicio Penitenciario"
          />
        </div>
      </section>

      {/* ── Sección: Consignas y Garantías ───────────────────────────────────── */}
      <section className="space-y-4">
        <SectionHeader titulo="Consignas y Garantías Judiciales" color={color} />
        <div className="space-y-6">
          <D5ComparisonTable
            title="Consignas Cubiertas por las Unidades Regionales"
            badge="Consignas Judiciales"
            color={color}
            rows={dashboard.consignasRegionales}
            labelAnterior={periodoAnteriorLabel}
            labelActual={periodoActualLabel}
            canSave={hasTable(D5_TABLE_IDS.CONSIGNAS)}
            onSave={async (rows) => {
              await handleCommit(D5_TABLE_IDS.CONSIGNAS, rows);
            }}
            charColumnName="Consignas policiales ordenadas por autoridades judiciales"
          />

          <D5HabeasCorpusTable
            title="Recursos Presentados por Abogados Habeas Corpus"
            badge="Habeas Corpus"
            color={color}
            rows={dashboard.recursosHabeasCorpus}
            labelAnterior={periodoAnteriorLabel}
            labelActual={periodoActualLabel}
            canSave={hasTable(D5_TABLE_IDS.HABEAS_CORPUS)}
            onSave={async (rows) => {
              await handleCommit(D5_TABLE_IDS.HABEAS_CORPUS, rows);
            }}
            charColumnName="Recursos presentados"
          />
        </div>
      </section>

      {/* ── Sección: Medios y Secuestros ──────────────────────────────────────── */}
      <section className="space-y-4">
        <SectionHeader titulo="Medios de Delito y Secuestros" color={color} />
        <div className="space-y-6">
          <D5ComparisonTable
            title="Armas de Fuego Secuestradas"
            badge="Armas Secuestradas"
            color={color}
            rows={dashboard.armasSecuestradas}
            labelAnterior={periodoAnteriorLabel}
            labelActual={periodoActualLabel}
            canSave={hasTable(D5_TABLE_IDS.ARMAS_SECUESTRADAS)}
            onSave={async (rows) => {
              await handleCommit(D5_TABLE_IDS.ARMAS_SECUESTRADAS, rows);
            }}
            charColumnName="Secuestro"
          />

          <D5SingleYearMonthlyTable
            title="Estadísticas de Llamadas Telefónicas sobre Antecedentes - Período 2025"
            badge="Llamadas Antecedentes"
            color={color}
            concepts={Array.from(D5_LLAMADAS_CONCEPTS)}
            rows={dashboard.llamadasAntecedentes as D5MonthlyInputRow[]}
            canSave={hasTable(D5_TABLE_IDS.LLAMADAS_ANTECEDENTES)}
            onSave={async (rows) => {
              await handleCommit(D5_TABLE_IDS.LLAMADAS_ANTECEDENTES, monthlyToRawRows(rows));
            }}
            charColumnName="Estadísticas de Llamadas"
          />
        </div>
      </section>
    </div>
  );
}

