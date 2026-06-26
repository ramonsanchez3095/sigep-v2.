'use client';

import { useState, useTransition } from 'react';
import clsx from 'clsx';
import { Edit2, Save, X } from 'lucide-react';
import { useAppStore } from '@/store';
import type { DigedropComparisonRow, DigedropTextRow } from '@/lib/digedrop-definition';

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

const DG_GRADIENT = (color: string) =>
  `linear-gradient(135deg, ${color} 0%, ${color}dd 58%, #0f1d30 100%)`;

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
      style={{ background: DG_GRADIENT(color) }}
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
// DigedropComparisonTable – Tabla comparativa con diferencia y porcentaje
// ─────────────────────────────────────────────────────────────────────────────
interface DigedropComparisonTableProps {
  title: string;
  badge?: string;
  color: string;
  rows: DigedropComparisonRow[];
  labelAnterior: string;
  labelActual: string;
  canSave?: boolean;
  onSave?: (rows: DigedropComparisonRow[]) => Promise<void>;
  charColumnName?: string;
}

export function DigedropComparisonTable({
  title, badge, color, rows, labelAnterior, labelActual, canSave, onSave, charColumnName = 'Detalle'
}: DigedropComparisonTableProps) {
  const { edicionHabilitada } = useAppStore();
  const [editando, setEditando] = useState(false);
  const [draft, setDraft] = useState<DigedropComparisonRow[]>(rows);
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
              <th className="px-4 py-2 text-center text-xs font-medium uppercase tracking-[0.08em]">Porcentaje</th>
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
// DigedropDetenidosTable – Tabla sin porcentaje (solo diferencia)
// Para Detenidos y Prevenidos
// ─────────────────────────────────────────────────────────────────────────────
interface DigedropDetenidosTableProps {
  title: string;
  badge?: string;
  color: string;
  rows: DigedropComparisonRow[];
  labelAnterior: string;
  labelActual: string;
  canSave?: boolean;
  onSave?: (rows: DigedropComparisonRow[]) => Promise<void>;
  charColumnName?: string;
}

export function DigedropDetenidosTable({
  title, badge, color, rows, labelAnterior, labelActual, canSave, onSave, charColumnName = 'Detalle'
}: DigedropDetenidosTableProps) {
  const { edicionHabilitada } = useAppStore();
  const [editando, setEditando] = useState(false);
  const [draft, setDraft] = useState<DigedropComparisonRow[]>(rows);
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
              Diferencia
            </div>
            <div className="mt-1 text-xl font-black text-white tabular-nums">
              {difTotal > 0 ? '+' : ''}
              {formatNumber(difTotal)}
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
              <th className="border-b border-slate-200 px-4 py-2 text-center font-semibold uppercase tracking-[0.08em] w-36">
                Diferencia
              </th>
            </tr>
            <tr className="bg-slate-50 text-slate-500">
              <th className="border-r border-slate-200 px-4 py-2 text-center text-xs font-medium uppercase tracking-[0.08em]">{labelAnterior}</th>
              <th className="border-r border-slate-200 px-4 py-2 text-center text-xs font-medium uppercase tracking-[0.08em]">{labelActual}</th>
              <th className="px-4 py-2 text-center text-xs font-medium uppercase tracking-[0.08em]">Diferencia</th>
            </tr>
          </thead>
          <tbody>
            {active.map((row) => {
              const dif = row.periodoActual - row.periodoAnterior;
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
                  <td className="px-4 py-3 text-center">
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
              <td className="px-4 py-3 text-center">
                <span className="inline-flex rounded-full px-2.5 py-1 text-xs font-semibold bg-white/15 text-white">
                  {difTotal > 0 ? '+' : ''}
                  {formatNumber(difTotal)}
                </span>
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
// DigedropTextTable – Tabla de texto libre (Código Aduanero)
// ─────────────────────────────────────────────────────────────────────────────
interface DigedropTextTableProps {
  title: string;
  badge?: string;
  color: string;
  rows: DigedropTextRow[];
  labelAnterior: string;
  labelActual: string;
}

export function DigedropTextTable({
  title, badge, color, rows, labelAnterior, labelActual,
}: DigedropTextTableProps) {
  return (
    <div className="card overflow-hidden rounded-[26px] border border-slate-200/80 shadow-[0_16px_38px_rgba(15,29,48,0.08)] bg-white">
      <TableHeader
        color={color} badge={badge} title={title}
        canEdit={false} editando={false} isPending={false}
        onEdit={() => {}} onSave={() => {}} onCancel={() => {}}
      />

      <div className="overflow-x-auto">
        <table className="min-w-full border-collapse text-sm text-slate-700">
          <thead>
            <tr className="bg-slate-100/80 text-slate-700">
              <th className="border-b border-r border-slate-200 px-4 py-3 text-left font-semibold uppercase tracking-[0.08em]">
                Detalle
              </th>
              <th className="border-b border-r border-slate-200 px-4 py-3 text-center font-semibold uppercase tracking-[0.08em]">
                {labelAnterior}
              </th>
              <th className="border-b border-slate-200 px-4 py-3 text-center font-semibold uppercase tracking-[0.08em]">
                {labelActual}
              </th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.id} className="border-b border-slate-100 hover:bg-slate-50/50">
                <td className="px-4 py-3 font-semibold uppercase border-r border-slate-200/60 text-slate-900 bg-slate-50/30">
                  {row.label}
                </td>
                <td className="px-4 py-3 text-center border-r border-slate-200/60">
                  {row.textoAnterior.split('\n').map((line, i) => (
                    <div key={i} className="font-semibold text-slate-700 whitespace-nowrap">
                      {line}
                    </div>
                  ))}
                </td>
                <td className="px-4 py-3 text-center">
                  {row.textoActual.split('\n').map((line, i) => (
                    <div key={i} className="font-semibold text-slate-700 whitespace-nowrap">
                      {line}
                    </div>
                  ))}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
