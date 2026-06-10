'use client';

import { useState, useTransition, Fragment } from 'react';
import clsx from 'clsx';
import { Edit2, Save, X, ChevronDown } from 'lucide-react';
import { useAppStore } from '@/store';
import type {
  D4ArmamentoRow,
  D4AdquisicionRow,
  D4VehiculoRow,
  D4RastreoMesRow,
  D4Mes,
} from '@/lib/d4-definition';
import { D4_MESES } from '@/lib/d4-definition';

// ─────────────────────────────────────────────────────────────────────────────
// Utilidades compartidas
// ─────────────────────────────────────────────────────────────────────────────

function formatNumber(num: number) {
  return new Intl.NumberFormat('es-AR').format(num);
}

function formatDif(dif: number) {
  return dif > 0 ? `+${formatNumber(dif)}` : `${formatNumber(dif)}`;
}

function formatPct(ant: number, act: number): string {
  if (ant === 0) return act > 0 ? '+100%' : '0%';
  const pct = Math.round(((act - ant) / ant) * 100);
  return `${pct > 0 ? '+' : ''}${pct}%`;
}

const AMBER_GRADIENT = (color: string) =>
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
      style={{ background: AMBER_GRADIENT(color) }}
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
// TABLA 1 – Cantidad Total de Armamento / Proyecciones
// ─────────────────────────────────────────────────────────────────────────────
interface D4ArmamentoTableProps {
  title: string;
  badge?: string;
  color: string;
  rows: D4ArmamentoRow[];
  labelAnterior: string;
  labelActual: string;
  canSave?: boolean;
  onSave?: (rows: D4ArmamentoRow[]) => Promise<void>;
}

