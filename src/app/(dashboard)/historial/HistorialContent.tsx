'use client';

import { useState } from 'react';
import { PageHeader } from '@/components/ui/PageHeader';
import { Clock, Search, Filter } from 'lucide-react';

interface Cambio {
  id: string;
  campo: string;
  valorAnterior: string;
  valorNuevo: string;
  fecha: Date;
  tablaConfigId: string;
  tablaNombre: string | null;
  tablaTablaId: string | null;
  usuarioId: string;
  usuarioNombre: string | null;
}

interface Props {
  cambios: Cambio[];
}

export function HistorialContent({ cambios }: Props) {
  const [busqueda, setBusqueda] = useState('');
  const [filtroCampo, setFiltroCampo] = useState<string>('todos');

  const filtrados = cambios.filter(c => {
    const matchBusqueda =
      !busqueda ||
      c.tablaNombre?.toLowerCase().includes(busqueda.toLowerCase()) ||
      c.usuarioNombre?.toLowerCase().includes(busqueda.toLowerCase()) ||
      c.valorAnterior?.toLowerCase().includes(busqueda.toLowerCase()) ||
      c.valorNuevo?.toLowerCase().includes(busqueda.toLowerCase());

    const matchCampo = filtroCampo === 'todos' || c.campo === filtroCampo;

    return matchBusqueda && matchCampo;
  });

  return (
    <div>
      <PageHeader
        titulo="Historial de Cambios"
        subtitulo="Registro de todas las modificaciones realizadas"
        color="#8b5cf6"
        icon={<Clock size={24} />}
      />

      {/* Filtros */}
      <div className="card p-4 mb-6 flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search
            size={18}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
          />
          <input
            type="text"
            placeholder="Buscar por tabla, usuario o valor..."
            className="input-field pl-10 w-full"
            value={busqueda}
            onChange={e => setBusqueda(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-2">
          <Filter size={18} className="text-gray-400" />
          <select
            className="input-field"
            value={filtroCampo}
            onChange={e => setFiltroCampo(e.target.value)}
          >
            <option value="todos">Todos los campos</option>
            <option value="PERIODO_ANTERIOR">Período Anterior</option>
            <option value="PERIODO_ACTUAL">Período Actual</option>
          </select>
        </div>
      </div>

      {/* Tabla */}
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="table-header">
                <th className="table-cell font-semibold text-left">
                  Fecha y Hora
                </th>
                <th className="table-cell font-semibold text-left">Usuario</th>
                <th className="table-cell font-semibold text-left">Tabla</th>
                <th className="table-cell font-semibold text-left">Campo</th>
                <th className="table-cell font-semibold text-right">
                  Valor Anterior
                </th>
                <th className="table-cell font-semibold text-right">
                  Valor Nuevo
                </th>
              </tr>
            </thead>
            <tbody>
              {filtrados.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-12 text-gray-400">
                    No se encontraron cambios
                  </td>
                </tr>
              ) : (
                filtrados.map(c => (
                  <tr
                    key={c.id}
                    className="border-b border-gray-100 hover:bg-gray-50 transition-colors"
                  >
                    <td className="table-cell text-sm text-gray-600 whitespace-nowrap">
                      {new Date(c.fecha).toLocaleDateString('es-AR', {
                        day: '2-digit',
                        month: '2-digit',
                        year: 'numeric',
                      })}{' '}
                      <span className="text-gray-400">
                        {new Date(c.fecha).toLocaleTimeString('es-AR', {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                    </td>
                    <td className="table-cell text-sm font-medium text-gray-800">
                      {c.usuarioNombre || '—'}
                    </td>
                    <td className="table-cell text-sm text-gray-700">
                      {c.tablaNombre || '—'}
                    </td>
                    <td className="table-cell text-sm">
                      <span
                        className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                          c.campo === 'PERIODO_ACTUAL'
                            ? 'bg-blue-100 text-blue-700'
                            : 'bg-amber-100 text-amber-700'
                        }`}
                      >
                        {c.campo === 'PERIODO_ACTUAL'
                          ? 'P. Actual'
                          : 'P. Anterior'}
                      </span>
                    </td>
                    <td className="table-cell text-sm text-right text-red-500 font-mono">
                      {c.valorAnterior != null
                        ? new Intl.NumberFormat('es-AR').format(
                            Number(c.valorAnterior)
                          )
                        : '—'}
                    </td>
                    <td className="table-cell text-sm text-right text-green-600 font-mono">
                      {c.valorNuevo != null
                        ? new Intl.NumberFormat('es-AR').format(
                            Number(c.valorNuevo)
                          )
                        : '—'}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
