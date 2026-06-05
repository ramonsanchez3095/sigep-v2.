'use client';

import { useState, useCallback, useEffect } from 'react';
import { Edit2, Save, X, Activity, Scale } from 'lucide-react';
import clsx from 'clsx';

// ─── Tipos de datos ────────────────────────────────────────────────────────────

interface FilaUR {
  urc: number;
  urn: number;
  urs: number;
  ure: number;
  uro: number;
  total: number;
}

interface GrupoHomicidio {
  /** Nombre del ámbito/situación o móvil de crimen */
  label: string;
  /** Datos del período anterior (ej: 2024) */
  anterior: FilaUR;
  /** Datos del período actual (ej: 2025) */
  actual: FilaUR;
  /** true → fila de totales (fondo oscuro) */
  esTotal?: boolean;
}

interface D3HomicidiosTableProps {
  titulo: string;
  /** Etiqueta del año anterior (ej: "2024") */
  labelAnterior?: string;
  /** Etiqueta del año actual (ej: "2025") */
  labelActual?: string;
  /** Etiqueta de la última columna */
  labelTotal?: string;
  grupos: GrupoHomicidio[];
  /** Color del header (usa el color del departamento D3) */
  color?: string;
}

// ─── Datos estáticos embebidos (fuente: imágenes provistas) ──────────────────

/** HECHOS de Homicidios Dolosos — Por Ámbito/Situación */
export const HECHOS_POR_AMBITO: GrupoHomicidio[] = [
  {
    label: 'ÁMBITO PÚBLICO',
    anterior: { urc: 19, urn: 3, urs: 3, ure: 1, uro: 1, total: 27 },
    actual: { urc: 8, urn: 2, urs: 1, ure: 1, uro: 1, total: 13 },
  },
  {
    label: 'ÁMBITO PRIVADO',
    anterior: { urc: 0, urn: 1, urs: 0, ure: 0, uro: 1, total: 2 },
    actual: { urc: 1, urn: 0, urs: 0, ure: 0, uro: 0, total: 1 },
  },
  {
    label: 'VIVIENDA PARTICULAR',
    anterior: { urc: 2, urn: 3, urs: 1, ure: 2, uro: 0, total: 8 },
    actual: { urc: 5, urn: 0, urs: 0, ure: 0, uro: 0, total: 5 },
  },
  {
    label: 'CONTEXTO DE ENCIERRO',
    anterior: { urc: 2, urn: 0, urs: 0, ure: 0, uro: 0, total: 2 },
    actual: { urc: 0, urn: 1, urs: 0, ure: 1, uro: 0, total: 2 },
  },
  {
    label: 'TOTALES POR REGIONAL',
    esTotal: true,
    anterior: { urc: 23, urn: 7, urs: 4, ure: 3, uro: 2, total: 39 },
    actual: { urc: 14, urn: 3, urs: 1, ure: 2, uro: 1, total: 21 },
  },
];

