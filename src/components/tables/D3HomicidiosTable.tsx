'use client';

import { useEffect, useMemo, useState, useTransition } from 'react';
import clsx from 'clsx';
import { Edit2, Save, X } from 'lucide-react';
import { useAppStore } from '@/store';
import {
  buildD3Dashboard,
  replaceD3RawTableRows,
  type D3RawRow,
  type D3RawTable,
  type D3RenderedTable,
  type D3RenderedRow,
} from '@/lib/d3-transform';

interface D3HomicidiosTableProps {
  table: D3RenderedTable;
  rawTables: D3RawTable[];
  color: string;
  labelPeriodoAnterior: string;
  labelPeriodoActual: string;
  badge?: string;
  note?: string;
  onCommit: (sourceTableId: string, nextRows: D3RawRow[]) => Promise<void>;
}

interface GroupedCategory {
  [key: string]: any;
  categoryKey: string;
  label: string;
  isTotal: boolean;
  urc?: D3RenderedRow;
  urn?: D3RenderedRow;
  urs?: D3RenderedRow;
  ure?: D3RenderedRow;
  uro?: D3RenderedRow;
}

export function D3HomicidiosTable({
  table,
  rawTables,
  color,
  labelPeriodoAnterior,
  labelPeriodoActual,
  badge,
  note,
  onCommit,
}: D3HomicidiosTableProps) {
  const { edicionHabilitada } = useAppStore();
  const [editando, setEditando] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [draftRows, setDraftRows] = useState<D3RawRow[]>([]);
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

  // Si estamos editando, recalculamos el dashboard completo al vuelo para previsualizar los totales
  const activeTable = useMemo(() => {
    if (!editando || !table.sourceTableId) {
      return table;
    }
    const preview = buildD3Dashboard(
      replaceD3RawTableRows(rawTables, table.sourceTableId, draftRows)
    );
    return preview.tablesById[table.tableId] ?? table;
  }, [draftRows, editando, rawTables, table]);

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
    if (!table.sourceTableId) return;

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

  // Agrupar filas por categoría (ej. ÁMBITO PÚBLICO, ÁMBITO PRIVADO, etc.)
  const groupedCategories = useMemo(() => {
    const categoriesMap = new Map<string, GroupedCategory>();

    activeTable.rows.forEach(row => {
      // Intentar matchear rowId como 'categoria_urKey' o 'movil_categoria_urKey' o 'totales_urKey'
      const match = row.rowId.match(/^(ambito_[a-z]+|vivienda|encierro|movil_[a-z_]+|totales)_(urc|urn|urs|ure|uro)$/);
      if (match) {
        const categoryKey = match[1];
        const urKey = match[2];

        // Obtener el label de la categoría quitando el sufijo regional
        let categoryLabel = row.label.split(' - ')[0];

        // Normalizar etiqueta totales
        if (categoryKey === 'totales') {
          categoryLabel = 'TOTALES POR REGIONAL';
        }

        if (!categoriesMap.has(categoryKey)) {
          categoriesMap.set(categoryKey, {
            categoryKey,
            label: categoryLabel,
            isTotal: categoryKey === 'totales',
          });
        }

        const category = categoriesMap.get(categoryKey)!;
        category[urKey] = row;
      }
    });

    return Array.from(categoriesMap.values());
  }, [activeTable.rows]);

  const canEdit = edicionHabilitada && activeTable.canEdit && sourceTable;

  // Formateador para los años/períodos del badge del año
  const parseYear = (label: string) => {
    const match = label.match(/\d{4}/);
    return match ? match[0] : label;
  };

  const añoAnterior = parseYear(labelPeriodoAnterior);
  const añoActual = parseYear(labelPeriodoActual);

  return (
    <div className="card overflow-hidden rounded-[26px] border border-slate-200/80 shadow-[0_16px_38px_rgba(15,29,48,0.08)] bg-white">
      {/* Cabecera de la tabla */}
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
      </div>

      {/* Tabla de Datos */}
      <div className="overflow-x-auto">
        <table className="min-w-full border-collapse text-sm text-slate-700">
          <thead>
            <tr className="bg-[#f8f1df] text-slate-700">
              <th className="border-b border-r border-[#e8dcc0] px-4 py-3 text-left font-semibold uppercase tracking-[0.08em]">
                {table.tableId === 'd3-homicidios-ambito' ? 'Ámbito / Situación' : 'Móvil de Crimen'}
              </th>
              <th className="border-b border-r border-[#e8dcc0] px-3 py-3 text-center font-semibold uppercase tracking-[0.08em] w-20">
                Año
              </th>
              <th className="border-b border-r border-[#e8dcc0] px-3 py-3 text-center font-semibold uppercase tracking-[0.08em] w-24">
                URC
              </th>
              <th className="border-b border-r border-[#e8dcc0] px-3 py-3 text-center font-semibold uppercase tracking-[0.08em] w-24">
                URN
              </th>
              <th className="border-b border-r border-[#e8dcc0] px-3 py-3 text-center font-semibold uppercase tracking-[0.08em] w-24">
                URS
              </th>
              <th className="border-b border-r border-[#e8dcc0] px-3 py-3 text-center font-semibold uppercase tracking-[0.08em] w-24">
                URE
              </th>
              <th className="border-b border-r border-[#e8dcc0] px-3 py-3 text-center font-semibold uppercase tracking-[0.08em] w-24">
                URO
              </th>
              <th className="border-b border-[#e8dcc0] px-4 py-3 text-center font-semibold uppercase tracking-[0.08em]">
                Cantidad de Hechos
              </th>
            </tr>
          </thead>
          <tbody>
            {groupedCategories.map(cat => {
              const uList = [cat.urc, cat.urn, cat.urs, cat.ure, cat.uro];

              // Sumas horizontales
              const sumAnterior = uList.reduce((acc, curr) => acc + (curr?.periodoAnterior ?? 0), 0);
              const sumActual = uList.reduce((acc, curr) => acc + (curr?.periodoActual ?? 0), 0);

              const trBgClass = cat.isTotal
                ? 'bg-slate-900 text-white font-bold hover:bg-slate-900 border-t-2 border-slate-700'
                : 'border-b border-slate-100 hover:bg-slate-50/50';

              return (
                <>
                  {/* Fila Período Anterior (2024) */}
                  <tr className={clsx(trBgClass)}>
                    {/* Celda de la Categoría con RowSpan 2 */}
                    <td
                      rowSpan={2}
                      className={clsx(
                        'px-4 py-3 font-semibold uppercase border-r border-slate-200/60 align-middle',
                        cat.isTotal ? 'bg-slate-950 text-white' : 'text-slate-900 bg-slate-50/30'
                      )}
                    >
                      {cat.label}
                    </td>

                    {/* Año anterior */}
                    <td className="px-3 py-2.5 text-center font-semibold border-r border-slate-200/60 text-red-600">
                      {añoAnterior}
                    </td>

                    {/* Valores de las UR para año anterior */}
                    {['urc', 'urn', 'urs', 'ure', 'uro'].map((ur) => {
                      const row = cat[ur] as D3RenderedRow | undefined;
                      const draftRow = draftRows.find(d => d.id === row?.rowId);
                      const value = draftRow ? draftRow.periodoAnterior : (row?.periodoAnterior ?? 0);

                      return (
                        <td key={`${cat.categoryKey}_${ur}_ant`} className="px-3 py-2 border-r border-slate-200/60 text-center font-medium tabular-nums">
                          {editando && row?.editable ? (
                            <input
                              type="number"
                              value={value}
                              onChange={e => handleChange(row.rowId, 'periodoAnterior', e.target.value)}
                              className="w-16 rounded border border-slate-300 px-1 py-0.5 text-center text-slate-900 focus:border-slate-500 outline-none"
                            />
                          ) : (
                            row ? row.periodoAnterior : '-'
                          )}
                        </td>
                      );
                    })}

                    {/* Total horizontal del año anterior */}
                    <td className="px-4 py-2.5 text-center font-bold tabular-nums text-red-600 bg-red-50/30">
                      {sumAnterior}
                    </td>
                  </tr>

                  {/* Fila Período Actual (2025) */}
                  <tr className={clsx(trBgClass)}>
                    {/* Año actual */}
                    <td className="px-3 py-2.5 text-center font-semibold border-r border-slate-200/60 text-slate-900">
                      {añoActual}
                    </td>

                    {/* Valores de las UR para año actual */}
                    {['urc', 'urn', 'urs', 'ure', 'uro'].map((ur) => {
                      const row = cat[ur] as D3RenderedRow | undefined;
                      const draftRow = draftRows.find(d => d.id === row?.rowId);
                      const value = draftRow ? draftRow.periodoActual : (row?.periodoActual ?? 0);

                      return (
                        <td key={`${cat.categoryKey}_${ur}_act`} className="px-3 py-2 border-r border-slate-200/60 text-center font-medium tabular-nums">
                          {editando && row?.editable ? (
                            <input
                              type="number"
                              value={value}
                              onChange={e => handleChange(row.rowId, 'periodoActual', e.target.value)}
                              className="w-16 rounded border border-slate-300 px-1 py-0.5 text-center text-slate-900 focus:border-slate-500 outline-none"
                            />
                          ) : (
                            row ? row.periodoActual : '-'
                          )}
                        </td>
                      );
                    })}

                    {/* Total horizontal del año actual */}
                    <td className="px-4 py-2.5 text-center font-bold tabular-nums text-slate-900 bg-slate-100/30">
                      {sumActual}
                    </td>
                  </tr>
                </>
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
