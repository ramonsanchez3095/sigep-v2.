'use client';

import { useEffect, useMemo, useState, useTransition } from 'react';
import clsx from 'clsx';
import { Edit2, Save, X } from 'lucide-react';
import { useAppStore } from '@/store';
import {
  buildD1Dashboard,
  replaceD1RawTableRows,
  type D1RawRow,
  type D1RawTable,
  type D1RenderedTable,
} from '@/lib/d1-transform';

interface D1AdvancedTableProps {
  table: D1RenderedTable;
  rawTables: D1RawTable[];
  color: string;
  labelPeriodoAnterior: string;
  labelPeriodoActual: string;
  badge?: string;
  note?: string;
  onCommit: (sourceTableId: string, nextRows: D1RawRow[]) => Promise<void>;
}

function formatNumber(value: number, format: 'integer' | 'decimal') {
  return new Intl.NumberFormat('es-AR', {
    minimumFractionDigits: format === 'decimal' ? 2 : 0,
    maximumFractionDigits: format === 'decimal' ? 2 : 0,
  }).format(value);
}

function formatShare(value?: number) {
  if (value == null) {
    return '-';
  }

  return `${value.toFixed(1)}%`;
}

export function D1AdvancedTable({
  table,
  rawTables,
  color,
  labelPeriodoAnterior,
  labelPeriodoActual,
  badge,
  note,
  onCommit,
}: D1AdvancedTableProps) {
  const { edicionHabilitada } = useAppStore();
  const [editando, setEditando] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [draftRows, setDraftRows] = useState<D1RawRow[]>([]);
  const [isPending, startTransition] = useTransition();

  const sourceTable = useMemo(
    () => rawTables.find(candidate => candidate.tablaId === table.sourceTableId),
    [rawTables, table.sourceTableId]
  );

  useEffect(() => {
    if (!editando) {
      setDraftRows(sourceTable?.datos ?? []);
      setError(null);
    }
  }, [editando, sourceTable]);

  const activeTable = useMemo(() => {
    if (!editando || !table.sourceTableId) {
      return table;
    }

    const preview = buildD1Dashboard(
      replaceD1RawTableRows(rawTables, table.sourceTableId, draftRows)
    );

    return preview.tablesById[table.tableId] ?? table;
  }, [draftRows, editando, rawTables, table]);

  const draftMap = useMemo(
    () => new Map(draftRows.map(row => [row.id, row])),
    [draftRows]
  );

  const handleEdit = () => {
    setDraftRows(sourceTable?.datos ?? []);
    setEditando(true);
  };

  const handleCancel = () => {
    setEditando(false);
  };

  const handleChange = (
    rowId: string,
    field: 'periodoAnterior' | 'periodoActual',
    nextValue: string
  ) => {
    const numericValue = Number(nextValue);

    setDraftRows(current =>
      current.map(row =>
        row.id === rowId
          ? {
              ...row,
              [field]: Number.isFinite(numericValue) ? numericValue : 0,
            }
          : row
      )
    );
  };

  const handleSave = () => {
    if (!table.sourceTableId) {
      return;
    }

    startTransition(async () => {
      try {
        setError(null);
        await onCommit(table.sourceTableId!, draftRows);
        setEditando(false);
      } catch {
        setError('No se pudo guardar esta tabla.');
      }
    });
  };

  const showShareColumns = activeTable.variant === 'comparison-share';
  const canEdit = edicionHabilitada && activeTable.canEdit && sourceTable;
  const summaryRow = useMemo(() => {
    for (let index = activeTable.rows.length - 1; index >= 0; index -= 1) {
      if (activeTable.rows[index].emphasis !== 'normal') {
        return activeTable.rows[index];
      }
    }

    return activeTable.rows[activeTable.rows.length - 1] ?? null;
  }, [activeTable.rows]);

  return (
    <div className="card overflow-hidden rounded-[26px] border border-slate-200/80 shadow-[0_16px_38px_rgba(15,29,48,0.08)]">
      <div
        className="flex flex-col gap-4 px-5 py-5 text-white"
        style={{
          background: `linear-gradient(135deg, ${color} 0%, ${color}dd 58%, #0f1d30 100%)`,
        }}
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            {badge ? (
              <span className="inline-flex rounded-full border border-white/20 bg-white/10 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.22em] text-white/85 backdrop-blur-sm">
                {badge}
              </span>
            ) : null}
            <h3 className="mt-3 text-base font-semibold uppercase tracking-[0.08em]">
              {activeTable.title}
            </h3>
            {activeTable.description ? (
              <p className="mt-1 text-sm text-white/80">{activeTable.description}</p>
            ) : null}
            {note ? <p className="mt-2 text-sm text-white/75">{note}</p> : null}
          </div>

          {canEdit ? (
            <div className="flex items-center gap-2">
              {editando ? (
                <>
                  <button
                    onClick={handleSave}
                    disabled={isPending}
                    className="rounded-lg bg-white/15 p-2 transition hover:bg-white/25 disabled:cursor-not-allowed disabled:opacity-60"
                    title="Guardar"
                  >
                    <Save size={18} />
                  </button>
                  <button
                    onClick={handleCancel}
                    disabled={isPending}
                    className="rounded-lg bg-white/15 p-2 transition hover:bg-white/25 disabled:cursor-not-allowed disabled:opacity-60"
                    title="Cancelar"
                  >
                    <X size={18} />
                  </button>
                </>
              ) : (
                <button
                  onClick={handleEdit}
                  className="rounded-lg bg-white/15 p-2 transition hover:bg-white/25"
                  title="Editar"
                >
                  <Edit2 size={18} />
                </button>
              )}
            </div>
          ) : null}
        </div>

        {summaryRow ? (
          <div className="grid gap-3 sm:grid-cols-3">
            <div className="rounded-2xl border border-white/10 bg-white/10 px-4 py-3 backdrop-blur-sm">
              <div className="text-[10px] font-semibold uppercase tracking-[0.18em] text-white/70">
                {labelPeriodoAnterior}
              </div>
              <div className="mt-1 text-xl font-black text-white tabular-nums">
                {formatNumber(summaryRow.periodoAnterior, summaryRow.format)}
              </div>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/10 px-4 py-3 backdrop-blur-sm">
              <div className="text-[10px] font-semibold uppercase tracking-[0.18em] text-white/70">
                {labelPeriodoActual}
              </div>
              <div className="mt-1 text-xl font-black text-white tabular-nums">
                {formatNumber(summaryRow.periodoActual, summaryRow.format)}
              </div>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/10 px-4 py-3 backdrop-blur-sm">
              <div className="text-[10px] font-semibold uppercase tracking-[0.18em] text-white/70">
                Balance
              </div>
              <div className="mt-1 text-xl font-black text-white tabular-nums">
                {summaryRow.variacion > 0 ? '+' : ''}
                {summaryRow.variacion.toFixed(1)}%
              </div>
            </div>
          </div>
        ) : null}
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full border-collapse text-sm text-slate-700">
          <thead>
            <tr className="bg-[#f8f1df] text-slate-700">
              <th
                rowSpan={2}
                className="w-[38%] border-b border-r border-[#e8dcc0] px-4 py-3 text-left font-semibold uppercase tracking-[0.08em]"
              >
                Detalle
              </th>
              <th
                colSpan={showShareColumns ? 2 : 1}
                className="border-b border-r border-[#e8dcc0] px-4 py-2 text-center font-semibold uppercase tracking-[0.08em]"
              >
                {labelPeriodoAnterior}
              </th>
              <th
                colSpan={showShareColumns ? 2 : 1}
                className="border-b border-r border-[#e8dcc0] px-4 py-2 text-center font-semibold uppercase tracking-[0.08em]"
              >
                {labelPeriodoActual}
              </th>
              <th
                colSpan={2}
                className="border-b border-[#e8dcc0] px-4 py-2 text-center font-semibold uppercase tracking-[0.08em]"
              >
                Balance
              </th>
            </tr>
            <tr className="bg-slate-100 text-slate-600">
              <th className="border-r border-slate-200 px-4 py-2 text-center text-xs font-semibold uppercase tracking-[0.08em]">
                Valor
              </th>
              {showShareColumns ? (
                <th className="border-r border-slate-200 px-4 py-2 text-center text-xs font-semibold uppercase tracking-[0.08em]">
                  {activeTable.shareLabel ?? '%'}
                </th>
              ) : null}
              <th className="border-r border-slate-200 px-4 py-2 text-center text-xs font-semibold uppercase tracking-[0.08em]">
                Valor
              </th>
              {showShareColumns ? (
                <th className="border-r border-slate-200 px-4 py-2 text-center text-xs font-semibold uppercase tracking-[0.08em]">
                  {activeTable.shareLabel ?? '%'}
                </th>
              ) : null}
              <th className="border-r border-slate-200 px-4 py-2 text-center text-xs font-semibold uppercase tracking-[0.08em]">
                Diferencia
              </th>
              <th className="px-4 py-2 text-center text-xs font-semibold uppercase tracking-[0.08em]">
                Variacion
              </th>
            </tr>
          </thead>
          <tbody>
            {activeTable.rows.map(row => {
              const draftRow = draftMap.get(row.rowId);
              const currentAnterior = draftRow?.periodoAnterior ?? row.periodoAnterior;
              const currentActual = draftRow?.periodoActual ?? row.periodoActual;

              return (
                <tr
                  key={row.rowId}
                  className={clsx(
                    'border-t border-slate-100 transition-colors hover:bg-slate-50/70',
                    row.emphasis === 'subtotal' && 'bg-[#fcf5e3] font-semibold text-[#5c4a1d]',
                    row.emphasis === 'total' && 'bg-slate-900 text-white hover:bg-slate-900'
                  )}
                >
                  <td className="px-4 py-3 font-medium uppercase tracking-[0.03em]">{row.label}</td>
                  <td className="px-4 py-3 text-center font-semibold tabular-nums">
                    {editando && row.editable ? (
                      <input
                        type="number"
                        inputMode="decimal"
                        value={currentAnterior}
                        onChange={event =>
                          handleChange(row.rowId, 'periodoAnterior', event.target.value)
                        }
                        className="w-24 rounded-lg border border-slate-300 px-2 py-1.5 text-center text-slate-900 outline-none focus:border-slate-500 sm:w-28"
                      />
                    ) : (
                      formatNumber(row.periodoAnterior, row.format)
                    )}
                  </td>
                  {showShareColumns ? (
                    <td className="px-4 py-3 text-center font-semibold tabular-nums text-slate-500">
                      {formatShare(row.shareAnterior)}
                    </td>
                  ) : null}
                  <td className="px-4 py-3 text-center font-semibold tabular-nums">
                    {editando && row.editable ? (
                      <input
                        type="number"
                        inputMode="decimal"
                        value={currentActual}
                        onChange={event =>
                          handleChange(row.rowId, 'periodoActual', event.target.value)
                        }
                        className="w-24 rounded-lg border border-slate-300 px-2 py-1.5 text-center text-slate-900 outline-none focus:border-slate-500 sm:w-28"
                      />
                    ) : (
                      formatNumber(row.periodoActual, row.format)
                    )}
                  </td>
                  {showShareColumns ? (
                    <td className="px-4 py-3 text-center font-semibold tabular-nums text-slate-500">
                      {formatShare(row.shareActual)}
                    </td>
                  ) : null}
                  <td className="px-4 py-3 text-center">
                    <span
                      className={clsx(
                        'inline-flex rounded-full px-2.5 py-1 text-xs font-semibold',
                        row.emphasis === 'total'
                          ? 'bg-white/15 text-white'
                          : row.diferencia > 0
                            ? 'bg-emerald-100 text-emerald-700'
                            : row.diferencia < 0
                              ? 'bg-rose-100 text-rose-700'
                              : 'bg-slate-200 text-slate-600'
                      )}
                    >
                      {row.diferencia > 0 ? '+' : ''}
                      {formatNumber(row.diferencia, row.format)}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-center font-semibold tabular-nums">
                    {row.variacion > 0 ? '+' : ''}
                    {row.variacion.toFixed(1)}%
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {error ? (
        <div className="border-t border-rose-100 bg-rose-50 px-4 py-3 text-sm text-rose-700">
          {error}
        </div>
      ) : null}
    </div>
  );
}