'use client';

import { useCallback, useMemo } from 'react';
import { SectionHeader } from '@/components/ui/PageHeader';
import { StatCard } from '@/components/ui/StatCard';
import { guardarDatosComparativos } from '@/actions/datos';
import {
  buildD4Dashboard,
  replaceD4RawTableRows,
  type D4RawTable,
  type D4RawRow,
} from '@/lib/d4-transform';
import {
  D4_TABLE_IDS,
  type D4ArmamentoRow,
  type D4VehiculoRow,
  type D4RastreoMesRow,
  type D4AdquisicionRow,
} from '@/lib/d4-definition';
import {
  D4ArmamentoTable,
  D4AdquisicionTable,
  D4VehiculosTable,
  D4RastreoTable,
} from '@/components/tables/D4LogisticaTables';
import { Shield, Truck, Package, Crosshair } from 'lucide-react';

// ─── Tipos locales ──────────────────────────────────────────────────────────
interface DepartamentoInfo {
  id: string;
  codigo: string;
  nombre: string;
  color: string;
  orden: number;
}

interface D4DepartamentoViewProps {
  departamento: DepartamentoInfo;
  tables: D4RawTable[];
  periodoAnteriorLabel: string;
  periodoActualLabel: string;
  onTablesChange: (nextTables: D4RawTable[]) => void;
}

// ─── Helpers de conversión ──────────────────────────────────────────────────

/** Convierte filas de armamento a D4RawRow[] para persistir */
function armamentoToRawRows(rows: D4ArmamentoRow[]): D4RawRow[] {
  return rows.map(r => ({
    id: r.id,
    label: r.label,
    periodoAnterior: r.periodoAnterior,
    periodoActual: r.periodoActual,
  }));
}

/** Convierte filas de vehículos a D4RawRow[] (4 filas por tipo) */
function vehiculosToRawRows(rows: D4VehiculoRow[]): D4RawRow[] {
  const out: D4RawRow[] = [];
  for (const v of rows) {
    out.push({ id: `${v.id}_2024_serv`, label: `${v.tipo} - 2024 - En Servicio`, periodoAnterior: 0, periodoActual: v.enServicio2024 });
    out.push({ id: `${v.id}_2024_fuera`, label: `${v.tipo} - 2024 - Fuera de Servicio`, periodoAnterior: 0, periodoActual: v.fueraServicio2024 });
    out.push({ id: `${v.id}_2025_serv`, label: `${v.tipo} - 2025 - En Servicio`, periodoAnterior: 0, periodoActual: v.enServicio2025 });
    out.push({ id: `${v.id}_2025_fuera`, label: `${v.tipo} - 2025 - Fuera de Servicio`, periodoAnterior: 0, periodoActual: v.fueraServicio2025 });
  }
  return out;
}

/** Convierte filas de rastreo a D4RawRow[] */
function rastreoToRawRows(rows: D4RastreoMesRow[]): D4RawRow[] {
  return rows.flatMap(r => {
    const prefix = `${r.mes.toLowerCase()}_${r.anio}`;
    return [
      { id: `${prefix}_camioneta_furgon`, label: `${r.mes} ${r.anio} - Camioneta/Furgón`, periodoAnterior: 0, periodoActual: r.camionetaFurgon },
      { id: `${prefix}_motos`, label: `${r.mes} ${r.anio} - Motos`, periodoAnterior: 0, periodoActual: r.motos },
      { id: `${prefix}_autos`, label: `${r.mes} ${r.anio} - Autos`, periodoAnterior: 0, periodoActual: r.autos },
      { id: `${prefix}_camion`, label: `${r.mes} ${r.anio} - Camión`, periodoAnterior: 0, periodoActual: r.camion },
      { id: `${prefix}_total_facturado`, label: `${r.mes} ${r.anio} - Total Facturado`, periodoAnterior: 0, periodoActual: r.totalFacturado },
      { id: `${prefix}_total_parque`, label: `${r.mes} ${r.anio} - Total Parque`, periodoAnterior: 0, periodoActual: r.totalParque },
    ];
  });
}

