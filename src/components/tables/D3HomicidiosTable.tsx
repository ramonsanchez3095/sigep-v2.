'use client';

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
    actual:   { urc: 8,  urn: 2, urs: 1, ure: 1, uro: 1, total: 13 },
  },
  {
    label: 'ÁMBITO PRIVADO',
    anterior: { urc: 0, urn: 1, urs: 0, ure: 0, uro: 1, total: 2 },
    actual:   { urc: 1, urn: 0, urs: 0, ure: 0, uro: 0, total: 1 },
  },
  {
    label: 'VIVIENDA PARTICULAR',
    anterior: { urc: 2, urn: 3, urs: 1, ure: 2, uro: 0, total: 8 },
    actual:   { urc: 5, urn: 0, urs: 0, ure: 0, uro: 0, total: 5 },
  },
  {
    label: 'CONTEXTO DE ENCIERRO',
    anterior: { urc: 2, urn: 0, urs: 0, ure: 0, uro: 0, total: 2 },
    actual:   { urc: 0, urn: 1, urs: 0, ure: 1, uro: 0, total: 2 },
  },
  {
    label: 'TOTALES POR REGIONAL',
    esTotal: true,
    anterior: { urc: 23, urn: 7, urs: 4, ure: 3, uro: 2, total: 39 },
    actual:   { urc: 14, urn: 3, urs: 1, ure: 2, uro: 1, total: 21 },
  },
];

