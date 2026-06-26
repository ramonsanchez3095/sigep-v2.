'use client';

import { useState, useTransition, Fragment } from 'react';
import clsx from 'clsx';
import { Edit2, Save, X, ChevronDown } from 'lucide-react';
import { useAppStore } from '@/store';
import { PC_MESES, type PCComparisonRow, type PCVehiculoMesRow, type PCMes } from '@/lib/prevencion-ciudadana-definition';

// ─────────────────────────────────────────────────────────────────────────────
// Utilidades de formato y estilo
// ─────────────────────────────────────────────────────────────────────────────

function formatNumber(num: number) {
  return new Intl.NumberFormat('es-AR').format(num);
}

function formatPct(ant: number, act: number): string {
  if (ant === 0) return act > 0 ? '+100%' : '0%';
  const pct = Math.round(((act - ant) / ant) * 100);
  return `${pct > 0 ? '+' : ''}${pct}%`;
}

function formatPctDetailed(ant: number, act: number): string {
  if (ant === 0) return act > 0 ? '+100%' : '0,00%';
  const pct = ((act - ant) / ant) * 100;
  const formatted = pct.toFixed(2).replace('.', ',');
  return `${pct > 0 ? '+' : ''}${formatted}%`;
}

const PC_GRADIENT = (color: string) =>
  `linear-gradient(135deg, ${color} 0%, ${color}dd 58%, #0f1d30 100%)`;

const MONTH_NAMES_ES: Record<PCMes, string> = {
  ENERO: 'Enero',
  FEBRERO: 'Febrero',
  MARZO: 'Marzo',
  ABRIL: 'Abril',
  MAYO: 'Mayo',
  JUNIO: 'Junio',
  JULIO: 'Julio',
  AGOSTO: 'Agosto',
  SEPTIEMBRE: 'Septiembre',
  OCTUBRE: 'Octubre',
  NOVIEMBRE: 'Noviembre',
  DICIEMBRE: 'Diciembre',
};

// ─────────────────────────────────────────────────────────────────────────────
// Cabecera de tabla reutilizable
// ─────────────────────────────────────────────────────────────────────────────
interface TableHeaderProps {
  color: string;
  badge?: string;
  title: string;
  description?: string;
  canEdit: boolean;
  editando: boolean;
  isPending: boolean;
  onEdit: () => void;
  onSave: () => void;
  onCancel: () => void;
  children?: React.ReactNode;
}

