'use client';

import { useState, useCallback, useEffect } from 'react';
import { Edit2, Save, X, Activity, Scale } from 'lucide-react';
import clsx from 'clsx';
import { useAppStore } from '@/store';
import type { FilaComparativa } from './TablaComparativa';

interface D3HomicidiosTableProps {
  titulo: string;
  tablaId: string;
  tablaConfigId: string;
  color?: string;
  labelPeriodoAnterior?: string;
  labelPeriodoActual?: string;
  filas: FilaComparativa[];
  onDataChange?: (tablaId: string, filas: FilaComparativa[]) => void;
}

const REGIONALS = ['urc', 'urn', 'urs', 'ure', 'uro'] as const;
type Regional = typeof REGIONALS[number];

const AMBITO_CATEGORIES = [
  { id: 'ambito_publico_hechos', label: 'ÁMBITO PÚBLICO' },
  { id: 'ambito_privado_hechos', label: 'ÁMBITO PRIVADO' },
  { id: 'vivienda_particular_hechos', label: 'VIVIENDA PARTICULAR' },
  { id: 'contexto_encierro_hechos', label: 'CONTEXTO DE ENCIERRO' },
];

const MOVIL_CATEGORIES = [
  { id: 'violencia_intervecinal', label: 'VIOLENCIA INTERVECINAL' },
  { id: 'violencia_intrafamiliar', label: 'VIOLENCIA INTRAFAMILIAR' },
  { id: 'legitima_defensa', label: 'LEGÍTIMA DEFENSA' },
  { id: 'ocasion_robo', label: 'OCASIÓN DE ROBO' },
  { id: 'intervencion_policial', label: 'INTERVENCIÓN POLICIAL' },
  { id: 'ajuste_cuenta', label: 'POSIBLE AJUSTE DE CUENTA' },
  { id: 'femicidio', label: 'FEMICIDIO' },
  { id: 'conflicto_pasional', label: 'CONFLICTO PASIONAL' },
  { id: 'rina_publica_particular', label: 'RIÑA (V/PÚBLICA Y/O V/PARTICULAR)' },
  { id: 'conflicto_encierro', label: 'CONFLICTO EN CONTEXTO DE ENCIERRO' },
  { id: 'preterintencional', label: 'PRETERINTENCIONAL' },
  { id: 'culposo_otros_hechos', label: 'CULPOSO (POR OTROS HECHOS)' },
  { id: 'sin_factor_incidencia', label: 'SIN FACTOR DE INCIDENCIA (P/INVEST.)' },
];

const VICTIMAS_CATEGORIES = [
  { id: 'ambito_publico_victimas', label: 'ÁMBITO PÚBLICO' },
  { id: 'ambito_privado_victimas', label: 'ÁMBITO PRIVADO' },
  { id: 'vivienda_particular_victimas', label: 'VIVIENDA PARTICULAR' },
  { id: 'contexto_encierro_victimas', label: 'CONTEXTO DE ENCIERRO' },
];

