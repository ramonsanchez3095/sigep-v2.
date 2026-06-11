'use client';

import { useState, useTransition, Fragment } from 'react';
import clsx from 'clsx';
import { Edit2, Save, X, ChevronDown } from 'lucide-react';
import { useAppStore } from '@/store';
import type { AIComparisonRow, AIMes, AIMonthlyInputRow } from '@/lib/asuntos-internos-definition';
import { AI_MESES } from '@/lib/asuntos-internos-definition';

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

const COLOR_GRADIENT = (color: string) =>
  `linear-gradient(135deg, ${color} 0%, ${color}dd 58%, #0f1d30 100%)`;

// ─────────────────────────────────────────────────────────────────────────────
// Cabecera de tabla reutilizable
// ─────────────────────────────────────────────────────────────────────────────
interface TableHeaderProps {
  color: string;
  badge?: string;
  title: string;
  description?: string;
  note?: string;
  canEdit: boolean;
  editando: boolean;
  isPending: boolean;
  onEdit: () => void;
  onSave: () => void;
  onCancel: () => void;
  children?: React.ReactNode;
}

function TableHeader({
  color, badge, title, description, note, canEdit, editando, isPending, onEdit, onSave, onCancel, children,
}: TableHeaderProps) {
  return (
    <div
      className="flex flex-col gap-4 px-5 py-5 text-white"
      style={{ background: COLOR_GRADIENT(color) }}
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
          {note && <p className="mt-2 text-sm text-white/75">{note}</p>}
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
// COMPONENTE 1: AIComparisonTable (Tabla Simple)
// ─────────────────────────────────────────────────────────────────────────────
interface AIComparisonTableProps {
  title: string;
  badge?: string;
  color: string;
  rows: AIComparisonRow[];
  labelAnterior: string;
  labelActual: string;
  canSave?: boolean;
  onSave?: (rows: AIComparisonRow[]) => Promise<void>;
  charColumnName?: string;
}

export function AIComparisonTable({
  title, badge, color, rows, labelAnterior, labelActual, canSave, onSave, charColumnName = 'Características'
}: AIComparisonTableProps) {
  const { edicionHabilitada } = useAppStore();
  const [editando, setEditando] = useState(false);
  const [draft, setDraft] = useState<AIComparisonRow[]>(rows);
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
    <div className="card overflow-hidden rounded-[26px] border border-slate-200/80 shadow-[0_16px_38px_rgba(15,29,48,0.08)] bg-white">
      <TableHeader
        color={color} badge={badge} title={title}
        canEdit={canEdit} editando={editando} isPending={isPending}
        onEdit={handleEdit} onSave={handleSave} onCancel={handleCancel}
      >
        <div className="grid gap-3 sm:grid-cols-3">
          <div className="rounded-2xl border border-white/10 bg-white/10 px-4 py-3 backdrop-blur-sm">
            <div className="text-[10px] font-semibold uppercase tracking-[0.18em] text-white/70">
              Período Anterior ({labelAnterior.match(/\d{4}/)?.[0] ?? 'Anterior'})
            </div>
            <div className="mt-1 text-xl font-black text-white tabular-nums">
              {formatNumber(totalAnterior)}
            </div>
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/10 px-4 py-3 backdrop-blur-sm">
            <div className="text-[10px] font-semibold uppercase tracking-[0.18em] text-white/70">
              Período Actual ({labelActual.match(/\d{4}/)?.[0] ?? 'Actual'})
            </div>
            <div className="mt-1 text-xl font-black text-white tabular-nums">
              {formatNumber(totalActual)}
            </div>
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/10 px-4 py-3 backdrop-blur-sm">
            <div className="text-[10px] font-semibold uppercase tracking-[0.18em] text-white/70">
              Balance
            </div>
            <div className="mt-1 text-xl font-black text-white tabular-nums">
              {porcTotal > 0 ? '+' : ''}
              {porcTotal}%
            </div>
          </div>
        </div>
      </TableHeader>

      <div className="overflow-x-auto">
        <table className="min-w-full border-collapse text-sm text-slate-700">
          <thead>
            <tr className="bg-slate-100/80 text-slate-700">
              <th rowSpan={2} className="border-b border-r border-slate-200 px-4 py-3 text-left font-semibold uppercase tracking-[0.08em]">
                {charColumnName}
              </th>
              <th className="border-b border-r border-slate-200 px-4 py-2 text-center font-semibold uppercase tracking-[0.08em] w-36">
                Período Anterior
              </th>
              <th className="border-b border-r border-slate-200 px-4 py-2 text-center font-semibold uppercase tracking-[0.08em] w-36">
                Período Actual
              </th>
              <th colSpan={2} className="border-b border-slate-200 px-4 py-2 text-center font-semibold uppercase tracking-[0.08em] w-56">
                Balance
              </th>
            </tr>
            <tr className="bg-slate-50 text-slate-500">
              <th className="border-r border-slate-200 px-4 py-2 text-center text-xs font-medium uppercase tracking-[0.08em]">{labelAnterior}</th>
              <th className="border-r border-slate-200 px-4 py-2 text-center text-xs font-medium uppercase tracking-[0.08em]">{labelActual}</th>
              <th className="border-r border-slate-200 px-4 py-2 text-center text-xs font-medium uppercase tracking-[0.08em]">Diferencia</th>
              <th className="px-4 py-2 text-center text-xs font-medium uppercase tracking-[0.08em]">Variacion</th>
            </tr>
          </thead>
          <tbody>
            {active.map((row) => {
              const dif = row.periodoActual - row.periodoAnterior;
              const pct = formatPct(row.periodoAnterior, row.periodoActual);
              const draft_row = draft.find(r => r.id === row.id);
              return (
                <tr key={row.id} className="border-b border-slate-100 hover:bg-slate-50/50">
                  <td className="px-4 py-3 font-semibold uppercase border-r border-slate-200/60 text-slate-900 bg-slate-50/30">
                    {row.label}
                  </td>
                  <td className="px-4 py-3 text-center font-semibold tabular-nums border-r border-slate-200/60">
                    {editando ? (
                      <input
                        type="number"
                        value={draft_row?.periodoAnterior ?? row.periodoAnterior}
                        onChange={e => handleChange(row.id, 'periodoAnterior', e.target.value)}
                        className="w-24 rounded-lg border border-slate-300 px-2 py-1.5 text-center text-slate-900 focus:border-slate-500 outline-none sm:w-28"
                      />
                    ) : (
                      formatNumber(row.periodoAnterior)
                    )}
                  </td>
                  <td className="px-4 py-3 text-center font-semibold tabular-nums border-r border-slate-200/60">
                    {editando ? (
                      <input
                        type="number"
                        value={draft_row?.periodoActual ?? row.periodoActual}
                        onChange={e => handleChange(row.id, 'periodoActual', e.target.value)}
                        className="w-24 rounded-lg border border-slate-300 px-2 py-1.5 text-center text-slate-900 focus:border-slate-500 outline-none sm:w-28"
                      />
                    ) : (
                      formatNumber(row.periodoActual)
                    )}
                  </td>
                  <td className="px-4 py-3 text-center border-r border-slate-200/60">
                    <span
                      className={clsx(
                        'inline-flex rounded-full px-2.5 py-1 text-xs font-semibold',
                        dif > 0 ? 'bg-emerald-100 text-emerald-700' :
                        dif < 0 ? 'bg-rose-100 text-rose-700' : 'bg-slate-200 text-slate-600'
                      )}
                    >
                      {dif > 0 ? '+' : ''}
                      {formatNumber(dif)}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-center font-semibold tabular-nums">
                    {pct}
                  </td>
                </tr>
              );
            })}
            {/* Fila de Totales */}
            <tr className="bg-slate-900 text-white font-bold hover:bg-slate-900 border-t border-slate-700">
              <td className="px-4 py-3 uppercase bg-slate-950 border-r border-slate-700">TOTAL</td>
              <td className="px-4 py-3 text-center border-r border-slate-700 tabular-nums">
                {formatNumber(totalAnterior)}
              </td>
              <td className="px-4 py-3 text-center border-r border-slate-700 tabular-nums">
                {formatNumber(totalActual)}
              </td>
              <td className="px-4 py-3 text-center border-r border-slate-700">
                <span className="inline-flex rounded-full px-2.5 py-1 text-xs font-semibold bg-white/15 text-white">
                  {difTotal > 0 ? '+' : ''}
                  {formatNumber(difTotal)}
                </span>
              </td>
              <td className="px-4 py-3 text-center font-semibold tabular-nums">
                {porcTotal > 0 ? '+' : ''}
                {porcTotal}%
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      {error && (
        <div className="border-t border-rose-100 bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// COMPONENTE 2: AIMonthlyGroupedTable (Meses como columnas con selector)
// ─────────────────────────────────────────────────────────────────────────────
interface AIMonthlyGroupedTableProps {
  title: string;
  badge?: string;
  color: string;
  concepts: Array<{ id: string; label: string }>;
  rows: AIMonthlyInputRow[];
  canSave?: boolean;
  onSave?: (updatedRows: AIMonthlyInputRow[]) => Promise<void>;
  charColumnName?: string;
}

export function AIMonthlyGroupedTable({
  title, badge, color, concepts, rows, canSave, onSave, charColumnName = 'Denuncias'
}: AIMonthlyGroupedTableProps) {
  const { edicionHabilitada } = useAppStore();
  const [editando, setEditando] = useState(false);
  const [draft, setDraft] = useState<AIMonthlyInputRow[]>(rows);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const [selectedMonths, setSelectedMonths] = useState<Set<AIMes>>(
    new Set(AI_MESES.slice(0, 7)) // Predeterminado: Enero a Julio
  );
  const [showMonthPicker, setShowMonthPicker] = useState(false);

  const active = editando ? draft : rows;
  const visibleMonths = AI_MESES.filter(m => selectedMonths.has(m));

  const handleEdit = () => { setDraft(rows); setEditando(true); };
  const handleCancel = () => { setEditando(false); setError(null); };
  const handleChange = (conceptId: string, mes: AIMes, anio: 2024 | 2025, val: string) => {
    const n = Number(val);
    setDraft(d => d.map(r =>
      r.concept === conceptId && r.mes === mes && r.anio === anio
        ? { ...r, valor: isFinite(n) ? n : 0 }
        : r
    ));
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

  const toggleMonth = (m: AIMes) => {
    setSelectedMonths(prev => {
      const next = new Set(prev);
      if (next.has(m)) { if (next.size > 1) next.delete(m); }
      else next.add(m);
      return next;
    });
  };

  const canEdit = edicionHabilitada && Boolean(canSave);

  // Totales por concepto
  const getSumForConcept = (conceptId: string, anio: 2024 | 2025) => {
    return active
      .filter(r => r.concept === conceptId && r.anio === anio && selectedMonths.has(r.mes))
      .reduce((sum, r) => sum + r.valor, 0);
  };

  // Totales generales de la tabla (Suma de todos los conceptos)
  const getGrandSum = (anio: 2024 | 2025) => {
    return active
      .filter(r => r.anio === anio && selectedMonths.has(r.mes))
      .reduce((sum, r) => sum + r.valor, 0);
  };

  const totalGrand2024 = getGrandSum(2024);
  const totalGrand2025 = getGrandSum(2025);
  const difGrandTotal = totalGrand2025 - totalGrand2024;
  const porcGrandTotal = totalGrand2024 === 0 ? (totalGrand2025 > 0 ? 100 : 0) : Math.round(((totalGrand2025 - totalGrand2024) / totalGrand2024) * 100);

  const renderCell = (conceptId: string, mes: AIMes, anio: 2024 | 2025) => {
    const found = active.find(r => r.concept === conceptId && r.mes === mes && r.anio === anio);
    const val = found?.valor ?? 0;

    return editando ? (
      <input
        type="number"
        value={val}
        onChange={e => handleChange(conceptId, mes, anio, e.target.value)}
        className="w-16 rounded-lg border border-slate-300 px-1.5 py-1 text-center text-slate-900 focus:border-[#374151] outline-none text-xs"
      />
    ) : (
      formatNumber(val)
    );
  };

  const MONTH_NAMES_ES: Record<AIMes, string> = {
    ENERO: 'Enero', FEBRERO: 'Febrero', MARZO: 'Marzo', ABRIL: 'Abril',
    MAYO: 'Mayo', JUNIO: 'Junio', JULIO: 'Julio', AGOSTO: 'Agosto',
    SEPTIEMBRE: 'Septiembre', OCTUBRE: 'Octubre', NOVIEMBRE: 'Noviembre', DICIEMBRE: 'Diciembre',
  };

  return (
    <div className="card overflow-hidden rounded-[26px] border border-slate-200/80 shadow-[0_16px_38px_rgba(15,29,48,0.08)] bg-white">
      <TableHeader
        color={color} badge={badge} title={title}
        canEdit={canEdit} editando={editando} isPending={isPending}
        onEdit={handleEdit} onSave={handleSave} onCancel={handleCancel}
      >
        <div className="grid gap-3 sm:grid-cols-3">
          <div className="rounded-2xl border border-white/10 bg-white/10 px-4 py-3 backdrop-blur-sm">
            <div className="text-[10px] font-semibold uppercase tracking-[0.18em] text-white/70">
              Total Visible 2024
            </div>
            <div className="mt-1 text-xl font-black text-white tabular-nums">
              {formatNumber(totalGrand2024)}
            </div>
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/10 px-4 py-3 backdrop-blur-sm">
            <div className="text-[10px] font-semibold uppercase tracking-[0.18em] text-white/70">
              Total Visible 2025
            </div>
            <div className="mt-1 text-xl font-black text-white tabular-nums">
              {formatNumber(totalGrand2025)}
            </div>
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/10 px-4 py-3 backdrop-blur-sm">
            <div className="text-[10px] font-semibold uppercase tracking-[0.18em] text-white/70">
              Balance General
            </div>
            <div className="mt-1 text-xl font-black text-white tabular-nums">
              {porcGrandTotal > 0 ? '+' : ''}
              {porcGrandTotal}%
            </div>
          </div>
        </div>

        {/* Selector de meses */}
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
                {AI_MESES.map(m => (
                  <button
                    key={m}
                    onClick={() => toggleMonth(m)}
                    className={clsx(
                      'rounded-lg px-3 py-1.5 text-xs font-semibold uppercase transition',
                      selectedMonths.has(m)
                        ? 'bg-[#374151] text-white shadow-sm'
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

      <div className="overflow-x-auto">
        <table className="min-w-full border-collapse text-sm text-slate-700">
          <thead>
            <tr className="bg-slate-100/80 text-slate-700">
              <th rowSpan={2} className="border-b border-r border-slate-200 px-4 py-3 text-left font-semibold uppercase tracking-[0.08em] min-w-[200px]">
                {charColumnName}
              </th>
              <th rowSpan={2} className="border-b border-r border-slate-200 px-3 py-3 text-center font-semibold uppercase tracking-[0.08em] w-20">
                Fecha
              </th>
              {visibleMonths.map(mes => (
                <th key={mes} className="border-b border-r border-slate-200 px-2 py-2 text-center font-semibold uppercase text-xs tracking-wider">
                  {MONTH_NAMES_ES[mes].substring(0, 3)}
                </th>
              ))}
              <th rowSpan={2} className="border-b border-r border-slate-200 px-3 py-3 text-center font-semibold uppercase tracking-[0.08em] w-24">
                Total
              </th>
              <th colSpan={2} className="border-b border-slate-200 px-3 py-2 text-center font-semibold uppercase tracking-[0.08em] w-48">
                Balance
              </th>
            </tr>
            <tr className="bg-slate-50 text-slate-500">
              {visibleMonths.map(mes => (
                <th key={mes} className="border-b border-r border-slate-100 px-1 py-1.5 text-center text-[10px] font-medium uppercase tracking-[0.08em]">
                  Valor
                </th>
              ))}
              <th className="border-b border-r border-slate-200 px-3 py-2 text-center text-xs font-medium uppercase tracking-[0.08em]">Diferencia</th>
              <th className="border-b border-slate-200 px-3 py-2 text-center text-xs font-medium uppercase tracking-[0.08em]">Porcentaje</th>
            </tr>
          </thead>
          <tbody>
            {concepts.map((concept) => {
              const sum2024 = getSumForConcept(concept.id, 2024);
              const sum2025 = getSumForConcept(concept.id, 2025);
              const dif = sum2025 - sum2024;
              const pct = formatPct(sum2024, sum2025);

              return (
                <Fragment key={concept.id}>
                  {/* Fila 2024 */}
                  <tr className="border-b border-slate-100 hover:bg-slate-50/50">
                    <td rowSpan={2} className="px-4 py-3 font-semibold uppercase border-r border-slate-200/60 align-middle text-slate-900 bg-slate-50/30">
                      {concept.label}
                    </td>
                    <td className="px-3 py-2.5 text-center font-semibold border-r border-slate-200/60 text-red-600">
                      2024
                    </td>
                    {visibleMonths.map(mes => (
                      <td key={mes} className="px-3 py-2 text-center border-r border-slate-200/60 tabular-nums">
                        {renderCell(concept.id, mes, 2024)}
                      </td>
                    ))}
                    <td className="px-3 py-2 text-center border-r border-slate-200/60 font-bold tabular-nums">
                      {formatNumber(sum2024)}
                    </td>
                    {/* Merged columns for Balance */}
                    <td rowSpan={2} className="px-3 py-2 text-center border-r border-slate-200/60 align-middle">
                      <span className={clsx(
                        'inline-flex rounded-full px-2.5 py-1 text-xs font-semibold',
                        dif > 0 ? 'bg-emerald-100 text-emerald-700' :
                        dif < 0 ? 'bg-rose-100 text-rose-700' : 'bg-slate-200 text-slate-600'
                      )}>
                        {dif > 0 ? '+' : ''}
                        {formatNumber(dif)}
                      </span>
                    </td>
                    <td rowSpan={2} className="px-3 py-2 text-center font-semibold tabular-nums align-middle">
                      {pct}
                    </td>
                  </tr>
                  {/* Fila 2025 */}
                  <tr className="border-b border-slate-200 hover:bg-slate-50/50">
                    <td className="px-3 py-2.5 text-center font-semibold border-r border-slate-200/60 text-slate-900">
                      2025
                    </td>
                    {visibleMonths.map(mes => (
                      <td key={mes} className="px-3 py-2 text-center border-r border-slate-200/60 tabular-nums">
                        {renderCell(concept.id, mes, 2025)}
                      </td>
                    ))}
                    <td className="px-3 py-2 text-center border-r border-slate-200/60 font-bold tabular-nums">
                      {formatNumber(sum2025)}
                    </td>
                  </tr>
                </Fragment>
              );
            })}

            {/* Fila de Totales Generales */}
            <Fragment>
              {/* Total 2024 */}
              <tr className="bg-slate-900 text-white font-bold border-t-2 border-slate-700 hover:bg-slate-900">
                <td className="px-4 py-3 uppercase bg-slate-950 border-r border-slate-700" rowSpan={2}>
                  Total General
                </td>
                <td className="px-3 py-2.5 text-center border-r border-slate-700/60 text-red-400">
                  2024
                </td>
                {visibleMonths.map(mes => {
                  const mSum = active
                    .filter(r => r.mes === mes && r.anio === 2024)
                    .reduce((sum, r) => sum + r.valor, 0);
                  return (
                    <td key={mes} className="px-3 py-2 text-center border-r border-slate-700/60 tabular-nums bg-slate-950/40">
                      {formatNumber(mSum)}
                    </td>
                  );
                })}
                <td className="px-3 py-2 text-center border-r border-slate-700/60 tabular-nums bg-slate-950">
                  {formatNumber(totalGrand2024)}
                </td>
                <td rowSpan={2} className="px-3 py-2 text-center border-r border-slate-700/60 align-middle bg-slate-950">
                  <span className="inline-flex rounded-full px-2.5 py-1 text-xs font-semibold bg-white/15 text-white">
                    {difGrandTotal > 0 ? '+' : ''}
                    {formatNumber(difGrandTotal)}
                  </span>
                </td>
                <td rowSpan={2} className="px-3 py-2 text-center font-semibold tabular-nums align-middle bg-slate-950 text-white">
                  {porcGrandTotal > 0 ? '+' : ''}
                  {porcGrandTotal}%
                </td>
              </tr>
              {/* Total 2025 */}
              <tr className="bg-slate-900 text-white font-bold hover:bg-slate-900 border-b border-slate-700">
                <td className="px-3 py-2.5 text-center border-r border-slate-700/60 text-slate-300">
                  2025
                </td>
                {visibleMonths.map(mes => {
                  const mSum = active
                    .filter(r => r.mes === mes && r.anio === 2025)
                    .reduce((sum, r) => sum + r.valor, 0);
                  return (
                    <td key={mes} className="px-3 py-2 text-center border-r border-slate-700/60 tabular-nums bg-slate-950/40">
                      {formatNumber(mSum)}
                    </td>
                  );
                })}
                <td className="px-3 py-2 text-center border-r border-slate-700/60 tabular-nums bg-slate-950">
                  {formatNumber(totalGrand2025)}
                </td>
              </tr>
            </Fragment>
          </tbody>
        </table>
      </div>

      {error && (
        <div className="border-t border-rose-100 bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</div>
      )}
    </div>
  );
}