function TableHeader({
  color, badge, title, description, canEdit, editando, isPending, onEdit, onSave, onCancel, children,
}: TableHeaderProps) {
  return (
    <div
      className="flex flex-col gap-4 px-5 py-5 text-white"
      style={{ background: PC_GRADIENT(color) }}
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          {badge && (
            <span className="inline-flex rounded-full border border-white/20 bg-white/10 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.22em] text-white/85 backdrop-blur-sm">
              {badge}
            </span>
          )}
          <h3 className="mt-3 text-base font-semibold uppercase tracking-[0.08em]">{title}</h3>
          {description && <p className="mt-1 text-sm text-white/80">{description}</p>}
        </div>
        {canEdit && (
          <div className="flex shrink-0 items-center gap-2">
            {editando ? (
              <>
                <button
                  onClick={onSave}
                  disabled={isPending}
                  className="rounded-lg bg-white/15 p-2 transition hover:bg-white/25 disabled:cursor-not-allowed disabled:opacity-60"
                  title="Guardar"
                >
                  <Save size={18} />
                </button>
                <button
                  onClick={onCancel}
                  disabled={isPending}
                  className="rounded-lg bg-white/15 p-2 transition hover:bg-white/25 disabled:cursor-not-allowed disabled:opacity-60"
                  title="Cancelar"
                >
                  <X size={18} />
                </button>
              </>
            ) : (
              <button
                onClick={onEdit}
                className="rounded-lg bg-white/15 p-2 transition hover:bg-white/25"
                title="Editar"
              >
                <Edit2 size={18} />
              </button>
            )}
          </div>
        )}
      </div>
      {children}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// PCComparisonTable – Tabla comparativa estándar para Prevención Ciudadana
// ─────────────────────────────────────────────────────────────────────────────
interface PCComparisonTableProps {
  title: string;
  badge?: string;
  color: string;
  rows: PCComparisonRow[];
  labelAnterior: string;
  labelActual: string;
  canSave?: boolean;
  onSave?: (rows: PCComparisonRow[]) => Promise<void>;
  charColumnName?: string;
}

export function PCComparisonTable({
  title, badge, color, rows, labelAnterior, labelActual, canSave, onSave, charColumnName = 'Detalle'
}: PCComparisonTableProps) {
  const { edicionHabilitada } = useAppStore();
  const [editando, setEditando] = useState(false);
  const [draft, setDraft] = useState<PCComparisonRow[]>(rows);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const active = editando ? draft : rows;

  const handleEdit = () => { setDraft(rows); setEditando(true); };
  const handleCancel = () => { setEditando(false); setError(null); };
  const handleChange = (id: string, field: 'periodoAnterior' | 'periodoActual', val: string) => {
    const n = Number(val);
    setDraft(d => d.map(r => r.id === id ? { ...r, [field]: isFinite(n) ? n : 0 } : r));
  };
  const handleSave = () => {
    if (!onSave) return;
    startTransition(async () => {
      try {
        setError(null);
        await onSave(draft);
        setEditando(false);
      } catch {
        setError('No se pudo guardar la tabla.');
      }
    });
  };

  const canEdit = edicionHabilitada && Boolean(canSave);

  // Totales
  const totalAnterior = active.reduce((acc, r) => acc + r.periodoAnterior, 0);
  const totalActual = active.reduce((acc, r) => acc + r.periodoActual, 0);
  const difTotal = totalActual - totalAnterior;
  const porcTotal = totalAnterior === 0 ? (totalActual > 0 ? 100 : 0) : Math.round(((totalActual - totalAnterior) / totalAnterior) * 100);

  return (
    <div className="card overflow-hidden rounded-[26px] border border-slate-200/80 shadow-[0_16px_38px_rgba(15,29,48,0.06)] bg-white">
      <TableHeader
        color={color}
        badge={badge}
        title={title}
        canEdit={canEdit}
        editando={editando}
        isPending={isPending}
        onEdit={handleEdit}
        onSave={handleSave}
        onCancel={handleCancel}
      />

      {error && (
        <div className="border-b border-red-200 bg-red-50 px-5 py-3 text-sm font-medium text-red-700">
          {error}
        </div>
      )}

      <div className="overflow-x-auto">
        <table className="min-w-full border-collapse text-sm text-slate-700">
          <thead>
            <tr className="bg-[#f0f9ff] text-slate-700">
              <th className="border-b border-slate-200/60 px-5 py-3.5 text-left font-semibold uppercase tracking-[0.08em] text-xs">
                {charColumnName}
              </th>
              <th className="border-b border-slate-200/60 px-4 py-3.5 text-center font-semibold uppercase tracking-[0.08em] text-xs w-36">
                {labelAnterior}
              </th>
              <th className="border-b border-slate-200/60 px-4 py-3.5 text-center font-semibold uppercase tracking-[0.08em] text-xs w-36">
                {labelActual}
              </th>
              <th className="border-b border-slate-200/60 px-4 py-3.5 text-center font-semibold uppercase tracking-[0.08em] text-xs w-32">
                Diferencia
              </th>
              <th className="border-b border-slate-200/60 px-4 py-3.5 text-center font-semibold uppercase tracking-[0.08em] text-xs w-32">
                Porcentaje
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {active.map(row => {
              const diff = row.periodoActual - row.periodoAnterior;
              const isPos = diff > 0;
              const isNeg = diff < 0;

              return (
                <tr key={row.id} className="hover:bg-slate-50/50 transition">
                  <td className="px-5 py-3 font-medium text-slate-900">{row.label}</td>
                  <td className="px-4 py-3 text-center tabular-nums">
                    {editando ? (
                      <input
                        type="number"
                        value={row.periodoAnterior}
                        onChange={e => handleChange(row.id, 'periodoAnterior', e.target.value)}
                        className="w-28 rounded-lg border border-slate-300 px-2 py-1.5 text-center text-slate-900 focus:border-slate-500 outline-none text-xs"
                      />
                    ) : (
                      formatNumber(row.periodoAnterior)
                    )}
                  </td>
                  <td className="px-4 py-3 text-center tabular-nums">
                    {editando ? (
                      <input
                        type="number"
                        value={row.periodoActual}
                        onChange={e => handleChange(row.id, 'periodoActual', e.target.value)}
                        className="w-28 rounded-lg border border-slate-300 px-2 py-1.5 text-center text-slate-900 focus:border-slate-500 outline-none text-xs"
                      />
                    ) : (
                      formatNumber(row.periodoActual)
                    )}
                  </td>
                  <td className={clsx(
                    'px-4 py-3 text-center font-semibold tabular-nums',
                    isPos && 'text-emerald-600',
                    isNeg && 'text-red-500'
                  )}>
                    {diff > 0 ? '+' : ''}{formatNumber(diff)}
                  </td>
                  <td className={clsx(
                    'px-4 py-3 text-center font-bold tabular-nums',
                    isPos && 'text-emerald-600',
                    isNeg && 'text-red-500'
                  )}>
                    {formatPct(row.periodoAnterior, row.periodoActual)}
                  </td>
                </tr>
              );
            })}
            
            {/* Total Row */}
            <tr className="bg-slate-50/70 font-bold border-t-2 border-slate-200">
              <td className="px-5 py-4 text-slate-900">TOTAL</td>
              <td className="px-4 py-4 text-center tabular-nums text-slate-900">
                {formatNumber(totalAnterior)}
              </td>
              <td className="px-4 py-4 text-center tabular-nums text-slate-900">
                {formatNumber(totalActual)}
              </td>
              <td className={clsx(
                'px-4 py-4 text-center tabular-nums',
                difTotal > 0 && 'text-emerald-600',
                difTotal < 0 && 'text-red-500'
              )}>
                {difTotal > 0 ? '+' : ''}{formatNumber(difTotal)}
              </td>
              <td className={clsx(
                'px-4 py-4 text-center font-black tabular-nums',
                difTotal > 0 && 'text-emerald-600',
                difTotal < 0 && 'text-red-500'
              )}>
                {porcTotal > 0 ? '+' : ''}{porcTotal}%
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// PCVehiculosMensualTable – Tabla comparativa mensual para vehículos
// ─────────────────────────────────────────────────────────────────────────────
interface PCVehiculosMensualTableProps {
  title: string;
  badge?: string;
  color: string;
  rows: PCVehiculoMesRow[];
  canSave?: boolean;
  onSave?: (rows: PCVehiculoMesRow[]) => Promise<void>;
}

export function PCVehiculosMensualTable({
  title, badge, color, rows, canSave, onSave
}: PCVehiculosMensualTableProps) {
  const { edicionHabilitada } = useAppStore();
  const [editando, setEditando] = useState(false);
  const [draft, setDraft] = useState<PCVehiculoMesRow[]>(rows);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  // State to filter months. By default show months that have data (Jan - Jul)
  const defaultSelected = new Set<PCMes>([
    'ENERO', 'FEBRERO', 'MARZO', 'ABRIL', 'MAYO', 'JUNIO', 'JULIO'
  ]);
  const [selectedMonths, setSelectedMonths] = useState<Set<PCMes>>(defaultSelected);
  const [showMonthPicker, setShowMonthPicker] = useState(false);

  const active = editando ? draft : rows;

  const handleEdit = () => { setDraft(rows); setEditando(true); };
  const handleCancel = () => { setEditando(false); setError(null); };

  const handleChange = (
    mes: PCMes,
    anio: 2024 | 2025,
    field: keyof Omit<PCVehiculoMesRow, 'mes' | 'anio'>,
    val: string
  ) => {
    const n = parseInt(val, 10);
    setDraft(prev =>
      prev.map(r =>
        r.mes === mes && r.anio === anio
          ? { ...r, [field]: isNaN(n) ? 0 : n }
          : r
      )
    );
  };

  const handleSave = () => {
    if (!onSave) return;
    startTransition(async () => {
      try {
        setError(null);
        await onSave(draft);
        setEditando(false);
      } catch {
        setError('No se pudo guardar la tabla de vehículos.');
      }
    });
  };

  const toggleMonth = (m: PCMes) => {
    const next = new Set(selectedMonths);
    if (next.has(m)) {
      if (next.size > 1) next.delete(m); // Keep at least one
    } else {
      next.add(m);
    }
    setSelectedMonths(next);
  };

  const canEdit = edicionHabilitada && Boolean(canSave);

  const fields: Array<{ key: keyof Omit<PCVehiculoMesRow, 'mes' | 'anio'>; label: string }> = [
    { key: 'moto', label: 'Moto' },
    { key: 'automovil', label: 'Automóvil' },
    { key: 'camioneta', label: 'Camioneta' },
    { key: 'camion', label: 'Camión' },
    { key: 'utilitario', label: 'Utilitario' },
    { key: 'tractor', label: 'Tractor' },
  ];

  const getRow = (mes: PCMes, anio: 2024 | 2025) =>
    active.find(r => r.mes === mes && r.anio === anio);

  const getRowTotal = (row: PCVehiculoMesRow | undefined) => {
    if (!row) return 0;
    return (
      row.moto +
      row.automovil +
      row.camioneta +
      row.camion +
      row.utilitario +
      row.tractor
    );
  };

  const renderCell = (
    mes: PCMes,
    anio: 2024 | 2025,
    field: keyof Omit<PCVehiculoMesRow, 'mes' | 'anio'>
  ) => {
    const row = getRow(mes, anio);
    const val = row?.[field] ?? 0;
    return editando ? (
      <input
        type="number"
        value={val}
        onChange={e => handleChange(mes, anio, field, e.target.value)}
        className="w-16 rounded-lg border border-slate-300 px-1.5 py-1 text-center text-slate-900 focus:border-slate-500 outline-none text-xs"
      />
    ) : (
      formatNumber(val)
    );
  };

  // Filter months to keep order
  const visibleMonths = PC_MESES.filter(m => selectedMonths.has(m));
  const visibleRows2024 = active.filter(r => selectedMonths.has(r.mes) && r.anio === 2024);
  const visibleRows2025 = active.filter(r => selectedMonths.has(r.mes) && r.anio === 2025);

  // Vertical Totals for the footer
  const totalMoto2024 = visibleRows2024.reduce((acc, r) => acc + r.moto, 0);
  const totalMoto2025 = visibleRows2025.reduce((acc, r) => acc + r.moto, 0);

  const totalAuto2024 = visibleRows2024.reduce((acc, r) => acc + r.automovil, 0);
  const totalAuto2025 = visibleRows2025.reduce((acc, r) => acc + r.automovil, 0);

  const totalCamioneta2024 = visibleRows2024.reduce((acc, r) => acc + r.camioneta, 0);
  const totalCamioneta2025 = visibleRows2025.reduce((acc, r) => acc + r.camioneta, 0);

  const totalCamion2024 = visibleRows2024.reduce((acc, r) => acc + r.camion, 0);
  const totalCamion2025 = visibleRows2025.reduce((acc, r) => acc + r.camion, 0);

  const totalUtilitario2024 = visibleRows2024.reduce((acc, r) => acc + r.utilitario, 0);
  const totalUtilitario2025 = visibleRows2025.reduce((acc, r) => acc + r.utilitario, 0);

  const totalTractor2024 = visibleRows2024.reduce((acc, r) => acc + r.tractor, 0);
  const totalTractor2025 = visibleRows2025.reduce((acc, r) => acc + r.tractor, 0);

  const totalGlobal2024 = visibleRows2024.reduce((acc, r) => acc + getRowTotal(r), 0);
  const totalGlobal2025 = visibleRows2025.reduce((acc, r) => acc + getRowTotal(r), 0);

  const diffGlobal = totalGlobal2025 - totalGlobal2024;
  const porcGlobal = totalGlobal2024 === 0 ? (totalGlobal2025 > 0 ? 100 : 0) : ((totalGlobal2025 - totalGlobal2024) / totalGlobal2024) * 100;

  return (
    <div className="card overflow-hidden rounded-[26px] border border-slate-200/80 shadow-[0_16px_38px_rgba(15,29,48,0.06)] bg-white">
      <TableHeader
        color={color}
        badge={badge}
        title={title}
        canEdit={canEdit}
        editando={editando}
        isPending={isPending}
        onEdit={handleEdit}
        onSave={handleSave}
        onCancel={handleCancel}
      >
        <div className="relative mt-2">
          <button
            onClick={() => setShowMonthPicker(!showMonthPicker)}
            className="flex items-center gap-2 rounded-xl border border-white/20 bg-white/10 px-4 py-2 text-sm font-semibold text-white/90 backdrop-blur-sm transition hover:bg-white/20"
          >
            <span>Meses visibles: {selectedMonths.size} de 12</span>
            <ChevronDown
              size={16}
              className={clsx('transition-transform', showMonthPicker && 'rotate-180')}
            />
          </button>
          {showMonthPicker && (
            <div className="absolute left-0 top-full z-20 mt-2 rounded-2xl border border-slate-200 bg-white p-4 shadow-2xl">
              <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-slate-500">Seleccioná los meses a visualizar</p>
              <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
                {PC_MESES.map(m => (
                  <button
                    key={m}
                    onClick={() => toggleMonth(m)}
                    className={clsx(
                      'rounded-lg px-3 py-1.5 text-xs font-semibold uppercase transition',
                      selectedMonths.has(m)
                        ? 'bg-cyan-500 text-white shadow-sm'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    )}
                  >
                    {MONTH_NAMES_ES[m].slice(0, 3)}
                  </button>
                ))}
              </div>
              <button
                onClick={() => setShowMonthPicker(false)}
                className="mt-3 w-full rounded-xl bg-slate-900 py-2 text-xs font-semibold text-white transition hover:bg-slate-700"
              >
                Cerrar
              </button>
            </div>
          )}
        </div>
      </TableHeader>

      {error && (
        <div className="border-b border-red-200 bg-red-50 px-5 py-3 text-sm font-medium text-red-700">
          {error}
        </div>
      )}

      <div className="overflow-x-auto">
        <table className="min-w-full border-collapse text-xs text-slate-700">
          <thead>
            <tr className="bg-[#f0f9ff] text-slate-700">
              <th className="border-b border-r border-slate-200 px-4 py-3.5 text-left font-semibold uppercase tracking-[0.08em]" rowSpan={2}>
                Mes
              </th>
              <th className="border-b border-r border-slate-200 px-3 py-3.5 text-center font-semibold uppercase tracking-[0.08em] w-16" rowSpan={2}>
                Año
              </th>
              <th className="border-b border-slate-200 px-3 py-2 text-center font-semibold uppercase tracking-[0.07em]" colSpan={6}>
                Tipos de Vehículo
              </th>
              <th className="border-b border-r border-slate-200 px-3 py-3.5 text-center font-semibold uppercase tracking-[0.08em] w-24" rowSpan={2}>
                Total
              </th>
              <th className="border-b border-r border-slate-200 px-3 py-3.5 text-center font-semibold uppercase tracking-[0.08em] w-24" rowSpan={2}>
                Diferencia
              </th>
              <th className="border-b border-slate-200 px-3 py-3.5 text-center font-semibold uppercase tracking-[0.08em] w-24" rowSpan={2}>
                Porcentaje
              </th>
            </tr>
            <tr className="bg-slate-50 text-slate-600">
              {fields.map(f => (
                <th key={f.key} className="border-b border-r border-slate-200 px-2 py-2 text-center font-semibold uppercase">
                  {f.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {visibleMonths.map(mes => {
              const row2024 = getRow(mes, 2024);
              const row2025 = getRow(mes, 2025);
              const tot2024 = getRowTotal(row2024);
              const tot2025 = getRowTotal(row2025);

              const diff = tot2025 - tot2024;
              const isPos = diff > 0;
              const isNeg = diff < 0;

              return (
                <Fragment key={mes}>
                  {/* Row 2024 */}
                  <tr className="hover:bg-slate-50/50 transition">
                    <td className="px-4 py-3 font-semibold uppercase border-r border-slate-200/60 align-middle text-slate-900 bg-slate-50/20" rowSpan={2}>
                      {MONTH_NAMES_ES[mes]}
                    </td>
                    <td className="px-3 py-2.5 text-center font-semibold border-r border-slate-200/60 text-slate-500 bg-slate-50/10">
                      2024
                    </td>
                    {fields.map(f => (
                      <td key={f.key} className="px-2 py-2 text-center border-r border-slate-200/60 tabular-nums">
                        {renderCell(mes, 2024, f.key)}
                      </td>
                    ))}
                    <td className="px-3 py-2.5 text-center font-bold border-r border-slate-200/60 tabular-nums text-slate-800 bg-slate-50/10">
                      {formatNumber(tot2024)}
                    </td>
                    {/* Diferencia (rowspan 2) */}
                    <td className={clsx(
                      'px-3 py-2.5 text-center font-bold border-r border-slate-200/60 tabular-nums align-middle bg-slate-50/20',
                      isPos && 'text-emerald-600',
                      isNeg && 'text-red-500'
                    )} rowSpan={2}>
                      {diff > 0 ? '+' : ''}{formatNumber(diff)}
                    </td>
                    {/* Porcentaje (rowspan 2) */}
                    <td className={clsx(
                      'px-3 py-2.5 text-center font-bold tabular-nums align-middle bg-slate-50/20',
                      isPos && 'text-emerald-600',
                      isNeg && 'text-red-500'
                    )} rowSpan={2}>
                      {formatPctDetailed(tot2024, tot2025)}
                    </td>
                  </tr>

                  {/* Row 2025 */}
                  <tr className="hover:bg-slate-50/50 border-b border-slate-200/80 transition">
                    <td className="px-3 py-2.5 text-center font-semibold border-r border-slate-200/60 text-slate-800 bg-slate-50/10">
                      2025
                    </td>
                    {fields.map(f => (
                      <td key={f.key} className="px-2 py-2 text-center border-r border-slate-200/60 tabular-nums">
                        {renderCell(mes, 2025, f.key)}
                      </td>
                    ))}
                    <td className="px-3 py-2.5 text-center font-bold border-r border-slate-200/60 tabular-nums text-slate-900 bg-slate-50/10">
                      {formatNumber(tot2025)}
                    </td>
                  </tr>
                </Fragment>
              );
            })}

            {/* TOTAL COMPLETO DE LA TABLA (Footer) */}
            <tr className="bg-slate-50 font-bold border-t-2 border-slate-300">
              <td className="px-4 py-3 border-r border-slate-200" rowSpan={2}>
                TOTAL
              </td>
              <td className="px-3 py-2.5 text-center border-r border-slate-200 text-slate-500">
                2024
              </td>
              <td className="px-2 py-2 text-center border-r border-slate-200 tabular-nums">
                {formatNumber(totalMoto2024)}
              </td>
              <td className="px-2 py-2 text-center border-r border-slate-200 tabular-nums">
                {formatNumber(totalAuto2024)}
              </td>
              <td className="px-2 py-2 text-center border-r border-slate-200 tabular-nums">
                {formatNumber(totalCamioneta2024)}
              </td>
              <td className="px-2 py-2 text-center border-r border-slate-200 tabular-nums">
                {formatNumber(totalCamion2024)}
              </td>
              <td className="px-2 py-2 text-center border-r border-slate-200 tabular-nums">
                {formatNumber(totalUtilitario2024)}
              </td>
              <td className="px-2 py-2 text-center border-r border-slate-200 tabular-nums">
                {formatNumber(totalTractor2024)}
              </td>
              <td className="px-3 py-2.5 text-center border-r border-slate-200 tabular-nums text-slate-800">
                {formatNumber(totalGlobal2024)}
              </td>
              <td className={clsx(
                'px-3 py-2.5 text-center border-r border-slate-200 tabular-nums align-middle',
                diffGlobal > 0 && 'text-emerald-600',
                diffGlobal < 0 && 'text-red-500'
              )} rowSpan={2}>
                {diffGlobal > 0 ? '+' : ''}{formatNumber(diffGlobal)}
              </td>
              <td className={clsx(
                'px-3 py-2.5 text-center font-black tabular-nums align-middle',
                diffGlobal > 0 && 'text-emerald-600',
                diffGlobal < 0 && 'text-red-500'
              )} rowSpan={2}>
                {diffGlobal > 0 ? '+' : ''}{porcGlobal.toFixed(2).replace('.', ',')}%
              </td>
            </tr>
            <tr className="bg-slate-50 font-bold border-b border-slate-300">
              <td className="px-3 py-2.5 text-center border-r border-slate-200 text-slate-800">
                2025
              </td>
              <td className="px-2 py-2 text-center border-r border-slate-200 tabular-nums">
                {formatNumber(totalMoto2025)}
              </td>
              <td className="px-2 py-2 text-center border-r border-slate-200 tabular-nums">
                {formatNumber(totalAuto2025)}
              </td>
              <td className="px-2 py-2 text-center border-r border-slate-200 tabular-nums">
                {formatNumber(totalCamioneta2025)}
              </td>
              <td className="px-2 py-2 text-center border-r border-slate-200 tabular-nums">
                {formatNumber(totalCamion2025)}
              </td>
              <td className="px-2 py-2 text-center border-r border-slate-200 tabular-nums">
                {formatNumber(totalUtilitario2025)}
              </td>
              <td className="px-2 py-2 text-center border-r border-slate-200 tabular-nums">
                {formatNumber(totalTractor2025)}
              </td>
              <td className="px-3 py-2.5 text-center border-r border-slate-200 tabular-nums text-slate-900">
                {formatNumber(totalGlobal2025)}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
