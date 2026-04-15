'use client';

import { useState, useCallback } from 'react';
import { TrendingUp, TrendingDown, Minus, Edit2, Save, X } from 'lucide-react';
import clsx from 'clsx';
import { useAppStore } from '@/store';

export interface FilaComparativa {
  id: string;
  label: string;
  periodoAnterior: number;
  periodoActual: number;
  editable?: boolean;
}

interface TablaComparativaProps {
  titulo: string;
  tablaId: string;
  tablaConfigId: string;
  departamento: string;
  color?: string;
  labelPeriodoAnterior?: string;
  labelPeriodoActual?: string;
  filas: FilaComparativa[];
  mostrarTotal?: boolean;
  formatoNumero?: 'entero' | 'decimal' | 'porcentaje' | 'moneda';
  className?: string;
  /** Callback que se dispara cuando los datos cambian (guardar o editar) */
  onDataChange?: (tablaId: string, filas: FilaComparativa[]) => void;
}

export function TablaComparativa({
  titulo,
  tablaId,
  tablaConfigId,
  departamento,
  color = '#1e3a5f',
  labelPeriodoAnterior = 'Período anterior',
  labelPeriodoActual = 'Período actual',
  filas: filasIniciales,
  mostrarTotal = true,
  formatoNumero = 'entero',
  className,
  onDataChange,
}: TablaComparativaProps) {
  const { edicionHabilitada } = useAppStore();
  const [filas, setFilas] = useState<FilaComparativa[]>(filasIniciales);
  const [editando, setEditando] = useState(false);
  const [filasEditadas, setFilasEditadas] =
    useState<FilaComparativa[]>(filasIniciales);

  const formatNumber = (num: number) => {
    switch (formatoNumero) {
      case 'decimal':
        return num.toFixed(2);
      case 'porcentaje':
        return `${num.toFixed(2)}%`;
      case 'moneda':
        return new Intl.NumberFormat('es-AR', {
          style: 'currency',
          currency: 'ARS',
          maximumFractionDigits: 0,
        }).format(num);
      default:
        return new Intl.NumberFormat('es-AR').format(num);
    }
  };

  const calcDiferencia = (anterior: number, actual: number) =>
    actual - anterior;
  const calcPorcentaje = (anterior: number, actual: number) => {
    if (anterior === 0) return actual > 0 ? 100 : 0;
    return Math.round(((actual - anterior) / anterior) * 100);
  };
  const calcTotal = (campo: 'periodoAnterior' | 'periodoActual') =>
    filas.reduce((acc, f) => acc + f[campo], 0);

  const handleEdit = () => {
    setFilasEditadas([...filas]);
    setEditando(true);
  };

  const handleSave = useCallback(async () => {
    setFilas(filasEditadas);
    setEditando(false);
    onDataChange?.(tablaId, filasEditadas);

    try {
      const { guardarDatosComparativos } = await import('@/actions/datos');
      await guardarDatosComparativos(
        tablaConfigId,
        filasEditadas.map(f => ({
          filaId: f.id,
          label: f.label,
          periodoAnterior: String(f.periodoAnterior),
          periodoActual: String(f.periodoActual),
        }))
      );
    } catch (err) {
      console.error('Error guardando datos:', err);
    }
  }, [filasEditadas, tablaId, tablaConfigId, onDataChange]);

  const handleCancel = () => {
    setFilasEditadas(filas);
    setEditando(false);
  };

  const handleChange = (
    id: string,
    campo: 'periodoAnterior' | 'periodoActual',
    valor: string
  ) => {
    const numValue = parseFloat(valor) || 0;
    setFilasEditadas(prev =>
      prev.map(f => (f.id === id ? { ...f, [campo]: numValue } : f))
    );
  };

  const filasRender = editando ? filasEditadas : filas;
  const totalAnterior = calcTotal('periodoAnterior');
  const totalActual = calcTotal('periodoActual');
  const difTotal = totalActual - totalAnterior;
  const porcTotal = calcPorcentaje(totalAnterior, totalActual);

  return (
    <div className={clsx('card overflow-hidden rounded-[26px] border border-slate-200/80 shadow-[0_16px_38px_rgba(15,29,48,0.08)]', className)}>
      <div
        className="flex flex-col gap-4 px-5 py-5 text-white"
        style={{
          background: `linear-gradient(135deg, ${color} 0%, ${color}dd 58%, #0f1d30 100%)`,
        }}
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <h3 className="text-base font-semibold uppercase tracking-[0.08em]">
              {titulo}
            </h3>
          </div>

          {edicionHabilitada && (
            <div className="flex items-center gap-2">
              {editando ? (
                <>
                  <button
                    onClick={handleSave}
                    className="rounded-lg bg-white/15 p-2 transition hover:bg-white/25"
                    title="Guardar"
                  >
                    <Save size={18} />
                  </button>
                  <button
                    onClick={handleCancel}
                    className="rounded-lg bg-white/15 p-2 transition hover:bg-white/25"
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
          )}
        </div>

        {mostrarTotal && (
          <div className="grid gap-3 sm:grid-cols-3">
            <div className="rounded-2xl border border-white/10 bg-white/10 px-4 py-3 backdrop-blur-sm">
              <div className="text-[10px] font-semibold uppercase tracking-[0.18em] text-white/70">
                {labelPeriodoAnterior}
              </div>
              <div className="mt-1 text-xl font-black text-white tabular-nums">
                {formatNumber(totalAnterior)}
              </div>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/10 px-4 py-3 backdrop-blur-sm">
              <div className="text-[10px] font-semibold uppercase tracking-[0.18em] text-white/70">
                {labelPeriodoActual}
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
        )}
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full border-collapse text-sm text-slate-700">
          <thead>
            <tr className="bg-[#f8f1df] text-slate-700">
              <th rowSpan={2} className="w-[38%] border-b border-r border-[#e8dcc0] px-4 py-3 text-left font-semibold uppercase tracking-[0.08em]">
                Detalle
              </th>
              <th className="border-b border-r border-[#e8dcc0] px-4 py-2 text-center font-semibold uppercase tracking-[0.08em]">
                {labelPeriodoAnterior}
              </th>
              <th className="border-b border-r border-[#e8dcc0] px-4 py-2 text-center font-semibold uppercase tracking-[0.08em]">
                {labelPeriodoActual}
              </th>
              <th colSpan={2} className="border-b border-[#e8dcc0] px-4 py-2 text-center font-semibold uppercase tracking-[0.08em]">
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
            {filasRender.map(fila => {
              const diferencia = calcDiferencia(fila.periodoAnterior, fila.periodoActual);
              const porcentaje = calcPorcentaje(fila.periodoAnterior, fila.periodoActual);
              return (
                <tr key={fila.id} className="border-t border-slate-100 transition-colors hover:bg-slate-50/70">
                  <td className="px-4 py-3 font-medium uppercase tracking-[0.03em]">{fila.label}</td>
                  <td className="px-4 py-3 text-center font-semibold tabular-nums">
                    {editando && fila.editable !== false ? (
                      <input
                        type="number"
                        value={fila.periodoAnterior}
                        onChange={e => handleChange(fila.id, 'periodoAnterior', e.target.value)}
                        className="w-24 rounded-lg border border-slate-300 px-2 py-1.5 text-center text-slate-900 outline-none focus:border-slate-500 sm:w-28"
                      />
                    ) : (
                      formatNumber(fila.periodoAnterior)
                    )}
                  </td>
                  <td className="px-4 py-3 text-center font-semibold tabular-nums">
                    {editando && fila.editable !== false ? (
                      <input
                        type="number"
                        value={fila.periodoActual}
                        onChange={e => handleChange(fila.id, 'periodoActual', e.target.value)}
                        className="w-24 rounded-lg border border-slate-300 px-2 py-1.5 text-center text-slate-900 outline-none focus:border-slate-500 sm:w-28"
                      />
                    ) : (
                      formatNumber(fila.periodoActual)
                    )}
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span
                      className={clsx(
                        'inline-flex rounded-full px-2.5 py-1 text-xs font-semibold',
                        diferencia > 0 ? 'bg-emerald-100 text-emerald-700' :
                        diferencia < 0 ? 'bg-rose-100 text-rose-700' : 'bg-slate-200 text-slate-600'
                      )}
                    >
                      {diferencia > 0 ? '+' : ''}
                      {formatNumber(diferencia)}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-center font-semibold tabular-nums">
                    {porcentaje > 0 ? '+' : ''}
                    {porcentaje}%
                  </td>
                </tr>
              );
            })}
            
            {mostrarTotal && (
              <tr className="bg-slate-900 text-white hover:bg-slate-900">
                <td className="px-4 py-3 font-medium uppercase tracking-[0.03em]">TOTAL</td>
                <td className="px-4 py-3 text-center font-semibold tabular-nums">{formatNumber(totalAnterior)}</td>
                <td className="px-4 py-3 text-center font-semibold tabular-nums">{formatNumber(totalActual)}</td>
                <td className="px-4 py-3 text-center">
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
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