/** HECHOS de Homicidios Dolosos — Por Móvil de Crimen */
export const HECHOS_POR_MOVIL: GrupoHomicidio[] = [
  {
    label: 'VIOLENCIA INTERVECINAL',
    anterior: { urc: 6, urn: 1, urs: 1, ure: 1, uro: 1, total: 10 },
    actual:   { urc: 1, urn: 0, urs: 0, ure: 0, uro: 0, total: 1  },
  },
  {
    label: 'VIOLENCIA INTRAFAMILIAR',
    anterior: { urc: 1, urn: 2, urs: 1, ure: 0, uro: 0, total: 4 },
    actual:   { urc: 2, urn: 0, urs: 0, ure: 0, uro: 0, total: 2 },
  },
  {
    label: 'LEGÍTIMA DEFENSA',
    anterior: { urc: 0, urn: 0, urs: 0, ure: 1, uro: 0, total: 1 },
    actual:   { urc: 0, urn: 0, urs: 0, ure: 0, uro: 0, total: 0 },
  },
  {
    label: 'OCASIÓN DE ROBO',
    anterior: { urc: 5, urn: 1, urs: 0, ure: 0, uro: 1, total: 7 },
    actual:   { urc: 2, urn: 0, urs: 0, ure: 0, uro: 0, total: 2 },
  },
  {
    label: 'INTERVENCIÓN POLICIAL',
    anterior: { urc: 3, urn: 1, urs: 0, ure: 0, uro: 0, total: 4 },
    actual:   { urc: 1, urn: 0, urs: 0, ure: 0, uro: 0, total: 1 },
  },
  {
    label: 'POSIBLE AJUSTE DE CUENTA',
    anterior: { urc: 3, urn: 0, urs: 0, ure: 0, uro: 0, total: 3 },
    actual:   { urc: 1, urn: 1, urs: 0, ure: 0, uro: 0, total: 2 },
  },
  {
    label: 'FEMICIDIO',
    anterior: { urc: 1, urn: 0, urs: 1, ure: 0, uro: 0, total: 2 },
    actual:   { urc: 6, urn: 1, urs: 0, ure: 0, uro: 0, total: 7 },
  },
  {
    label: 'CONFLICTO PASIONAL',
    anterior: { urc: 0, urn: 0, urs: 0, ure: 0, uro: 0, total: 0 },
    actual:   { urc: 0, urn: 0, urs: 0, ure: 1, uro: 0, total: 1 },
  },
  {
    label: 'RIÑA (V/PÚBLICA Y/O V/PARTICULAR)',
    anterior: { urc: 0, urn: 0, urs: 0, ure: 0, uro: 0, total: 0 },
    actual:   { urc: 0, urn: 0, urs: 1, ure: 0, uro: 0, total: 1 },
  },
  {
    label: 'CONFLICTO EN CONTEXTO DE ENCIERRO',
    anterior: { urc: 2, urn: 0, urs: 0, ure: 0, uro: 0, total: 2 },
    actual:   { urc: 0, urn: 1, urs: 0, ure: 0, uro: 0, total: 1 },
  },
  {
    label: 'PRETERINTENCIONAL',
    anterior: { urc: 1, urn: 0, urs: 0, ure: 0, uro: 0, total: 1 },
    actual:   { urc: 0, urn: 0, urs: 0, ure: 0, uro: 0, total: 0 },
  },
  {
    label: 'CULPOSO (POR OTROS HECHOS)',
    anterior: { urc: 0, urn: 0, urs: 1, ure: 0, uro: 0, total: 1 },
    actual:   { urc: 0, urn: 0, urs: 0, ure: 0, uro: 0, total: 0 },
  },
  {
    label: 'SIN FACTOR DE INCIDENCIA (P/INVEST.)',
    anterior: { urc: 1, urn: 2, urs: 0, ure: 1, uro: 0, total: 4 },
    actual:   { urc: 1, urn: 0, urs: 0, ure: 0, uro: 1, total: 2 },
  },
  {
    label: 'TOTALES POR REGIONAL',
    esTotal: true,
    anterior: { urc: 23, urn: 7, urs: 4, ure: 3, uro: 2, total: 39 },
    actual:   { urc: 14, urn: 3, urs: 1, ure: 2, uro: 1, total: 21 },
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
  const totalActual   = grupos.find(g => g.esTotal)?.actual.total   ?? 0;
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
                  {/* Sub-fila AÑO ANTERIOR */}
                  <tr
                    key={`${idx}-ant`}
                    className={clsx(
                      'border-t transition-colors',
                      isTotal
                        ? 'bg-slate-900 text-white hover:bg-slate-900'
                        : 'border-slate-100 hover:bg-slate-50/70'
                    )}
                  >
                    {/* Label del grupo: ocupa 2 filas */}
                    <td
                      rowSpan={2}
                      className={clsx(
                        'border-r px-4 py-0 font-semibold uppercase tracking-[0.04em]',
                        isTotal
                          ? 'border-slate-700 bg-slate-900 text-white text-xs'
                          : 'border-slate-200 text-slate-800 text-xs'
                      )}
                    >
                      {grupo.label}
                    </td>

                    {/* Año anterior (rojo) */}
                    <td
                      className={clsx(
                        'border-r px-3 py-1.5 text-center text-xs font-bold tabular-nums',
                        isTotal ? 'border-slate-700 text-red-400' : 'border-slate-200 text-red-500'
                      )}
                    >
                      {labelAnterior}
                    </td>

                    {/* Valores UR — anterior */}
                    {(['urc', 'urn', 'urs', 'ure', 'uro'] as const).map(ur => (
                      <CeldaNum
                        key={ur}
                        value={grupo.anterior[ur]}
                        esAnterior
                        esTotal={isTotal}
                      />
                    ))}

                    {/* Total hechos — anterior */}
                    <CeldaNum
                      value={grupo.anterior.total}
                      esAnterior
                      esTotal={isTotal}
                      bold
                    />
                  </tr>

                  {/* Sub-fila AÑO ACTUAL */}
                  <tr
                    key={`${idx}-act`}
                    className={clsx(
                      'border-b transition-colors',
                      isTotal
                        ? 'bg-slate-900 text-white hover:bg-slate-900'
                        : 'border-slate-200 hover:bg-slate-50/70'
                    )}
                  >
                    {/* Año actual (oscuro) */}
                    <td
                      className={clsx(
                        'border-r px-3 py-1.5 text-center text-xs font-semibold tabular-nums',
                        isTotal ? 'border-slate-700 text-slate-300' : 'border-slate-200 text-slate-600'
                      )}
                    >
                      {labelActual}
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
    </div>
  );
}
