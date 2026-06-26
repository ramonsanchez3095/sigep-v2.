'use client';

import { useCallback, useMemo } from 'react';
import { SectionHeader } from '@/components/ui/PageHeader';
import { StatCard } from '@/components/ui/StatCard';
import { guardarDatosComparativos } from '@/actions/datos';
import {
  buildPrevencionCiudadanaDashboard,
  replacePCRawTableRows,
  vehiculosToRawRows,
  type PCRawTable,
  type PCRawRow,
} from '@/lib/prevencion-ciudadana-transform';
import { PC_TABLE_IDS, type PCVehiculoMesRow, type PCComparisonRow } from '@/lib/prevencion-ciudadana-definition';
import {
  PCComparisonTable,
  PCVehiculosMensualTable,
} from '@/components/tables/PrevencionCiudadanaTables';
import { Phone, Lock, Shield, Activity } from 'lucide-react';

interface DepartamentoInfo {
  id: string;
  codigo: string;
  nombre: string;
  color: string;
  orden: number;
}

interface PrevencionCiudadanaDepartamentoViewProps {
  departamento: DepartamentoInfo;
  tables: PCRawTable[];
  periodoAnteriorLabel: string;
  periodoActualLabel: string;
  onTablesChange: (nextTables: PCRawTable[]) => void;
}