/** Convierte filas de adquisicion a D4RawRow[] */
function adquisicionToRawRows(rows: D4AdquisicionRow[]): D4RawRow[] {
  return rows.map(r => ({
    id: r.id,
    label: `${r.anio}|${r.caracteristica}|${r.marca}|${r.obs ?? ''}|${r.fecha ?? ''}`,
    periodoAnterior: 0,
    periodoActual: r.cantidad,
  }));
}

// ─── Componente principal ──────────────────────────────────────────────────
export default function D4DepartamentoView({
  departamento,
  tables,
  periodoAnteriorLabel,
  periodoActualLabel,
  onTablesChange,
}: D4DepartamentoViewProps) {
  const dashboard = useMemo(() => buildD4Dashboard(tables), [tables]);

  const color = departamento.color; // #f59e0b (amber)

  // ── Totales de vehículos para StatCards ──────────────────────────────────
  const totalVehPolServ2025 = dashboard.vehiculosPolicia.reduce((a, r) => a + r.enServicio2025, 0);
  const totalVehPolFuera2025 = dashboard.vehiculosPolicia.reduce((a, r) => a + r.fueraServicio2025, 0);
  const totalArmamento2025 = dashboard.armamento.reduce((a, r) => a + r.periodoActual, 0);
  const totalArmamento2024 = dashboard.armamento.reduce((a, r) => a + r.periodoAnterior, 0);

  // ── Commit genérico ──────────────────────────────────────────────────────
  const handleCommit = useCallback(
    async (tablaId: string, nextRawRows: D4RawRow[]) => {
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

      onTablesChange(replaceD4RawTableRows(tables, tablaId, nextRawRows));
    },
    [onTablesChange, tables]
  );

  // Helpers específicos
  const hasTable = (tablaId: string) => tables.some(t => t.tablaId === tablaId);

  const parseYear = (label: string) => label.match(/\d{4}/)?.[0] ?? label;
  const añoAnt = parseYear(periodoAnteriorLabel);
  const añoAct = parseYear(periodoActualLabel);

  return (
    <div className="space-y-8">
      {/* ── Cabecera del modelo D4 ──────────────────────────────────────────── */}
      <div className="overflow-hidden rounded-[28px] border border-[#f59e0b]/20 bg-white shadow-[0_20px_45px_rgba(15,29,48,0.08)]">
        <div className="grid gap-4 border-b border-slate-200/70 bg-[linear-gradient(135deg,rgba(245,158,11,0.06),rgba(245,158,11,0.14))] px-6 py-5 lg:grid-cols-[1.3fr_0.7fr]">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-slate-500">
              Modelo D4 avanzado
            </p>
            <h2 className="font-institutional mt-2 text-2xl font-black uppercase italic text-slate-900">
              Cuadros estadísticos de Logística
            </h2>
            <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-600">
              Vista organizada de Armamento, Vehículos y Móviles con Rastreo, con comparativa
              entre {periodoAnteriorLabel} y {periodoActualLabel}.
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
              <div className="text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-500">Total armamento</div>
              <div className="mt-1 text-2xl font-black text-slate-900">{totalArmamento2025.toLocaleString('es-AR')}</div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Stat Cards ──────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-4">
        <StatCard
          titulo="Armamento Total"
          valor={totalArmamento2025}
          valorAnterior={totalArmamento2024}
          porcentaje={
            totalArmamento2024 > 0
              ? Math.round(((totalArmamento2025 - totalArmamento2024) / totalArmamento2024) * 100)
              : 0
          }
          color={color}
          icon={<Crosshair size={20} />}
        />
        <StatCard
          titulo="Vehículos en Servicio"
          valor={totalVehPolServ2025}
          color={color}
          icon={<Truck size={20} />}
        />
        <StatCard
          titulo="Vehículos Fuera de Servicio"
          valor={totalVehPolFuera2025}
          color="#ef4444"
          icon={<Truck size={20} />}
        />
        <StatCard
          titulo="Total de Tablas"
          valor={tables.length}
          subtitulo="Tablas configuradas para D4"
          color={color}
          icon={<Package size={20} />}
        />
      </div>

      {/* ── Sección: Armamento ──────────────────────────────────────────────── */}
      <section className="space-y-4">
        <SectionHeader titulo="Armamento" color={color} />
        <div className="space-y-6">
          <D4ArmamentoTable
            title="Cantidad Total de Armamento"
            badge="Armamento"
            color={color}
            rows={dashboard.armamento}
            labelAnterior={`01/07/${añoAnt} - 31/07/${añoAnt}`}
            labelActual={`01/01/${añoAct} - 31/07/${añoAct}`}
            canSave={hasTable(D4_TABLE_IDS.ARMAMENTO)}
            onSave={async (rows) => {
              await handleCommit(D4_TABLE_IDS.ARMAMENTO, armamentoToRawRows(rows));
            }}
          />
          <D4ArmamentoTable
            title="Proyecciones de Compras"
            badge="Proyecciones"
            color={color}
            rows={dashboard.proyecciones}
            labelAnterior={`01/07/${añoAnt} - 31/07/${añoAnt}`}
            labelActual={`01/01/${añoAct} - 31/07/${añoAct}`}
            canSave={hasTable(D4_TABLE_IDS.PROYECCIONES)}
            onSave={async (rows) => {
              await handleCommit(D4_TABLE_IDS.PROYECCIONES, armamentoToRawRows(rows));
            }}
          />
          <D4AdquisicionTable
            color={color}
            rows={dashboard.adquisicion}
            labelAnterior={periodoAnteriorLabel}
            labelActual={periodoActualLabel}
            canSave={hasTable(D4_TABLE_IDS.ADQUISICION)}
            onSave={async (rows) => {
              await handleCommit(D4_TABLE_IDS.ADQUISICION, adquisicionToRawRows(rows));
            }}
          />
        </div>
      </section>

      {/* ── Sección: Vehículos ──────────────────────────────────────────────── */}
      <section className="space-y-4">
        <SectionHeader titulo="Vehículos" color={color} />
        <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
          <D4VehiculosTable
            title="Vehículos Policiales"
            badge="Policía de Tucumán"
            note="Período: 01 de Enero al 31 de Julio"
            color={color}
            rows={dashboard.vehiculosPolicia}
            canSave={hasTable(D4_TABLE_IDS.VEHICULOS_POLICIA)}
            onSave={async (rows) => {
              await handleCommit(D4_TABLE_IDS.VEHICULOS_POLICIA, vehiculosToRawRows(rows));
            }}
          />
          <D4VehiculosTable
            title="Vehículos del Ministerio de Seguridad"
            badge="Ministerio"
            note="Período: 01 de Enero al 30 de Junio"
            color={color}
            rows={dashboard.vehiculosMinisterio}
            canSave={hasTable(D4_TABLE_IDS.VEHICULOS_MINISTERIO)}
            onSave={async (rows) => {
              await handleCommit(D4_TABLE_IDS.VEHICULOS_MINISTERIO, vehiculosToRawRows(rows));
            }}
          />
        </div>
      </section>

      {/* ── Sección: Rastreo ────────────────────────────────────────────────── */}
      <section className="space-y-4">
        <SectionHeader titulo="Sistema de Rastreo" color={color} />
        <D4RastreoTable
          color={color}
          rows={dashboard.rastreo}
          canSave={hasTable(D4_TABLE_IDS.RASTREO)}
          onSave={async (rows) => {
            await handleCommit(D4_TABLE_IDS.RASTREO, rastreoToRawRows(rows));
          }}
        />
      </section>
    </div>
  );
}