/** HECHOS de Homicidios Dolosos — Por Móvil de Crimen */
export const HECHOS_POR_MOVIL: GrupoHomicidio[] = [
  {
    label: 'VIOLENCIA INTERVECINAL',
    anterior: { urc: 6, urn: 1, urs: 1, ure: 1, uro: 1, total: 10 },
    actual: { urc: 1, urn: 0, urs: 0, ure: 0, uro: 0, total: 1 },
  },
  {
    label: 'VIOLENCIA INTRAFAMILIAR',
    anterior: { urc: 1, urn: 2, urs: 1, ure: 0, uro: 0, total: 4 },
    actual: { urc: 2, urn: 0, urs: 0, ure: 0, uro: 0, total: 2 },
  },
  {
    label: 'LEGÍTIMA DEFENSA',
    anterior: { urc: 0, urn: 0, urs: 0, ure: 1, uro: 0, total: 1 },
    actual: { urc: 0, urn: 0, urs: 0, ure: 0, uro: 0, total: 0 },
  },
  {
    label: 'OCASIÓN DE ROBO',
    anterior: { urc: 5, urn: 1, urs: 0, ure: 0, uro: 1, total: 7 },
    actual: { urc: 2, urn: 0, urs: 0, ure: 0, uro: 0, total: 2 },
  },
  {
    label: 'INTERVENCIÓN POLICIAL',
    anterior: { urc: 3, urn: 1, urs: 0, ure: 0, uro: 0, total: 4 },
    actual: { urc: 1, urn: 0, urs: 0, ure: 0, uro: 0, total: 1 },
  },
  {
    label: 'POSIBLE AJUSTE DE CUENTA',
    anterior: { urc: 3, urn: 0, urs: 0, ure: 0, uro: 0, total: 3 },
    actual: { urc: 1, urn: 1, urs: 0, ure: 0, uro: 0, total: 2 },
  },
  {
    label: 'FEMICIDIO',
    anterior: { urc: 1, urn: 0, urs: 1, ure: 0, uro: 0, total: 2 },
    actual: { urc: 6, urn: 1, urs: 0, ure: 0, uro: 0, total: 7 },
  },
  {
    label: 'CONFLICTO PASIONAL',
    anterior: { urc: 0, urn: 0, urs: 0, ure: 0, uro: 0, total: 0 },
    actual: { urc: 0, urn: 0, urs: 0, ure: 1, uro: 0, total: 1 },
  },
  {
    label: 'RIÑA (V/PÚBLICA Y/O V/PARTICULAR)',
    anterior: { urc: 0, urn: 0, urs: 0, ure: 0, uro: 0, total: 0 },
    actual: { urc: 0, urn: 0, urs: 1, ure: 0, uro: 0, total: 1 },
  },
  {
    label: 'CONFLICTO EN CONTEXTO DE ENCIERRO',
    anterior: { urc: 2, urn: 0, urs: 0, ure: 0, uro: 0, total: 2 },
    actual: { urc: 0, urn: 1, urs: 0, ure: 0, uro: 0, total: 1 },
  },
  {
    label: 'PRETERINTENCIONAL',
    anterior: { urc: 1, urn: 0, urs: 0, ure: 0, uro: 0, total: 1 },
    actual: { urc: 0, urn: 0, urs: 0, ure: 0, uro: 0, total: 0 },
  },
  {
    label: 'CULPOSO (POR OTROS HECHOS)',
    anterior: { urc: 0, urn: 0, urs: 1, ure: 0, uro: 0, total: 1 },
    actual: { urc: 0, urn: 0, urs: 0, ure: 0, uro: 0, total: 0 },
  },
  {
    label: 'SIN FACTOR DE INCIDENCIA (P/INVEST.)',
    anterior: { urc: 1, urn: 2, urs: 0, ure: 1, uro: 0, total: 4 },
    actual: { urc: 1, urn: 0, urs: 0, ure: 0, uro: 1, total: 2 },
  },
  {
    label: 'TOTALES POR REGIONAL',
    esTotal: true,
    anterior: { urc: 23, urn: 7, urs: 4, ure: 3, uro: 2, total: 39 },
    actual: { urc: 14, urn: 3, urs: 1, ure: 2, uro: 1, total: 21 },
  },
];

// ─── Componente ───────────────────────────────────────────────────────────────

function CeldaNum({
  value,
  esAnterior,
  esTotal,
  bold = false,
}: {
  value: number;
  esAnterior: boolean;
  esTotal: boolean;
  bold?: boolean;
}) {
  return (
    <td
      className={clsx(
        'px-2 py-1.5 text-center text-sm tabular-nums',
        bold && 'font-bold',
        esTotal
          ? esAnterior
            ? 'font-bold text-red-400'
            : 'font-semibold text-slate-200'
          : esAnterior
            ? 'font-semibold text-red-500'
            : 'font-medium text-slate-700'
      )}
    >
      {value}
    </td>
  );
}

