'use client';

import { useCallback, useMemo } from 'react';
import { SectionHeader } from '@/components/ui/PageHeader';
import { StatCard } from '@/components/ui/StatCard';
import { guardarDatosComparativos } from '@/actions/datos';
import {
  buildAsuntosInternosDashboard,
  replaceAIRawTableRows,
  type AIRawTable,
  type AIRawRow,
} from '@/lib/asuntos-internos-transform';
import {
  AI_TABLE_IDS,
  AI_DENUNCIAS_TIPOS_CONCEPTS,
  AI_DENUNCIAS_SUPERIOR_CONCEPTS,
  AI_DENUNCIAS_SUBOFICIAL_CONCEPTS,
  AI_DENUNCIAS_RESUMEN_CONCEPTS,
  AI_ACTUACIONES_REDES_CONCEPTS,
  AI_ACTUACIONES_ARMAS_CONCEPTS,
  type AIComparisonRow,
  type AIMonthlyInputRow,
} from '@/lib/asuntos-internos-definition';
import {
  AIComparisonTable,
  AIMonthlyGroupedTable,
} from '@/components/tables/AsuntosInternosTables';
import { FileText, AlertTriangle, Shield, Scale } from 'lucide-react';

interface DepartamentoInfo {
  id: string;
  codigo: string;
  nombre: string;
  color: string;
  orden: number;
}

interface AsuntosInternosDepartamentoViewProps {
  departamento: DepartamentoInfo;
  tables: AIRawTable[];
  periodoAnteriorLabel: string;
  periodoActualLabel: string;
  onTablesChange: (nextTables: AIRawTable[]) => void;
}

function monthlyToRawRows(rows: AIMonthlyInputRow[]): AIRawRow[] {
  return rows.map(r => ({
    id: `${r.concept}_${r.mes.toLowerCase()}_${r.anio}`,
    label: `${r.label} - ${r.mes} ${r.anio}`,
    periodoAnterior: 0,
    periodoActual: r.valor,
  }));
}

