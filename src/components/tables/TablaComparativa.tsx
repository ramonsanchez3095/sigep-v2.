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
    // Notificar al padre para actualizar gráficos reactivamente
    onDataChange?.(tablaId, filasEditadas);

    // Persistir en el servidor via Server Action
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

  return (
    <div className={clsx('card overflow-hidden', className)}>
      <div
        className="px-6 py-4 text-white flex items-center justify-between"
        style={{ backgroundColor: color }}
      >
        <h3 className="font-semibold text-lg">{titulo}</h3>
        {edicionHabilitada && (
          <div className="flex items-center gap-2">
            {editando ? (
              <>
                <button
                  onClick={handleSave}
                  className="p-2 rounded-lg bg-white/20 hover:bg-white/30 transition-colors"
                  title="Guardar"
                >
                  <Save size={18} />
                </button>
                <button
                  onClick={handleCancel}
                  className="p-2 rounded-lg bg-white/20 hover:bg-white/30 transition-colors"
                  title="Cancelar"
                >
                  <X size={18} />
                </button>
              </>
            ) : (
              <button
                onClick={handleEdit}
                className="p-2 rounded-lg bg-white/20 hover:bg-white/30 transition-colors"
                title="Editar"
              >
                <Edit2 size={18} />
              </button>
            )}
          </div>
        )}
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="table-header">
              <th className="table-cell text-left">Detalle</th>
              <th className="table-cell text-center">{labelPeriodoAnterior}</th>
              <th className="table-cell text-center">{labelPeriodoActual}</th>
              <th className="table-cell text-center">Diferencia</th>
              <th className="table-cell text-center">Porcentaje</th>
            </tr>
          </thead>
          <tbody>
            {filasRender.map(fila => {
              const diferencia = calcDiferencia(
                fila.periodoAnterior,
                fila.periodoActual
              );
              const porcentaje = calcPorcentaje(
                fila.periodoAnterior,
                fila.periodoActual
              );
              return (
                <tr
                  key={fila.id}
                  className="hover:bg-gray-50 transition-colors"
                >
                  <td className="table-cell font-medium text-gray-700">
                    {fila.label}
                  </td>
                  <td className="table-cell text-center">
                    {editando && fila.editable !== false ? (
                      <input
                        type="number"
                        value={fila.periodoAnterior}
                        onChange={e =>
                          handleChange(
                            fila.id,
                            'periodoAnterior',
                            e.target.value
                          )
                        }
                        className="w-24 px-2 py-1 border rounded text-center"
                      />
                    ) : (
                      formatNumber(fila.periodoAnterior)
                    )}
                  </td>
                  <td className="table-cell text-center">
                    {editando && fila.editable !== false ? (
                      <input
                        type="number"
                        value={fila.periodoActual}
                        onChange={e =>
                          handleChange(fila.id, 'periodoActual', e.target.value)
                        }
                        className="w-24 px-2 py-1 border rounded text-center"
                      />
                    ) : (
                      formatNumber(fila.periodoActual)
                    )}
                  </td>
                  <td className="table-cell text-center">
                    <span
                      className={clsx(
                        'px-2 py-1 rounded-full text-sm font-medium',
                        diferencia > 0 && 'bg-green-100 text-green-700',
                        diferencia < 0 && 'bg-red-100 text-red-700',
                        diferencia === 0 && 'bg-gray-100 text-gray-600'
                      )}
                    >
                      {diferencia > 0 ? '+' : ''}
                      {formatNumber(diferencia)}
                    </span>
                  </td>
                  <td className="table-cell text-center">
                    <div className="flex items-center justify-center gap-1">
                      {porcentaje > 0 && (
                        <TrendingUp size={16} className="text-green-600" />
                      )}
                      {porcentaje < 0 && (
                        <TrendingDown size={16} className="text-red-600" />
                      )}
                      {porcentaje === 0 && (
                        <Minus size={16} className="text-gray-400" />
                      )}
                      <span
                        className={clsx(
                          'font-medium',
                          porcentaje > 0 && 'text-green-600',
                          porcentaje < 0 && 'text-red-600',
                          porcentaje === 0 && 'text-gray-500'
                        )}
                      >
                        {porcentaje > 0 ? '+' : ''}
                        {porcentaje}%
                      </span>
                    </div>
                  </td>
                </tr>
              );
            })}
            {mostrarTotal && (
              <tr className="bg-gray-100 font-bold">
                <td className="table-cell">TOTAL</td>
                <td className="table-cell text-center">
                  {formatNumber(totalAnterior)}
                </td>
                <td className="table-cell text-center">
                  {formatNumber(totalActual)}
                </td>
                <td className="table-cell text-center">
                  <span
                    className={clsx(
                      'px-2 py-1 rounded-full text-sm',
                      totalActual - totalAnterior > 0 &&
                        'bg-green-200 text-green-800',
                      totalActual - totalAnterior < 0 &&
                        'bg-red-200 text-red-800',
                      totalActual - totalAnterior === 0 &&
                        'bg-gray-200 text-gray-700'
                    )}
                  >
                    {totalActual - totalAnterior > 0 ? '+' : ''}
                    {formatNumber(totalActual - totalAnterior)}
                  </span>
                </td>
                <td className="table-cell text-center">
                  <span
                    className={clsx(
                      'font-bold',
                      calcPorcentaje(totalAnterior, totalActual) > 0 &&
                        'text-green-600',
                      calcPorcentaje(totalAnterior, totalActual) < 0 &&
                        'text-red-600'
                    )}
                  >
                    {calcPorcentaje(totalAnterior, totalActual) > 0 ? '+' : ''}
                    {calcPorcentaje(totalAnterior, totalActual)}%
                  </span>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