export function D3HomicidiosTable({
  titulo,
  labelAnterior = '2024',
  labelActual = '2025',
  labelTotal = 'CANTIDAD DE HECHOS POR MÓVIL DE CRIMEN',
  grupos,
  color = '#ef4444',
}: D3HomicidiosTableProps) {
  const totalAnterior = grupos.find(g => g.esTotal)?.anterior.total ?? 0;
  const totalActual = grupos.find(g => g.esTotal)?.actual.total ?? 0;
  const balance =
    totalAnterior === 0
      ? 0
      : Math.round(((totalActual - totalAnterior) / totalAnterior) * 100);

  return (
    <div className="card overflow-hidden rounded-[26px] border border-slate-200/80 shadow-[0_16px_38px_rgba(15,29,48,0.08)]">
      {/* ── Header ── */}
      <div
        className="flex flex-col gap-4 px-5 py-5 text-white"
        style={{
          background: `linear-gradient(135deg, ${color} 0%, ${color}dd 58%, #0f1d30 100%)`,
        }}
      >
        <h3 className="text-base font-semibold uppercase tracking-[0.08em]">
          {titulo}
        </h3>

        {/* Resumen de totales */}
        <div className="grid gap-3 sm:grid-cols-3">
          <div className="rounded-2xl border border-white/10 bg-white/10 px-4 py-3 backdrop-blur-sm">
            <div className="text-[10px] font-semibold uppercase tracking-[0.18em] text-white/70">
              Período {labelAnterior}
            </div>
            <div className="mt-1 text-xl font-black text-white tabular-nums">
              {totalAnterior}
            </div>
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/10 px-4 py-3 backdrop-blur-sm">
            <div className="text-[10px] font-semibold uppercase tracking-[0.18em] text-white/70">
              Período {labelActual}
            </div>
            <div className="mt-1 text-xl font-black text-white tabular-nums">
              {totalActual}
            </div>
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/10 px-4 py-3 backdrop-blur-sm">
            <div className="text-[10px] font-semibold uppercase tracking-[0.18em] text-white/70">
              Balance
            </div>
            <div className="mt-1 text-xl font-black text-white tabular-nums">
              {balance > 0 ? '+' : ''}
              {balance}%
            </div>
          </div>
        </div>
      </div>

      {/* ── Tabla ── */}
      <div className="overflow-x-auto">
        <table className="min-w-full border-collapse text-sm">
          <thead>
            {/* Fila 1: cabeceras principales */}
            <tr className="bg-[#f8f1df] text-slate-700">
              <th
                rowSpan={2}
                className="w-[26%] border-b border-r border-[#e8dcc0] px-4 py-3 text-left text-xs font-semibold uppercase tracking-[0.08em]"
              >
                Ámbito / Situación
              </th>
              <th
                rowSpan={2}
                className="border-b border-r border-[#e8dcc0] px-3 py-3 text-center text-xs font-semibold uppercase tracking-[0.08em]"
              >
                Año
              </th>
              <th
                colSpan={5}
                className="border-b border-r border-[#e8dcc0] px-4 py-2 text-center text-xs font-semibold uppercase tracking-[0.08em]"
              >
                Unidades Regionales
              </th>
              <th
                rowSpan={2}
                className="border-b border-[#e8dcc0] px-4 py-3 text-center text-xs font-semibold uppercase tracking-[0.08em] leading-tight"
              >
                {labelTotal}
              </th>
            </tr>
            {/* Fila 2: sub-cabeceras de regionales */}
            <tr className="bg-slate-100 text-slate-600">
              {['U.R.C', 'U.R.N', 'U.R.S', 'U.R.E', 'U.R.O'].map(ur => (
                <th
                  key={ur}
                  className="border-r border-slate-200 px-3 py-2 text-center text-xs font-semibold uppercase tracking-[0.06em]"
                >
                  {ur}
                </th>
              ))}
            </tr>
          </thead>

          <tbody>
            {grupos.map((grupo, idx) => {
              const isTotal = !!grupo.esTotal;

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

      {/* BLOQUE COMPARATIVO - VÍCTIMAS */ }
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

                {/* Valores UR — actual */}
                {(['urc', 'urn', 'urs', 'ure', 'uro'] as const).map(ur => (
                  <CeldaNum
                    key={ur}
                    value={grupo.actual[ur]}
                    esAnterior={false}
                    esTotal={isTotal}
                  />
                ))}

                {/* Total hechos — actual */}
                <CeldaNum
                  value={grupo.actual.total}
                  esAnterior={false}
                  esTotal={isTotal}
                  bold
                />
              </tr>
                </>
        );
            })}
      </tbody>
    </table>
  </div>
    </div >
  );
}