export default function PrevencionCiudadanaDepartamentoView({
  departamento,
  tables,
  periodoAnteriorLabel,
  periodoActualLabel,
  onTablesChange,
}: PrevencionCiudadanaDepartamentoViewProps) {
  const dashboard = useMemo(() => buildPrevencionCiudadanaDashboard(tables), [tables]);
  const color = departamento.color; // #06b6d4 (cyan)

  // ── Totales para StatCards ────────────────────────────────────────────────
  const totalPrivLibertad2025 = dashboard.privadosLibertad.reduce((a, r) => a + r.periodoActual, 0);
  const totalPrivLibertad2024 = dashboard.privadosLibertad.reduce((a, r) => a + r.periodoAnterior, 0);

  // Calls received: using total_llamadas_recibidas row
  const callsReceivedRow = dashboard.llamadasRecibidas.find(r => r.id === 'total_llamadas_recibidas');
  const totalLlamadas2025 = callsReceivedRow?.periodoActual ?? 0;
  const totalLlamadas2024 = callsReceivedRow?.periodoAnterior ?? 0;

  const totalServicios2025 = dashboard.serviciosAportados.reduce((a, r) => a + r.periodoActual, 0);
  const totalServicios2024 = dashboard.serviciosAportados.reduce((a, r) => a + r.periodoAnterior, 0);

  const totalCabinas2025 = dashboard.cabinasVigilancia.reduce((a, r) => a + r.periodoActual, 0);
  const totalCabinas2024 = dashboard.cabinasVigilancia.reduce((a, r) => a + r.periodoAnterior, 0);

  // ── Commit para tablas de comparación standard ─────────────────────────────
  const handleCommit = useCallback(
    async (tablaId: string, nextRawRows: PCComparisonRow[]) => {
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

      onTablesChange(replacePCRawTableRows(tables, tablaId, nextRawRows));
    },
    [onTablesChange, tables]
  );

  // ── Commit para tablas de vehículos mensuales (requiere aplanamiento) ───────
  const handleVehiculosCommit = useCallback(
    async (tablaId: string, nextVehiculoRows: PCVehiculoMesRow[]) => {
      const sourceTable = tables.find(t => t.tablaId === tablaId);
      if (!sourceTable) throw new Error('Tabla no encontrada');

      const nextRawRows = vehiculosToRawRows(nextVehiculoRows);

      await guardarDatosComparativos(
        sourceTable.id,
        nextRawRows.map(row => ({
          filaId: row.id,
          label: row.label,
          periodoAnterior: String(row.periodoAnterior),
          periodoActual: String(row.periodoActual),
        }))
      );

      onTablesChange(replacePCRawTableRows(tables, tablaId, nextRawRows));
    },
    [onTablesChange, tables]
  );

  const hasTable = (tablaId: string) => tables.some(t => t.tablaId === tablaId);

  return (
    <div className="space-y-8">
      {/* ── Cabecera del modelo Prevención Ciudadana ────────────────────────── */}
      <div className="overflow-hidden rounded-[28px] border border-cyan-500/20 bg-white shadow-[0_20px_45px_rgba(15,29,48,0.08)]">
        <div className="grid gap-4 border-b border-slate-200/70 bg-[linear-gradient(135deg,rgba(6,182,212,0.06),rgba(6,182,212,0.14))] px-6 py-5 lg:grid-cols-[1.3fr_0.7fr]">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-slate-500">
              Modelo Prevención Ciudadana Avanzado
            </p>
            <h2 className="font-institutional mt-2 text-2xl font-black uppercase italic text-slate-900">
              Cuadros estadísticos Prevención Ciudadana
            </h2>
            <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-600">
              Panel integrado para el monitoreo de llamadas de emergencia recibidas (911),
              cabinas de vigilancia en funcionamiento, personas privadas de la libertad,
              servicios de asistencia policial aportados, y estadísticas de vehículos
              sustraídos y recuperados.
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
              <div className="text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-500">Llamadas Recibidas</div>
              <div className="mt-1 text-2xl font-black text-slate-900">{totalLlamadas2025.toLocaleString('es-AR')}</div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Stat Cards ──────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-4">
        <StatCard
          titulo="Privados de la Libertad"
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
          titulo="Llamadas Recibidas"
          valor={totalLlamadas2025}
          valorAnterior={totalLlamadas2024}
          porcentaje={
            totalLlamadas2024 > 0
              ? Math.round(((totalLlamadas2025 - totalLlamadas2024) / totalLlamadas2024) * 100)
              : 0
          }
          color={color}
          icon={<Phone size={20} />}
        />
        <StatCard
          titulo="Cabinas de Vigilancia"
          valor={totalCabinas2025}
          valorAnterior={totalCabinas2024}
          porcentaje={
            totalCabinas2024 > 0
              ? Math.round(((totalCabinas2025 - totalCabinas2024) / totalCabinas2024) * 100)
              : 0
          }
          color={color}
          icon={<Shield size={20} />}
        />
        <StatCard
          titulo="Servicios Aportados"
          valor={totalServicios2025}
          valorAnterior={totalServicios2024}
          porcentaje={
            totalServicios2024 > 0
              ? Math.round(((totalServicios2025 - totalServicios2024) / totalServicios2024) * 100)
              : 0
          }
          color={color}
          icon={<Activity size={20} />}
        />
      </div>

      {/* ── Sección: Privados de la Libertad ─────────────────────────────────── */}
      <section className="space-y-4">
        <SectionHeader titulo="Privados de la Libertad" color={color} />
        <div className="space-y-6">
          <PCComparisonTable
            title="Detalle de Causas y Contravenciones"
            badge="Privación de Libertad"
            color={color}
            rows={dashboard.privadosLibertad}
            labelAnterior={periodoAnteriorLabel}
            labelActual={periodoActualLabel}
            canSave={hasTable(PC_TABLE_IDS.PRIVADOS_LIBERTAD)}
            onSave={async (rows) => {
              await handleCommit(PC_TABLE_IDS.PRIVADOS_LIBERTAD, rows);
            }}
          />
        </div>
      </section>

      {/* ── Sección: Llamadas y Monitoreo ────────────────────────────────────── */}
      <section className="space-y-4">
        <SectionHeader titulo="Llamadas y Monitoreo" color={color} />
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <div className="space-y-6">
            <PCComparisonTable
              title="Llamadas Recibidas"
              badge="911"
              color={color}
              rows={dashboard.llamadasRecibidas}
              labelAnterior={periodoAnteriorLabel}
              labelActual={periodoActualLabel}
              canSave={hasTable(PC_TABLE_IDS.LLAMADAS_RECIBIDAS)}
              onSave={async (rows) => {
                await handleCommit(PC_TABLE_IDS.LLAMADAS_RECIBIDAS, rows);
              }}
            />
            <PCComparisonTable
              title="Llamadas por Intimidación Pública"
              badge="Amenazas"
              color={color}
              rows={dashboard.llamadasIntimidacion}
              labelAnterior={periodoAnteriorLabel}
              labelActual={periodoActualLabel}
              canSave={hasTable(PC_TABLE_IDS.LLAMADAS_INTIMIDACION)}
              onSave={async (rows) => {
                await handleCommit(PC_TABLE_IDS.LLAMADAS_INTIMIDACION, rows);
              }}
            />
          </div>
          <div>
            <PCComparisonTable
              title="División Cabinas de Vigilancia"
              badge="Monitoreo"
              color={color}
              rows={dashboard.cabinasVigilancia}
              labelAnterior="2024"
              labelActual="2025"
              canSave={hasTable(PC_TABLE_IDS.CABINAS_VIGILANCIA)}
              onSave={async (rows) => {
                await handleCommit(PC_TABLE_IDS.CABINAS_VIGILANCIA, rows);
              }}
            />
          </div>
        </div>
      </section>

      {/* ── Sección: Servicios Aportados ─────────────────────────────────────── */}
      <section className="space-y-4">
        <SectionHeader titulo="Servicios Aportados" color={color} />
        <div className="space-y-6">
          <PCComparisonTable
            title="Tipos de Servicios Atendidos"
            badge="Servicios aportados"
            color={color}
            rows={dashboard.serviciosAportados}
            labelAnterior={periodoAnteriorLabel}
            labelActual={periodoActualLabel}
            canSave={hasTable(PC_TABLE_IDS.SERVICIOS_APORTADOS)}
            onSave={async (rows) => {
              await handleCommit(PC_TABLE_IDS.SERVICIOS_APORTADOS, rows);
            }}
            charColumnName="Tipo de Servicio"
          />
        </div>
      </section>

      {/* ── Sección: Vehículos ──────────────────────────────────────────────── */}
      <section className="space-y-4">
        <SectionHeader titulo="Vehículos Sustraídos y Recuperados" color={color} />
        <div className="space-y-6">
          <PCVehiculosMensualTable
            title="Vehículos Sustraídos (Comparativo Anual Mensual)"
            badge="Sustraídos"
            color={color}
            rows={dashboard.vehiculosSustraidos}
            canSave={hasTable(PC_TABLE_IDS.VEHICULOS_SUSTRAIDOS)}
            onSave={async (rows) => {
              await handleVehiculosCommit(PC_TABLE_IDS.VEHICULOS_SUSTRAIDOS, rows);
            }}
          />
          <PCVehiculosMensualTable
            title="Vehículos Recuperados (Comparativo Anual Mensual)"
            badge="Recuperados"
            color={color}
            rows={dashboard.vehiculosRecuperados}
            canSave={hasTable(PC_TABLE_IDS.VEHICULOS_RECUPERADOS)}
            onSave={async (rows) => {
              await handleVehiculosCommit(PC_TABLE_IDS.VEHICULOS_RECUPERADOS, rows);
            }}
          />
        </div>
      </section>
    </div>
  );
}