export function D3HomicidiosTable({
  titulo,
  tablaId,
  tablaConfigId,
  color = '#ef4444',
  labelPeriodoAnterior = '2024',
  labelPeriodoActual = '2025',
  filas: filasIniciales,
  onDataChange,
}: D3HomicidiosTableProps) {
  const { edicionHabilitada } = useAppStore();
  const [filas, setFilas] = useState<FilaComparativa[]>(filasIniciales);
  const [editando, setEditando] = useState(false);
  const [filasEditadas, setFilasEditadas] = useState<FilaComparativa[]>(filasIniciales);

  useEffect(() => {
    setFilas(filasIniciales);
    setFilasEditadas(filasIniciales);
  }, [filasIniciales]);

  const handleEdit = () => {
    setFilasEditadas([...filas]);
    setEditando(true);
  };

  const handleCancel = () => {
    setFilasEditadas(filas);
    setEditando(false);
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
      console.error('Error guardando datos de homicidios D3:', err);
    }
  }, [filasEditadas, tablaId, tablaConfigId, onDataChange]);

  const handleChange = (
    baseCatId: string,
    ur: string,
    periodo: 'periodoAnterior' | 'periodoActual',
    valor: string
  ) => {
    const numValue = Math.max(0, parseInt(valor) || 0);
    const targetFilaId = `${baseCatId}_${ur}`;
    setFilasEditadas(prev =>
      prev.map(f => (f.id === targetFilaId ? { ...f, [periodo]: numValue } : f))
    );
  };

  const handleVictimaChange = (
    filaId: string,
    periodo: 'periodoAnterior' | 'periodoActual',
    valor: string
  ) => {
    const numValue = Math.max(0, parseInt(valor) || 0);
    setFilasEditadas(prev =>
      prev.map(f => (f.id === filaId ? { ...f, [periodo]: numValue } : f))
    );
  };

  const activeFilas = editando ? filasEditadas : filas;

  // Helper to extract values
  const getVal = (baseCatId: string, ur: string, key: 'periodoAnterior' | 'periodoActual') => {
    const fila = activeFilas.find(f => f.id === `${baseCatId}_${ur}`);
    return fila ? fila[key] : 0;
  };

  // Helper to calculate total for a category and year
  const getCatTotal = (baseCatId: string, key: 'periodoAnterior' | 'periodoActual') => {
    return REGIONALS.reduce((sum, ur) => sum + getVal(baseCatId, ur, key), 0);
  };

  // Helper to calculate section total per regional
  const getSectionUrTotal = (
    categories: typeof AMBITO_CATEGORIES | typeof MOVIL_CATEGORIES,
    ur: string,
    key: 'periodoAnterior' | 'periodoActual'
  ) => {
    return categories.reduce((sum, cat) => sum + getVal(cat.id, ur, key), 0);
  };

  // Helper to calculate section grand total
  const getSectionGrandTotal = (
    categories: typeof AMBITO_CATEGORIES | typeof MOVIL_CATEGORIES,
    key: 'periodoAnterior' | 'periodoActual'
  ) => {
    return categories.reduce((sum, cat) => sum + getCatTotal(cat.id, key), 0);
  };

  // Total de víctimas (se saca del record total_victimas o se calcula)
  const getVictimaVal = (filaId: string, key: 'periodoAnterior' | 'periodoActual') => {
    const fila = activeFilas.find(f => f.id === filaId);
    return fila ? fila[key] : 0;
  };

  const totalVictimasAnterior = getVictimaVal('total_victimas', 'periodoAnterior');
  const totalVictimasActual = getVictimaVal('total_victimas', 'periodoActual');

  // Calcular totales automáticos para víctimas
  const sumVictimasAnterior = VICTIMAS_CATEGORIES.reduce((sum, cat) => sum + getVictimaVal(cat.id, 'periodoAnterior'), 0);
  const sumVictimasActual = VICTIMAS_CATEGORIES.reduce((sum, cat) => sum + getVictimaVal(cat.id, 'periodoActual'), 0);

  // Totales de hechos para los KPI de arriba del card
  const totalHechosAnterior = getSectionGrandTotal(AMBITO_CATEGORIES, 'periodoAnterior');
  const totalHechosActual = getSectionGrandTotal(AMBITO_CATEGORIES, 'periodoActual');
  const balanceHechos = totalHechosActual - totalHechosAnterior;
  const variacionHechos = totalHechosAnterior === 0 
    ? (totalHechosActual > 0 ? 100 : 0) 
    : Math.round((balanceHechos / totalHechosAnterior) * 100);

  return (
    <div className="space-y-8">
      {/* CARD PRINCIPAL - HECHOS */}
      <div className="card overflow-hidden rounded-[26px] border border-slate-200/80 shadow-[0_16px_38px_rgba(15,29,48,0.08)]">
        {/* Cabecera con Degradado */}
        <div
          className="flex flex-col gap-4 px-5 py-5 text-white"
          style={{
            background: `linear-gradient(135deg, ${color} 0%, ${color}dd 58%, #0f1d30 100%)`,
          }}
        >
          <div className="flex items-start justify-between gap-4">
            <div>
              <span className="inline-flex rounded-full border border-white/20 bg-white/10 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.22em] text-white/85 backdrop-blur-sm">
                HECHOS REGIONALES
              </span>
              <h3 className="mt-3 text-base font-semibold uppercase tracking-[0.08em]">
                {titulo} — Matriz de Hechos
              </h3>
              <p className="mt-1 text-xs text-white/80">
                Desglose territorial por Unidad Regional y año operativo (2024 vs 2025)
              </p>
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

          {/* Resumen KPI */}
          <div className="grid gap-3 sm:grid-cols-3">
            <div className="rounded-2xl border border-white/10 bg-white/10 px-4 py-3 backdrop-blur-sm">
              <div className="text-[10px] font-semibold uppercase tracking-[0.18em] text-white/70">
                Hechos {labelPeriodoAnterior}
              </div>
              <div className="mt-1 text-xl font-black text-white tabular-nums">
                {totalHechosAnterior}
              </div>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/10 px-4 py-3 backdrop-blur-sm">
              <div className="text-[10px] font-semibold uppercase tracking-[0.18em] text-white/70">
                Hechos {labelPeriodoActual}
              </div>
              <div className="mt-1 text-xl font-black text-white tabular-nums">
                {totalHechosActual}
              </div>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/10 px-4 py-3 backdrop-blur-sm">
              <div className="text-[10px] font-semibold uppercase tracking-[0.18em] text-white/70">
                Balance Hechos
              </div>
              <div className="mt-1 text-xl font-black text-white tabular-nums">
                {balanceHechos > 0 ? '+' : ''}
                {variacionHechos}%
              </div>
            </div>
          </div>
        </div>

        {/* Tabla Operativa */}
        <div className="overflow-x-auto">
          <table className="min-w-full border-collapse text-sm text-slate-700">
            <thead>
              {/* Encabezado */}
              <tr className="bg-[#9ec2e6] text-slate-800 border-b border-slate-300">
                <th className="border-r border-slate-300 px-4 py-3 text-left font-bold uppercase tracking-[0.08em] w-[25%]">
                  Ámbito / Situación
                </th>
                <th className="border-r border-slate-300 px-4 py-3 text-center font-bold uppercase tracking-[0.08em] w-[8%]">
                  Año
                </th>
                <th className="border-r border-slate-300 px-3 py-3 text-center font-bold uppercase tracking-[0.08em]">
                  URC
                </th>
                <th className="border-r border-slate-300 px-3 py-3 text-center font-bold uppercase tracking-[0.08em]">
                  URN
                </th>
                <th className="border-r border-slate-300 px-3 py-3 text-center font-bold uppercase tracking-[0.08em]">
                  URS
                </th>
                <th className="border-r border-slate-300 px-3 py-3 text-center font-bold uppercase tracking-[0.08em]">
                  URE
                </th>
                <th className="border-r border-slate-300 px-3 py-3 text-center font-bold uppercase tracking-[0.08em]">
                  URO
                </th>
                <th className="px-4 py-3 text-center font-bold uppercase tracking-[0.08em] w-[22%]">
                  Total de Hechos
                </th>
              </tr>
            </thead>
            <tbody>
              {/* SECCIÓN 1: POR ÁMBITO */}
              {AMBITO_CATEGORIES.map((cat, catIdx) => {
                const total2024 = getCatTotal(cat.id, 'periodoAnterior');
                const total2025 = getCatTotal(cat.id, 'periodoActual');

                return (
                  <>
                    {/* Fila Año 2024 */}
                    <tr
                      key={`${cat.id}_2024`}
                      className="border-t border-slate-200 transition-colors hover:bg-slate-50/70"
                    >
                      {/* Celda del detalle con rowSpan=2 */}
                      <td
                        rowSpan={2}
                        className="border-r border-b border-slate-200 px-4 py-3 font-semibold text-slate-800 uppercase bg-slate-50/40 align-middle"
                      >
                        {cat.label}
                      </td>
                      <td className="border-r border-b border-slate-200 px-2 py-2 text-center font-bold text-red-600">
                        2024
                      </td>
                      {REGIONALS.map(ur => (
                        <td
                          key={`${cat.id}_2024_${ur}`}
                          className="border-r border-b border-slate-200 px-3 py-2 text-center font-semibold text-red-600 tabular-nums"
                        >
                          {editando ? (
                            <input
                              type="number"
                              value={getVal(cat.id, ur, 'periodoAnterior')}
                              onChange={e => handleChange(cat.id, ur, 'periodoAnterior', e.target.value)}
                              className="w-16 rounded-md border border-slate-300 px-1 py-1 text-center text-slate-900 outline-none focus:border-slate-500 font-normal"
                            />
                          ) : (
                            getVal(cat.id, ur, 'periodoAnterior')
                          )}
                        </td>
                      ))}
                      <td className="border-b border-slate-200 px-4 py-2 text-center font-bold text-red-600 bg-red-50/30 tabular-nums">
                        {total2024}
                      </td>
                    </tr>

                    {/* Fila Año 2025 */}
                    <tr
                      key={`${cat.id}_2025`}
                      className="border-b border-slate-200 transition-colors hover:bg-slate-50/70"
                    >
                      <td className="border-r border-slate-200 px-2 py-2 text-center font-bold text-slate-700 bg-slate-50/50">
                        2025
                      </td>
                      {REGIONALS.map(ur => (
                        <td
                          key={`${cat.id}_2025_${ur}`}
                          className="border-r border-slate-200 px-3 py-2 text-center font-semibold text-slate-700 tabular-nums"
                        >
                          {editando ? (
                            <input
                              type="number"
                              value={getVal(cat.id, ur, 'periodoActual')}
                              onChange={e => handleChange(cat.id, ur, 'periodoActual', e.target.value)}
                              className="w-16 rounded-md border border-slate-300 px-1 py-1 text-center text-slate-900 outline-none focus:border-slate-500 font-normal"
                            />
                          ) : (
                            getVal(cat.id, ur, 'periodoActual')
                          )}
                        </td>
                      ))}
                      <td className="px-4 py-2 text-center font-bold text-slate-700 bg-slate-100/50 tabular-nums">
                        {total2025}
                      </td>
                    </tr>
                  </>
                );
              })}

              {/* Fila TOTALES POR REGIONAL (Ámbito) */}
              <tr className="border-t-2 border-slate-400 bg-slate-900 text-white font-bold">
                <td rowSpan={2} className="border-r border-b border-slate-700 px-4 py-3 align-middle uppercase">
                  TOTALES POR REGIONAL
                </td>
                <td className="border-r border-b border-slate-700 px-2 py-2 text-center text-red-400 font-bold">
                  2024
                </td>
                {REGIONALS.map(ur => (
                  <td
                    key={`total_ambito_2024_${ur}`}
                    className="border-r border-b border-slate-700 px-3 py-2 text-center text-red-400 tabular-nums"
                  >
                    {getSectionUrTotal(AMBITO_CATEGORIES, ur, 'periodoAnterior')}
                  </td>
                ))}
                <td className="border-b border-slate-700 px-4 py-2 text-center text-red-400 bg-slate-800 tabular-nums">
                  {getSectionGrandTotal(AMBITO_CATEGORIES, 'periodoAnterior')}
                </td>
              </tr>
              <tr className="bg-slate-900 text-white font-bold border-b-4 border-slate-400">
                <td className="border-r border-slate-700 px-2 py-2 text-center font-bold">
                  2025
                </td>
                {REGIONALS.map(ur => (
                  <td
                    key={`total_ambito_2025_${ur}`}
                    className="border-r border-slate-700 px-3 py-2 text-center tabular-nums"
                  >
                    {getSectionUrTotal(AMBITO_CATEGORIES, ur, 'periodoActual')}
                  </td>
                ))}
                <td className="px-4 py-2 text-center bg-slate-800 tabular-nums">
                  {getSectionGrandTotal(AMBITO_CATEGORIES, 'periodoActual')}
                </td>
              </tr>

              {/* SECCIÓN 2: POR MÓVIL DE CRIMEN */}
              <tr className="bg-[#b5d2f0] text-slate-800 border-t border-b border-slate-300 font-bold">
                <td colSpan={8} className="px-4 py-2 text-left uppercase tracking-[0.06em]">
                  Desglose por Móvil de Crimen
                </td>
              </tr>

              {MOVIL_CATEGORIES.map((cat, catIdx) => {
                const total2024 = getCatTotal(cat.id, 'periodoAnterior');
                const total2025 = getCatTotal(cat.id, 'periodoActual');

                return (
                  <>
                    {/* Fila Año 2024 */}
                    <tr
                      key={`${cat.id}_2024`}
                      className="border-t border-slate-200 transition-colors hover:bg-slate-50/70"
                    >
                      <td
                        rowSpan={2}
                        className="border-r border-b border-slate-200 px-4 py-3 font-semibold text-slate-800 uppercase bg-slate-50/40 align-middle"
                      >
                        {cat.label}
                      </td>
                      <td className="border-r border-b border-slate-200 px-2 py-2 text-center font-bold text-red-600">
                        2024
                      </td>
                      {REGIONALS.map(ur => (
                        <td
                          key={`${cat.id}_2024_${ur}`}
                          className="border-r border-b border-slate-200 px-3 py-2 text-center font-semibold text-red-600 tabular-nums"
                        >
                          {editando ? (
                            <input
                              type="number"
                              value={getVal(cat.id, ur, 'periodoAnterior')}
                              onChange={e => handleChange(cat.id, ur, 'periodoAnterior', e.target.value)}
                              className="w-16 rounded-md border border-slate-300 px-1 py-1 text-center text-slate-900 outline-none focus:border-slate-500 font-normal"
                            />
                          ) : (
                            getVal(cat.id, ur, 'periodoAnterior')
                          )}
                        </td>
                      ))}
                      <td className="border-b border-slate-200 px-4 py-2 text-center font-bold text-red-600 bg-red-50/30 tabular-nums">
                        {total2024}
                      </td>
                    </tr>

                    {/* Fila Año 2025 */}
                    <tr
                      key={`${cat.id}_2025`}
                      className="border-b border-slate-200 transition-colors hover:bg-slate-50/70"
                    >
                      <td className="border-r border-slate-200 px-2 py-2 text-center font-bold text-slate-700 bg-slate-50/50">
                        2025
                      </td>
                      {REGIONALS.map(ur => (
                        <td
                          key={`${cat.id}_2025_${ur}`}
                          className="border-r border-slate-200 px-3 py-2 text-center font-semibold text-slate-700 tabular-nums"
                        >
                          {editando ? (
                            <input
                              type="number"
                              value={getVal(cat.id, ur, 'periodoActual')}
                              onChange={e => handleChange(cat.id, ur, 'periodoActual', e.target.value)}
                              className="w-16 rounded-md border border-slate-300 px-1 py-1 text-center text-slate-900 outline-none focus:border-slate-500 font-normal"
                            />
                          ) : (
                            getVal(cat.id, ur, 'periodoActual')
                          )}
                        </td>
                      ))}
                      <td className="px-4 py-2 text-center font-bold text-slate-700 bg-slate-100/50 tabular-nums">
                        {total2025}
                      </td>
                    </tr>
                  </>
                );
              })}

              {/* Fila TOTALES POR REGIONAL (Móvil) */}
              <tr className="border-t-2 border-slate-400 bg-slate-900 text-white font-bold">
                <td rowSpan={2} className="border-r border-b border-slate-700 px-4 py-3 align-middle uppercase">
                  TOTALES POR REGIONAL
                </td>
                <td className="border-r border-b border-slate-700 px-2 py-2 text-center text-red-400 font-bold">
                  2024
                </td>
                {REGIONALS.map(ur => (
                  <td
                    key={`total_movil_2024_${ur}`}
                    className="border-r border-b border-slate-700 px-3 py-2 text-center text-red-400 tabular-nums"
                  >
                    {getSectionUrTotal(MOVIL_CATEGORIES, ur, 'periodoAnterior')}
                  </td>
                ))}
                <td className="border-b border-slate-700 px-4 py-2 text-center text-red-400 bg-slate-800 tabular-nums">
                  {getSectionGrandTotal(MOVIL_CATEGORIES, 'periodoAnterior')}
                </td>
              </tr>
              <tr className="bg-slate-900 text-white font-bold">
                <td className="border-r border-slate-700 px-2 py-2 text-center font-bold">
                  2025
                </td>
                {REGIONALS.map(ur => (
                  <td
                    key={`total_movil_2025_${ur}`}
                    className="border-r border-slate-700 px-3 py-2 text-center tabular-nums"
                  >
                    {getSectionUrTotal(MOVIL_CATEGORIES, ur, 'periodoActual')}
                  </td>
                ))}
                <td className="px-4 py-2 text-center bg-slate-800 tabular-nums">
                  {getSectionGrandTotal(MOVIL_CATEGORIES, 'periodoActual')}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* BLOQUE COMPARATIVO - VÍCTIMAS */}
      <div className="card overflow-hidden rounded-[26px] border border-slate-200/80 shadow-[0_16px_38px_rgba(15,29,48,0.08)]">
        <div
          className="flex flex-col gap-4 px-5 py-5 text-white"
          style={{
            background: `linear-gradient(135deg, ${color} 0%, #1e3a5f 100%)`,
          }}
        >
          <div className="flex items-start justify-between gap-4">
            <div>
              <span className="inline-flex rounded-full border border-white/20 bg-white/10 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.22em] text-white/85 backdrop-blur-sm">
                VÍCTIMAS COMPARATIVAS
              </span>
              <h3 className="mt-3 text-base font-semibold uppercase tracking-[0.08em]">
                Víctimas de Homicidios Dolosos — Por Ámbito / Situación
              </h3>
              <p className="mt-1 text-xs text-white/80">
                Totales consolidados de víctimas según el ámbito de ocurrencia
              </p>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full border-collapse text-sm text-slate-700">
            <thead>
              <tr className="bg-[#f8f1df] text-slate-700">
                <th className="w-[40%] border-b border-r border-[#e8dcc0] px-4 py-3 text-left font-semibold uppercase tracking-[0.08em]">
                  Ámbito / Situación (Víctimas)
                </th>
                <th className="border-b border-r border-[#e8dcc0] px-4 py-3 text-center font-semibold uppercase tracking-[0.08em]">
                  {labelPeriodoAnterior}
                </th>
                <th className="border-b border-r border-[#e8dcc0] px-4 py-3 text-center font-semibold uppercase tracking-[0.08em]">
                  {labelPeriodoActual}
                </th>
                <th className="border-b border-r border-[#e8dcc0] px-4 py-3 text-center font-semibold uppercase tracking-[0.08em]">
                  Diferencia
                </th>
                <th className="border-b border-[#e8dcc0] px-4 py-3 text-center font-semibold uppercase tracking-[0.08em]">
                  Variación
                </th>
              </tr>
            </thead>
            <tbody>
              {VICTIMAS_CATEGORIES.map(cat => {
                const valAnterior = getVictimaVal(cat.id, 'periodoAnterior');
                const valActual = getVictimaVal(cat.id, 'periodoActual');
                const dif = valActual - valAnterior;
                const porc = valAnterior === 0 ? (valActual > 0 ? 100 : 0) : Math.round((dif / valAnterior) * 100);

                return (
                  <tr key={cat.id} className="border-t border-slate-100 transition-colors hover:bg-slate-50/70">
                    <td className="px-4 py-3 font-semibold uppercase tracking-[0.03em]">{cat.label}</td>
                    <td className="px-4 py-3 text-center font-bold tabular-nums">
                      {editando ? (
                        <input
                          type="number"
                          value={valAnterior}
                          onChange={e => handleVictimaChange(cat.id, 'periodoAnterior', e.target.value)}
                          className="w-20 rounded-md border border-slate-300 px-1 py-1 text-center text-slate-900 outline-none focus:border-slate-500 font-normal"
                        />
                      ) : (
                        valAnterior
                      )}
                    </td>
                    <td className="px-4 py-3 text-center font-bold tabular-nums">
                      {editando ? (
                        <input
                          type="number"
                          value={valActual}
                          onChange={e => handleVictimaChange(cat.id, 'periodoActual', e.target.value)}
                          className="w-20 rounded-md border border-slate-300 px-1 py-1 text-center text-slate-900 outline-none focus:border-slate-500 font-normal"
                        />
                      ) : (
                        valActual
                      )}
                    </td>
                    <td className="px-4 py-3 text-center font-bold">
                      <span
                        className={clsx(
                          'inline-flex rounded-full px-2.5 py-1 text-xs font-semibold',
                          dif > 0 ? 'bg-emerald-100 text-emerald-700' :
                          dif < 0 ? 'bg-rose-100 text-rose-700' : 'bg-slate-200 text-slate-600'
                        )}
                      >
                        {dif > 0 ? '+' : ''}
                        {dif}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center font-bold tabular-nums">
                      {porc > 0 ? '+' : ''}
                      {porc}%
                    </td>
                  </tr>
                );
              })}

              {/* Fila TOTAL VÍCTIMAS */}
              <tr className="bg-slate-900 text-white font-bold hover:bg-slate-900">
                <td className="px-4 py-3 uppercase tracking-[0.03em]">TOTAL VÍCTIMAS</td>
                <td className="px-4 py-3 text-center tabular-nums">
                  {editando ? (
                    <input
                      type="number"
                      value={totalVictimasAnterior}
                      onChange={e => handleVictimaChange('total_victimas', 'periodoAnterior', e.target.value)}
                      className="w-20 rounded-md border border-slate-300 px-1 py-1 text-center text-slate-900 outline-none focus:border-slate-500 font-normal"
                    />
                  ) : (
                    totalVictimasAnterior
                  )}
                </td>
                <td className="px-4 py-3 text-center tabular-nums">
                  {editando ? (
                    <input
                      type="number"
                      value={totalVictimasActual}
                      onChange={e => handleVictimaChange('total_victimas', 'periodoActual', e.target.value)}
                      className="w-20 rounded-md border border-slate-300 px-1 py-1 text-center text-slate-900 outline-none focus:border-slate-500 font-normal"
                    />
                  ) : (
                    totalVictimasActual
                  )}
                </td>
                <td className="px-4 py-3 text-center">
                  <span className="inline-flex rounded-full px-2.5 py-1 text-xs font-semibold bg-white/15 text-white">
                    {totalVictimasActual - totalVictimasAnterior > 0 ? '+' : ''}
                    {totalVictimasActual - totalVictimasAnterior}
                  </span>
                </td>
                <td className="px-4 py-3 text-center tabular-nums">
                  {totalVictimasAnterior === 0 
                    ? (totalVictimasActual > 0 ? '+100%' : '0%') 
                    : `${totalVictimasActual - totalVictimasAnterior > 0 ? '+' : ''}${Math.round(((totalVictimasActual - totalVictimasAnterior) / totalVictimasAnterior) * 100)}%`}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
