'use client';

import { Filter, X } from 'lucide-react';
import { useMemo } from 'react';

interface Departamento {
  id: string;
  nombre: string;
  codigo: string;
}

interface Tabla {
  id: string;
  nombre: string;
  departamentoId: string;
}

interface FilterBarProps {
  departamentos: Departamento[];
  tablas: Tabla[];
  departamentoId?: string;
  tablaConfigId?: string;
  yoyActivo: boolean;
  onDepartamentoChange: (id: string | undefined) => void;
  onTablaChange: (id: string | undefined) => void;
  onYoYToggle: () => void;
  onReset: () => void;
}

export function FilterBar({
  departamentos,
  tablas,
  departamentoId,
  tablaConfigId,
  yoyActivo,
  onDepartamentoChange,
  onTablaChange,
  onYoYToggle,
  onReset,
}: FilterBarProps) {
  const tablasFiltradas = useMemo(
    () =>
      departamentoId
        ? tablas.filter(t => t.departamentoId === departamentoId)
        : tablas,
    [tablas, departamentoId]
  );

  const hayFiltrosActivos = !!(departamentoId || tablaConfigId);

  return (
    <div className="flex flex-wrap items-center gap-3">
      <Filter size={16} className="text-gray-400" />

      {/* Departamento */}
      <select
        value={departamentoId ?? ''}
        onChange={e =>
          onDepartamentoChange(e.target.value || undefined)
        }
        className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm focus:border-policia-primary focus:ring-1 focus:ring-policia-primary/20 outline-none"
      >
        <option value="">Todos los departamentos</option>
        {departamentos.map(d => (
          <option key={d.id} value={d.id}>
            {d.nombre}
          </option>
        ))}
      </select>

      {/* Tabla */}
      <select
        value={tablaConfigId ?? ''}
        onChange={e => onTablaChange(e.target.value || undefined)}
        className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm focus:border-policia-primary focus:ring-1 focus:ring-policia-primary/20 outline-none"
      >
        <option value="">Todas las tablas</option>
        {tablasFiltradas.map(t => (
          <option key={t.id} value={t.id}>
            {t.nombre}
          </option>
        ))}
      </select>

      {/* YoY Toggle */}
      <button
        onClick={onYoYToggle}
        className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all border ${
          yoyActivo
            ? 'bg-indigo-50 text-indigo-700 border-indigo-200'
            : 'bg-white text-gray-500 border-gray-200 hover:bg-gray-50'
        }`}
      >
        <span className="text-xs">YoY</span>
        Comparativa Interanual
      </button>

      {/* Reset */}
      {hayFiltrosActivos && (
        <button
          onClick={onReset}
          className="flex items-center gap-1 px-3 py-2 rounded-lg text-sm text-red-600 hover:bg-red-50 transition-colors"
        >
          <X size={14} />
          Limpiar
        </button>
      )}
    </div>
  );
}