export default function AsuntosInternosDepartamentoView({
  departamento,
  tables,
  periodoAnteriorLabel,
  periodoActualLabel,
  onTablesChange,
}: AsuntosInternosDepartamentoViewProps) {
  const dashboard = useMemo(() => buildAsuntosInternosDashboard(tables), [tables]);
  const color = departamento.color; // #374151 (slate gray)

  // ── Totales para StatCards ────────────────────────────────────────────────
  const totalDenuncias2025 = dashboard.denunciasResumen
    .filter(r => r.anio === 2025)
    .reduce((a, r) => a + r.valor, 0);
  const totalDenuncias2024 = dashboard.denunciasResumen
    .filter(r => r.anio === 2024)
    .reduce((a, r) => a + r.valor, 0);

  const superior2025 = dashboard.denunciasResumen
    .filter(r => r.concept === 'personal_superior' && r.anio === 2025)
    .reduce((a, r) => a + r.valor, 0);
  const superior2024 = dashboard.denunciasResumen
    .filter(r => r.concept === 'personal_superior' && r.anio === 2024)
    .reduce((a, r) => a + r.valor, 0);

  const suboficial2025 = dashboard.denunciasResumen
    .filter(r => r.concept === 'personal_suboficial' && r.anio === 2025)
    .reduce((a, r) => a + r.valor, 0);
  const suboficial2024 = dashboard.denunciasResumen
    .filter(r => r.concept === 'personal_suboficial' && r.anio === 2024)
    .reduce((a, r) => a + r.valor, 0);

  const armas2025 = dashboard.actuacionesArmas
    .filter(r => r.anio === 2025)
    .reduce((a, r) => a + r.valor, 0);
  const armas2024 = dashboard.actuacionesArmas
    .filter(r => r.anio === 2024)
    .reduce((a, r) => a + r.valor, 0);

  // ── Commit genérico ──────────────────────────────────────────────────────
  const handleCommit = useCallback(
    async (tablaId: string, nextRawRows: AIRawRow[]) => {
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

      onTablesChange(replaceAIRawTableRows(tables, tablaId, nextRawRows));
    },
    [onTablesChange, tables]
  );

  const hasTable = (tablaId: string) => tables.some(t => t.tablaId === tablaId);

  return (
    <div className="space-y-8">
      {/* ── Cabecera del modelo Asuntos Internos ──────────────────────────────── */}
      <div className="overflow-hidden rounded-[28px] border border-slate-700/20 bg-white shadow-[0_20px_45px_rgba(15,29,48,0.08)]">
        <div className="grid gap-4 border-b border-slate-200/70 bg-[linear-gradient(135deg,rgba(55,65,81,0.06),rgba(55,65,81,0.14))] px-6 py-5 lg:grid-cols-[1.3fr_0.7fr]">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-slate-500">
              Modelo Asuntos Internos avanzado
            </p>
            <h2 className="font-institutional mt-2 text-2xl font-black uppercase italic text-slate-900">
              Cuadros estadísticos de Control Policial
            </h2>
            <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-600">
              Panel unificado para el control administrativo de la conducta del personal policial: 
              denuncias recibidas, desglose por jerarquías superior/suboficial, y actuaciones por 
              publicaciones en redes sociales o novedades de armamento reglamentario.
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
              <div className="text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-500">Total Denuncias</div>
              <div className="mt-1 text-2xl font-black text-slate-900">{totalDenuncias2025.toLocaleString('es-AR')}</div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Stat Cards ──────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-4">
        <StatCard
          titulo="Total Denuncias"
          valor={totalDenuncias2025}
          valorAnterior={totalDenuncias2024}
          porcentaje={
            totalDenuncias2024 > 0
              ? Math.round(((totalDenuncias2025 - totalDenuncias2024) / totalDenuncias2024) * 100)
              : 0
          }
          color={color}
          icon={<FileText size={20} />}
        />
        <StatCard
          titulo="Personal Superior"
          valor={superior2025}
          valorAnterior={superior2024}
          porcentaje={
            superior2024 > 0
              ? Math.round(((superior2025 - superior2024) / superior2024) * 100)
              : 0
          }
          color={color}
          icon={<Shield size={20} />}
        />
        <StatCard
          titulo="Personal Suboficial"
          valor={suboficial2025}
          valorAnterior={suboficial2024}
          porcentaje={
            suboficial2024 > 0
              ? Math.round(((suboficial2025 - suboficial2024) / suboficial2024) * 100)
              : 0
          }
          color={color}
          icon={<AlertTriangle size={20} />}
        />
        <StatCard
          titulo="Actuaciones Armas"
          valor={armas2025}
          valorAnterior={armas2024}
          porcentaje={
            armas2024 > 0
              ? Math.round(((armas2025 - armas2024) / armas2024) * 100)
              : 0
          }
          color={color}
          icon={<Scale size={20} />}
        />
      </div>

      {/* ── Sección: Denuncias Recibidas ─────────────────────────────────────── */}
      <section className="space-y-4">
        <SectionHeader titulo="Denuncias Recibidas" color={color} />
        <div className="space-y-6">
          <AIComparisonTable
            title="Denuncias Recibidas (Histórico)"
            badge="Denuncias Recibidas"
            color={color}
            rows={dashboard.denunciasRecibidas}
            labelAnterior={periodoAnteriorLabel}
            labelActual={periodoActualLabel}
            canSave={hasTable(AI_TABLE_IDS.DENUNCIAS)}
            onSave={async (rows) => {
              await handleCommit(AI_TABLE_IDS.DENUNCIAS, rows);
            }}
            charColumnName="Causa de Denuncia"
          />
        </div>
      </section>

      {/* ── Sección: Control y Actuaciones de Personal Policial ─────────────────── */}
      <section className="space-y-4">
        <SectionHeader titulo="Control y Actuaciones de Personal Policial" color={color} />
        <div className="space-y-6">
          <AIMonthlyGroupedTable
            title="Tipos de Denuncias realizadas a Personal Policial"
            badge="Tipos de Denuncia"
            color={color}
            concepts={Array.from(AI_DENUNCIAS_TIPOS_CONCEPTS)}
            rows={dashboard.denunciasTipos}
            canSave={hasTable(AI_TABLE_IDS.DENUNCIAS_TIPOS)}
            onSave={async (rows) => {
              await handleCommit(AI_TABLE_IDS.DENUNCIAS_TIPOS, monthlyToRawRows(rows));
            }}
            charColumnName="Tipos de Denuncias"
          />

          <AIMonthlyGroupedTable
            title="Personal Policial Superior Denunciado"
            badge="Personal Superior"
            color={color}
            concepts={Array.from(AI_DENUNCIAS_SUPERIOR_CONCEPTS)}
            rows={dashboard.denunciasSuperior}
            canSave={hasTable(AI_TABLE_IDS.DENUNCIAS_SUPERIOR)}
            onSave={async (rows) => {
              await handleCommit(AI_TABLE_IDS.DENUNCIAS_SUPERIOR, monthlyToRawRows(rows));
            }}
            charColumnName="Jerarquía de Personal Superior"
          />

          <AIMonthlyGroupedTable
            title="Personal Policial Suboficial Denunciado"
            badge="Personal Suboficial"
            color={color}
            concepts={Array.from(AI_DENUNCIAS_SUBOFICIAL_CONCEPTS)}
            rows={dashboard.denunciasSuboficial}
            canSave={hasTable(AI_TABLE_IDS.DENUNCIAS_SUBOFICIAL)}
            onSave={async (rows) => {
              await handleCommit(AI_TABLE_IDS.DENUNCIAS_SUBOFICIAL, monthlyToRawRows(rows));
            }}
            charColumnName="Jerarquía de Personal Suboficiales"
          />

          <AIMonthlyGroupedTable
            title="Personal Policial Denunciado (Resumen)"
            badge="Resumen Denuncias"
            color={color}
            concepts={Array.from(AI_DENUNCIAS_RESUMEN_CONCEPTS)}
            rows={dashboard.denunciasResumen}
            canSave={hasTable(AI_TABLE_IDS.DENUNCIAS_RESUMEN)}
            onSave={async (rows) => {
              await handleCommit(AI_TABLE_IDS.DENUNCIAS_RESUMEN, monthlyToRawRows(rows));
            }}
            charColumnName="Total"
          />

          <AIMonthlyGroupedTable
            title="Actuaciones Administrativas Iniciadas por Publicaciones en Redes Sociales"
            badge="Redes Sociales"
            color={color}
            concepts={Array.from(AI_ACTUACIONES_REDES_CONCEPTS)}
            rows={dashboard.actuacionesRedes}
            canSave={hasTable(AI_TABLE_IDS.ACTUACIONES_REDES)}
            onSave={async (rows) => {
              await handleCommit(AI_TABLE_IDS.ACTUACIONES_REDES, monthlyToRawRows(rows));
            }}
            charColumnName="Derivaciones Redes Sociales"
          />

          <AIMonthlyGroupedTable
            title="Actuaciones Administrativas Derivadas de Robo y/o Hurto de Armas Reglamentarias"
            badge="Armas Reglamentarias"
            color={color}
            concepts={Array.from(AI_ACTUACIONES_ARMAS_CONCEPTS)}
            rows={dashboard.actuacionesArmas}
            canSave={hasTable(AI_TABLE_IDS.ACTUACIONES_ARMAS)}
            onSave={async (rows) => {
              await handleCommit(AI_TABLE_IDS.ACTUACIONES_ARMAS, monthlyToRawRows(rows));
            }}
            charColumnName="Causa Administrativa"
          />
        </div>
      </section>
    </div>
  );
}