export function D4ArmamentoTable({
  title, badge, color, rows, labelAnterior, labelActual, canSave, onSave,
}: D4ArmamentoTableProps) {
  const { edicionHabilitada } = useAppStore();
  const [editando, setEditando] = useState(false);
  const [draft, setDraft] = useState<D4ArmamentoRow[]>(rows);
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

  const parseYear = (label: string) => label.match(/\d{4}/)?.[0] ?? label;
  const añoAnt = parseYear(labelAnterior);
  const añoAct = parseYear(labelActual);

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
              Período Anterior ({añoAnt})
            </div>
            <div className="mt-1 text-xl font-black text-white tabular-nums">
              {formatNumber(totalAnterior)}
            </div>
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/10 px-4 py-3 backdrop-blur-sm">
            <div className="text-[10px] font-semibold uppercase tracking-[0.18em] text-white/70">
              Período Actual ({añoAct})
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
            <tr className="bg-[#f8f1df] text-slate-700">
              <th rowSpan={2} className="border-b border-r border-[#e8dcc0] px-4 py-3 text-left font-semibold uppercase tracking-[0.08em]">
                Características
              </th>
              <th className="border-b border-r border-[#e8dcc0] px-4 py-2 text-center font-semibold uppercase tracking-[0.08em] w-32">
                Período Anterior
              </th>
              <th className="border-b border-r border-[#e8dcc0] px-4 py-2 text-center font-semibold uppercase tracking-[0.08em] w-32">
                Período Actual
              </th>
              <th colSpan={2} className="border-b border-[#e8dcc0] px-4 py-2 text-center font-semibold uppercase tracking-[0.08em] w-56">
                Balance
              </th>
            </tr>
            <tr className="bg-slate-100 text-slate-600">
              <th className="border-r border-slate-200 px-4 py-2 text-center text-xs font-semibold uppercase tracking-[0.08em]">Valor</th>
              <th className="border-r border-slate-200 px-4 py-2 text-center text-xs font-semibold uppercase tracking-[0.08em]">Valor</th>
              <th className="border-r border-slate-200 px-4 py-2 text-center text-xs font-semibold uppercase tracking-[0.08em]">Diferencia</th>
              <th className="px-4 py-2 text-center text-xs font-semibold uppercase tracking-[0.08em]">Variacion</th>
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
// TABLA 3 – Adquisición durante el año (2024 y 2025 side by side)
// ─────────────────────────────────────────────────────────────────────────────
interface D4AdquisicionTableProps {
  color: string;
  rows: D4AdquisicionRow[];
  labelAnterior: string;
  labelActual: string;
  canSave?: boolean;
  onSave?: (rows: D4AdquisicionRow[]) => Promise<void>;
}

export function D4AdquisicionTable({
  color, rows, labelAnterior, labelActual, canSave, onSave,
}: D4AdquisicionTableProps) {
  const { edicionHabilitada } = useAppStore();
  const [editando, setEditando] = useState(false);
  const [draft, setDraft] = useState<D4AdquisicionRow[]>(rows);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const active = editando ? draft : rows;
  const rows2024 = active.filter(r => r.anio === 2024);
  const rows2025 = active.filter(r => r.anio === 2025);

  const handleEdit = () => { setDraft(rows); setEditando(true); };
  const handleCancel = () => { setEditando(false); setError(null); };
  const handleChange = (id: string, field: keyof D4AdquisicionRow, val: string | number) => {
    setDraft(d => d.map(r => r.id === id ? { ...r, [field]: val } : r));
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

  const parseYear = (label: string) => label.match(/\d{4}/)?.[0] ?? label;
  const añoAnt = parseYear(labelAnterior);
  const añoAct = parseYear(labelActual);

  // Totales
  const total2024 = rows2024.reduce((acc, r) => acc + r.cantidad, 0);
  const total2025 = rows2025.reduce((acc, r) => acc + r.cantidad, 0);
  const difTotal = total2025 - total2024;
  const porcTotal = total2024 === 0 ? (total2025 > 0 ? 100 : 0) : Math.round(((total2025 - total2024) / total2024) * 100);

  const cellCls = 'px-4 py-3 text-center border-r border-slate-200/60 tabular-nums';
  const headerCls = 'border-b border-r border-[#e8dcc0] px-4 py-3 text-center font-semibold uppercase tracking-[0.08em]';

  const renderInput = (id: string, field: keyof D4AdquisicionRow, val: string | number, numeric = false) => {
    const draftRow = draft.find(r => r.id === id);
    const displayVal = draftRow ? draftRow[field] : val;
    return editando
      ? <input
          type={numeric ? 'number' : 'text'}
          value={displayVal ?? ''}
          onChange={e => handleChange(id, field, numeric ? Number(e.target.value) : e.target.value)}
          className="w-full min-w-[80px] rounded-lg border border-slate-300 px-2 py-1.5 text-center text-slate-900 focus:border-slate-500 outline-none"
        />
      : <>{numeric ? formatNumber(Number(val)) : val}</>;
  };

  return (
    <div className="card overflow-hidden rounded-[26px] border border-slate-200/80 shadow-[0_16px_38px_rgba(15,29,48,0.08)] bg-white">
      <TableHeader
        color={color}
        badge="Adquisiciones"
        title="Adquisición de Armamento por Año"
        canEdit={canEdit} editando={editando} isPending={isPending}
        onEdit={handleEdit} onSave={handleSave} onCancel={handleCancel}
      >
        <div className="grid gap-3 sm:grid-cols-3">
          <div className="rounded-2xl border border-white/10 bg-white/10 px-4 py-3 backdrop-blur-sm">
            <div className="text-[10px] font-semibold uppercase tracking-[0.18em] text-white/70">
              Total {añoAnt}
            </div>
            <div className="mt-1 text-xl font-black text-white tabular-nums">
              {formatNumber(total2024)}
            </div>
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/10 px-4 py-3 backdrop-blur-sm">
            <div className="text-[10px] font-semibold uppercase tracking-[0.18em] text-white/70">
              Total {añoAct}
            </div>
            <div className="mt-1 text-xl font-black text-white tabular-nums">
              {formatNumber(total2025)}
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
        <div className="grid grid-cols-1 xl:grid-cols-2 divide-y xl:divide-y-0 xl:divide-x divide-slate-200">
          {/* Año 2024 */}
          <div>
            <div className="bg-red-50 border-b border-red-200 px-4 py-2 text-center text-sm font-bold uppercase tracking-wider text-red-700">
              Adquisición durante el año {añoAnt}
            </div>
            <table className="min-w-full border-collapse text-sm text-slate-700">
              <thead>
                <tr className="bg-[#f8f1df] text-slate-700">
                  <th className={headerCls + ' text-left'}>Características</th>
                  <th className={headerCls}>Cantidad</th>
                  <th className="border-b border-[#e8dcc0] px-4 py-3 text-center font-semibold uppercase tracking-[0.08em]">Marca</th>
                </tr>
              </thead>
              <tbody>
                {rows2024.map(row => (
                  <tr key={row.id} className="border-b border-slate-100 hover:bg-slate-50/50">
                    <td className="px-4 py-3 font-semibold uppercase border-r border-slate-200/60 text-slate-900 bg-slate-50/30">
                      {renderInput(row.id, 'caracteristica', row.caracteristica)}
                    </td>
                    <td className={cellCls + ' font-bold text-slate-900'}>
                      {renderInput(row.id, 'cantidad', row.cantidad, true)}
                    </td>
                    <td className="px-4 py-3 text-center tabular-nums">
                      {renderInput(row.id, 'marca', row.marca)}
                    </td>
                  </tr>
                ))}
                {/* Total 2024 */}
                <tr className="bg-slate-900 text-white font-bold hover:bg-slate-900 border-t border-slate-700">
                  <td className="px-4 py-3 uppercase bg-slate-950 border-r border-slate-700">Total</td>
                  <td className="px-4 py-3 text-center border-r border-slate-700 tabular-nums">{formatNumber(total2024)}</td>
                  <td className="px-4 py-3 text-center"></td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Año 2025 */}
          <div>
            <div className="bg-slate-100 border-b border-slate-200 px-4 py-2 text-center text-sm font-bold uppercase tracking-wider text-slate-700">
              Adquisición durante el año {añoAct}
            </div>
            <table className="min-w-full border-collapse text-sm text-slate-700">
              <thead>
                <tr className="bg-[#f8f1df] text-slate-700">
                  <th className={headerCls + ' text-left'}>Características</th>
                  <th className={headerCls}>Cantidad</th>
                  <th className={headerCls}>Marca</th>
                  <th className={headerCls}>OBS</th>
                  <th className="border-b border-[#e8dcc0] px-4 py-3 text-center font-semibold uppercase tracking-[0.08em]">Fecha</th>
                </tr>
              </thead>
              <tbody>
                {rows2025.map(row => (
                  <tr key={row.id} className="border-b border-slate-100 hover:bg-slate-50/50">
                    <td className="px-4 py-3 font-semibold uppercase border-r border-slate-200/60 text-slate-900 bg-slate-50/30">
                      {renderInput(row.id, 'caracteristica', row.caracteristica)}
                    </td>
                    <td className={cellCls + ' font-bold text-slate-900'}>
                      {renderInput(row.id, 'cantidad', row.cantidad, true)}
                    </td>
                    <td className={cellCls}>
                      {renderInput(row.id, 'marca', row.marca)}
                    </td>
                    <td className={cellCls}>
                      {renderInput(row.id, 'obs', row.obs ?? '')}
                    </td>
                    <td className="px-4 py-3 text-center">
                      {renderInput(row.id, 'fecha', row.fecha ?? '')}
                    </td>
                  </tr>
                ))}
                {/* Total 2025 */}
                <tr className="bg-slate-900 text-white font-bold hover:bg-slate-900 border-t border-slate-700">
                  <td className="px-4 py-3 uppercase bg-slate-950 border-r border-slate-700">Total</td>
                  <td className="px-4 py-3 text-center border-r border-slate-700 tabular-nums">{formatNumber(total2025)}</td>
                  <td className="px-4 py-3 text-center border-r border-slate-700"></td>
                  <td className="px-4 py-3 text-center border-r border-slate-700"></td>
                  <td className="px-4 py-3 text-center"></td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
      {error && (
        <div className="border-t border-rose-100 bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// TABLA 4 – Vehículos (con filas 2024/2025 para cada tipo)
// ─────────────────────────────────────────────────────────────────────────────
interface D4VehiculosTableProps {
  title: string;
  badge?: string;
  note?: string;
  color: string;
  rows: D4VehiculoRow[];
  periodoLabel?: string; // e.g. "01/01 al 31/07"
  canSave?: boolean;
  onSave?: (rows: D4VehiculoRow[]) => Promise<void>;
}

export function D4VehiculosTable({
  title, badge, note, color, rows, periodoLabel, canSave, onSave,
}: D4VehiculosTableProps) {
  const { edicionHabilitada } = useAppStore();
  const [editando, setEditando] = useState(false);
  const [draft, setDraft] = useState<D4VehiculoRow[]>(rows);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const active = editando ? draft : rows;

  const handleEdit = () => { setDraft(rows); setEditando(true); };
  const handleCancel = () => { setEditando(false); setError(null); };
  const handleChange = (
    id: string,
    field: 'enServicio2024' | 'fueraServicio2024' | 'enServicio2025' | 'fueraServicio2025',
    val: string
  ) => {
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
  const totalServ2024 = active.reduce((a, r) => a + r.enServicio2024, 0);
  const totalFuera2024 = active.reduce((a, r) => a + r.fueraServicio2024, 0);
  const totalServ2025 = active.reduce((a, r) => a + r.enServicio2025, 0);
  const totalFuera2025 = active.reduce((a, r) => a + r.fueraServicio2025, 0);

  const total2024 = totalServ2024 + totalFuera2024;
  const total2025 = totalServ2025 + totalFuera2025;
  const difTotal = total2025 - total2024;
  const porcTotal = total2024 === 0 ? (total2025 > 0 ? 100 : 0) : Math.round(((total2025 - total2024) / total2024) * 100);

  const renderVal = (row: D4VehiculoRow, field: 'enServicio2024' | 'fueraServicio2024' | 'enServicio2025' | 'fueraServicio2025') => {
    const draftRow = draft.find(r => r.id === row.id);
    const value = draftRow ? draftRow[field] : row[field];
    return editando
      ? <input
          type="number"
          value={value}
          onChange={e => handleChange(row.id, field, e.target.value)}
          className="w-20 rounded-lg border border-slate-300 px-2 py-1.5 text-center text-slate-900 focus:border-slate-500 outline-none"
        />
      : <>{formatNumber(value)}</>;
  };

  const thCls = 'border-b border-r border-[#e8dcc0] px-3 py-3 text-center font-semibold uppercase tracking-[0.06em] text-xs';
  const tdCls = 'px-3 py-2.5 text-center border-r border-slate-200/60 tabular-nums font-medium';

  return (
    <div className="card overflow-hidden rounded-[26px] border border-slate-200/80 shadow-[0_16px_38px_rgba(15,29,48,0.08)] bg-white">
      <TableHeader
        color={color} badge={badge} title={title} note={note}
        canEdit={canEdit} editando={editando} isPending={isPending}
        onEdit={handleEdit} onSave={handleSave} onCancel={handleCancel}
      >
        {periodoLabel && (
          <div className="rounded-xl border border-white/15 bg-white/10 px-4 py-2 text-sm text-white/90 mb-2">
            Período: {periodoLabel}
          </div>
        )}
        <div className="grid gap-3 sm:grid-cols-3">
          <div className="rounded-2xl border border-white/10 bg-white/10 px-4 py-3 backdrop-blur-sm">
            <div className="text-[10px] font-semibold uppercase tracking-[0.18em] text-white/70">
              Total Vehículos 2024
            </div>
            <div className="mt-1 text-xl font-black text-white tabular-nums">
              {formatNumber(total2024)}
            </div>
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/10 px-4 py-3 backdrop-blur-sm">
            <div className="text-[10px] font-semibold uppercase tracking-[0.18em] text-white/70">
              Total Vehículos 2025
            </div>
            <div className="mt-1 text-xl font-black text-white tabular-nums">
              {formatNumber(total2025)}
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
            <tr className="bg-[#f8f1df] text-slate-700">
              <th className={thCls + ' text-left w-[30%]'} rowSpan={2}>Características</th>
              <th className={thCls} rowSpan={2}>Período</th>
              <th colSpan={2} className="border-b border-r border-[#e8dcc0] px-3 py-2 text-center font-semibold uppercase text-xs tracking-wider">
                Estado
              </th>
            </tr>
            <tr className="bg-slate-100 text-slate-600">
              <th className="border-b border-r border-slate-200 px-3 py-2 text-center text-xs font-semibold uppercase tracking-wider">En Servicio</th>
              <th className="border-b border-slate-200 px-3 py-2 text-center text-xs font-semibold uppercase tracking-wider">Fuera de Servicio</th>
            </tr>
          </thead>
          <tbody>
            {active.map(row => (
              <Fragment key={row.id}>
                {/* Fila 2024 */}
                <tr className="border-b border-slate-100 hover:bg-slate-50/50">
                  <td
                    rowSpan={2}
                    className="px-4 py-3 font-semibold uppercase border-r border-slate-200/60 align-middle text-slate-900 bg-slate-50/30"
                  >
                    {row.tipo}
                  </td>
                  <td className="px-3 py-2.5 text-center font-semibold border-r border-slate-200/60 text-red-600">
                    2024
                  </td>
                  <td className={tdCls}>{renderVal(row, 'enServicio2024')}</td>
                  <td className={tdCls + ' border-r-0'}>{renderVal(row, 'fueraServicio2024')}</td>
                </tr>
                {/* Fila 2025 */}
                <tr className="border-b border-slate-100 hover:bg-slate-50/50">
                  <td className="px-3 py-2.5 text-center font-semibold border-r border-slate-200/60 text-slate-900">
                    2025
                  </td>
                  <td className={tdCls}>{renderVal(row, 'enServicio2025')}</td>
                  <td className={tdCls + ' border-r-0'}>{renderVal(row, 'fueraServicio2025')}</td>
                </tr>
              </Fragment>
            ))}
            {/* Totales */}
            <Fragment>
              <tr className="bg-slate-900 text-white font-bold border-t-2 border-slate-700 hover:bg-slate-900">
                <td className="px-4 py-3 uppercase bg-slate-950 border-r border-slate-700" rowSpan={2}>Total de Vehículos</td>
                <td className="px-3 py-2.5 text-center border-r border-slate-700/60 text-red-400">2024</td>
                <td className="px-3 py-2.5 text-center border-r border-slate-700/60 tabular-nums">{formatNumber(totalServ2024)}</td>
                <td className="px-3 py-2.5 text-center tabular-nums">{formatNumber(totalFuera2024)}</td>
              </tr>
              <tr className="bg-slate-900 text-white font-bold hover:bg-slate-900">
                <td className="px-3 py-2.5 text-center border-r border-slate-700/60">2025</td>
                <td className="px-3 py-2.5 text-center border-r border-slate-700/60 tabular-nums">{formatNumber(totalServ2025)}</td>
                <td className="px-3 py-2.5 text-center tabular-nums">{formatNumber(totalFuera2025)}</td>
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

// ─────────────────────────────────────────────────────────────────────────────
// TABLA 5 – Móviles con Sistema de Rastreo (mensual con selector de meses)
// ─────────────────────────────────────────────────────────────────────────────
interface D4RastreoTableProps {
  color: string;
  rows: D4RastreoMesRow[];
  canSave?: boolean;
  onSave?: (rows: D4RastreoMesRow[]) => Promise<void>;
}

const MONTH_NAMES_ES: Record<D4Mes, string> = {
  ENERO: 'Enero', FEBRERO: 'Febrero', MARZO: 'Marzo', ABRIL: 'Abril',
  MAYO: 'Mayo', JUNIO: 'Junio', JULIO: 'Julio', AGOSTO: 'Agosto',
  SEPTIEMBRE: 'Septiembre', OCTUBRE: 'Octubre', NOVIEMBRE: 'Noviembre', DICIEMBRE: 'Diciembre',
};

export function D4RastreoTable({ color, rows, canSave, onSave }: D4RastreoTableProps) {
  const { edicionHabilitada } = useAppStore();
  const [editando, setEditando] = useState(false);
  const [draft, setDraft] = useState<D4RastreoMesRow[]>(rows);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const [selectedMonths, setSelectedMonths] = useState<Set<D4Mes>>(
    new Set(D4_MESES.slice(0, 7)) // Default: first 7 months (Jan-Jul)
  );
  const [showMonthPicker, setShowMonthPicker] = useState(false);

  const active = editando ? draft : rows;
  const visibleMonths = D4_MESES.filter(m => selectedMonths.has(m));

  const handleEdit = () => { setDraft(rows); setEditando(true); };
  const handleCancel = () => { setEditando(false); setError(null); };
  const handleChange = (
    mes: D4Mes, anio: 2024 | 2025,
    field: keyof Omit<D4RastreoMesRow, 'mes' | 'anio'>,
    val: string
  ) => {
    const n = Number(val);
    setDraft(d => d.map(r =>
      r.mes === mes && r.anio === anio
        ? { ...r, [field]: isFinite(n) ? n : 0 }
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

  const toggleMonth = (m: D4Mes) => {
    setSelectedMonths(prev => {
      const next = new Set(prev);
      if (next.has(m)) { if (next.size > 1) next.delete(m); }
      else next.add(m);
      return next;
    });
  };

  const canEdit = edicionHabilitada && Boolean(canSave);

  const fields: Array<{ key: keyof Omit<D4RastreoMesRow, 'mes' | 'anio'>; label: string }> = [
    { key: 'camionetaFurgon', label: 'Camioneta / Furgón' },
    { key: 'motos', label: 'Motos' },
    { key: 'autos', label: 'Autos' },
    { key: 'camion', label: 'Camión' },
    { key: 'totalFacturado', label: 'Total Facturado' },
    { key: 'totalParque', label: 'Total Parque' },
  ];

  const tdBase = 'px-3 py-2 text-center border-r border-slate-200/60 tabular-nums font-medium';

  const getRow = (mes: D4Mes, anio: 2024 | 2025) =>
    active.find(r => r.mes === mes && r.anio === anio);

  const renderCell = (mes: D4Mes, anio: 2024 | 2025, field: keyof Omit<D4RastreoMesRow, 'mes' | 'anio'>) => {
    const row = getRow(mes, anio);
    const val = row?.[field] ?? 0;
    return editando
      ? <input
          type="number"
          value={val}
          onChange={e => handleChange(mes, anio, field, e.target.value)}
          className="w-20 rounded-lg border border-slate-300 px-2 py-1.5 text-center text-slate-900 focus:border-slate-500 outline-none text-xs"
        />
      : <>{formatNumber(val)}</>;
  };

  // Calcs for visible months (for stat cards and total rows)
  const visibleRows2024 = active.filter(r => selectedMonths.has(r.mes) && r.anio === 2024);
  const visibleRows2025 = active.filter(r => selectedMonths.has(r.mes) && r.anio === 2025);

  const totalParque2024 = visibleRows2024.reduce((acc, r) => acc + r.totalParque, 0);
  const totalParque2025 = visibleRows2025.reduce((acc, r) => acc + r.totalParque, 0);
  const porcTotalParque = totalParque2024 === 0 ? (totalParque2025 > 0 ? 100 : 0) : Math.round(((totalParque2025 - totalParque2024) / totalParque2024) * 100);

  // Column-wise sums for totals row
  const sumCamioneta2024 = visibleRows2024.reduce((acc, r) => acc + r.camionetaFurgon, 0);
  const sumMotos2024 = visibleRows2024.reduce((acc, r) => acc + r.motos, 0);
  const sumAutos2024 = visibleRows2024.reduce((acc, r) => acc + r.autos, 0);
  const sumCamion2024 = visibleRows2024.reduce((acc, r) => acc + r.camion, 0);
  const sumFacturado2024 = visibleRows2024.reduce((acc, r) => acc + r.totalFacturado, 0);

  const sumCamioneta2025 = visibleRows2025.reduce((acc, r) => acc + r.camionetaFurgon, 0);
  const sumMotos2025 = visibleRows2025.reduce((acc, r) => acc + r.motos, 0);
  const sumAutos2025 = visibleRows2025.reduce((acc, r) => acc + r.autos, 0);
  const sumCamion2025 = visibleRows2025.reduce((acc, r) => acc + r.camion, 0);
  const sumFacturado2025 = visibleRows2025.reduce((acc, r) => acc + r.totalFacturado, 0);

  return (
    <div className="card overflow-hidden rounded-[26px] border border-slate-200/80 shadow-[0_16px_38px_rgba(15,29,48,0.08)] bg-white">
      <TableHeader
        color={color}
        badge="Rastreo Satelital"
        title="Móviles con Sistema de Rastreo Instalado"
        canEdit={canEdit} editando={editando} isPending={isPending}
        onEdit={handleEdit} onSave={handleSave} onCancel={handleCancel}
      >
        <div className="grid gap-3 sm:grid-cols-3">
          <div className="rounded-2xl border border-white/10 bg-white/10 px-4 py-3 backdrop-blur-sm">
            <div className="text-[10px] font-semibold uppercase tracking-[0.18em] text-white/70">
              Total Parque 2024
            </div>
            <div className="mt-1 text-xl font-black text-white tabular-nums">
              {formatNumber(totalParque2024)}
            </div>
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/10 px-4 py-3 backdrop-blur-sm">
            <div className="text-[10px] font-semibold uppercase tracking-[0.18em] text-white/70">
              Total Parque 2025
            </div>
            <div className="mt-1 text-xl font-black text-white tabular-nums">
              {formatNumber(totalParque2025)}
            </div>
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/10 px-4 py-3 backdrop-blur-sm">
            <div className="text-[10px] font-semibold uppercase tracking-[0.18em] text-white/70">
              Balance Parque
            </div>
            <div className="mt-1 text-xl font-black text-white tabular-nums">
              {porcTotalParque > 0 ? '+' : ''}
              {porcTotalParque}%
            </div>
          </div>
        </div>

        {/* Month selector */}
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
                {D4_MESES.map(m => (
                  <button
                    key={m}
                    onClick={() => toggleMonth(m)}
                    className={clsx(
                      'rounded-lg px-3 py-1.5 text-xs font-semibold uppercase transition',
                      selectedMonths.has(m)
                        ? 'bg-amber-500 text-white shadow-sm'
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
            <tr className="bg-[#f8f1df] text-slate-700">
              <th className="border-b border-r border-[#e8dcc0] px-4 py-3 text-left font-semibold uppercase tracking-[0.08em]" rowSpan={2}>
                Mes
              </th>
              <th className="border-b border-r border-[#e8dcc0] px-3 py-3 text-center font-semibold uppercase tracking-[0.08em] w-16" rowSpan={2}>
                Período
              </th>
              <th className="border-b border-r border-[#e8dcc0] px-3 py-2 text-center font-semibold uppercase tracking-[0.07em] text-xs" colSpan={4}>
                Móviles por Categoría
              </th>
              <th className="border-b border-[#e8dcc0] px-3 py-2 text-center font-semibold uppercase tracking-[0.07em] text-xs" colSpan={2}>
                Consolidados
              </th>
            </tr>
            <tr className="bg-slate-100 text-slate-600 text-xs">
              <th className="border-b border-r border-slate-200 px-3 py-2 text-center font-semibold uppercase">Camioneta / Furgón</th>
              <th className="border-b border-r border-slate-200 px-3 py-2 text-center font-semibold uppercase">Motos</th>
              <th className="border-b border-r border-slate-200 px-3 py-2 text-center font-semibold uppercase">Autos</th>
              <th className="border-b border-r border-slate-200 px-3 py-2 text-center font-semibold uppercase">Camión</th>
              <th className="border-b border-r border-slate-200 px-3 py-2 text-center font-semibold uppercase">Total Facturado</th>
              <th className="border-b border-slate-200 px-3 py-2 text-center font-semibold uppercase">Total Parque</th>
            </tr>
          </thead>
          <tbody>
            {visibleMonths.map(mes => (
              <Fragment key={mes}>
                {/* Row 2024 */}
                <tr className="border-b border-slate-100 hover:bg-slate-50/50">
                  <td
                    rowSpan={2}
                    className="px-4 py-3 font-semibold uppercase border-r border-slate-200/60 align-middle text-slate-900 bg-slate-50/30"
                  >
                    {MONTH_NAMES_ES[mes]}
                  </td>
                  <td className="px-3 py-2.5 text-center font-semibold border-r border-slate-200/60 text-red-600">
                    2024
                  </td>
                  {fields.map(f => (
                    <td key={f.key} className={clsx(
                      tdBase,
                      f.key === 'totalFacturado' || f.key === 'totalParque' ? 'font-bold text-slate-900 bg-slate-50/50' : ''
                    )}>
                      {renderCell(mes, 2024, f.key)}
                    </td>
                  ))}
                </tr>
                {/* Row 2025 */}
                <tr className="border-b border-slate-200 hover:bg-slate-50/50">
                  <td className="px-3 py-2.5 text-center font-semibold border-r border-slate-200/60 text-slate-900">
                    2025
                  </td>
                  {fields.map(f => (
                    <td key={f.key} className={clsx(
                      tdBase,
                      f.key === 'totalFacturado' || f.key === 'totalParque' ? 'font-bold text-slate-900 bg-slate-50/50' : ''
                    )}>
                      {renderCell(mes, 2025, f.key)}
                    </td>
                  ))}
                </tr>
              </Fragment>
            ))}

            {/* Fila de Totales */}
            <Fragment>
              <tr className="bg-slate-900 text-white font-bold border-t-2 border-slate-700 hover:bg-slate-900">
                <td className="px-4 py-3 uppercase bg-slate-950 border-r border-slate-700" rowSpan={2}>Total Parque</td>
                <td className="px-3 py-2.5 text-center border-r border-slate-700/60 text-red-400">2024</td>
                <td className="px-3 py-2.5 text-center border-r border-slate-700/60 tabular-nums">{formatNumber(sumCamioneta2024)}</td>
                <td className="px-3 py-2.5 text-center border-r border-slate-700/60 tabular-nums">{formatNumber(sumMotos2024)}</td>
                <td className="px-3 py-2.5 text-center border-r border-slate-700/60 tabular-nums">{formatNumber(sumAutos2024)}</td>
                <td className="px-3 py-2.5 text-center border-r border-slate-700/60 tabular-nums">{formatNumber(sumCamion2024)}</td>
                <td className="px-3 py-2.5 text-center border-r border-slate-700/60 tabular-nums bg-slate-950">{formatNumber(sumFacturado2024)}</td>
                <td className="px-3 py-2.5 text-center tabular-nums bg-slate-950">{formatNumber(totalParque2024)}</td>
              </tr>
              <tr className="bg-slate-900 text-white font-bold hover:bg-slate-900">
                <td className="px-3 py-2.5 text-center border-r border-slate-700/60">2025</td>
                <td className="px-3 py-2.5 text-center border-r border-slate-700/60 tabular-nums">{formatNumber(sumCamioneta2025)}</td>
                <td className="px-3 py-2.5 text-center border-r border-slate-700/60 tabular-nums">{formatNumber(sumMotos2025)}</td>
                <td className="px-3 py-2.5 text-center border-r border-slate-700/60 tabular-nums">{formatNumber(sumAutos2025)}</td>
                <td className="px-3 py-2.5 text-center border-r border-slate-700/60 tabular-nums">{formatNumber(sumCamion2025)}</td>
                <td className="px-3 py-2.5 text-center border-r border-slate-700/60 tabular-nums bg-slate-950">{formatNumber(sumFacturado2025)}</td>
                <td className="px-3 py-2.5 text-center tabular-nums bg-slate-950">{formatNumber(totalParque2025)}</td>
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
