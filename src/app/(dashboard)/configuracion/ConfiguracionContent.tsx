'use client';

import { useState, useTransition } from 'react';
import { PageHeader } from '@/components/ui/PageHeader';
import {
  Settings,
  Calendar,
  Users,
  Plus,
  Check,
  X,
  Shield,
  Eye,
  Edit3,
  KeyRound,
  CalendarRange,
} from 'lucide-react';
import {
  crearPeriodo,
  activarPeriodo,
  crearUsuario,
  toggleUsuarioActivo,
} from '@/actions/configuracion';
import { resetTotpUsuario } from '@/actions/totp';

interface Periodo {
  id: string;
  anteriorInicio: Date;
  anteriorFin: Date;
  anteriorLabel: string;
  actualInicio: Date;
  actualFin: Date;
  actualLabel: string;
  activo: boolean;
  createdAt: Date;
}

interface Usuario {
  id: string;
  username: string;
  nombre: string;
  rol: string;
  departamentoId: string | null;
  activo: boolean;
  totpEnabled: boolean;
  createdAt: Date;
}

interface Departamento {
  id: string;
  nombre: string;
  codigo: string;
}

interface Props {
  periodos: Periodo[];
  usuarios: Usuario[];
  departamentos: Departamento[];
}

const rolIcons: Record<string, typeof Shield> = {
  ADMIN: Shield,
  EDITOR: Edit3,
  VIEWER: Eye,
};

const rolColors: Record<string, string> = {
  ADMIN: 'bg-red-100 text-red-700',
  EDITOR: 'bg-blue-100 text-blue-700',
  VIEWER: 'bg-gray-100 text-gray-600',
};

const MESES = [
  'Enero',
  'Febrero',
  'Marzo',
  'Abril',
  'Mayo',
  'Junio',
  'Julio',
  'Agosto',
  'Septiembre',
  'Octubre',
  'Noviembre',
  'Diciembre',
];

function getPeriodoMesEstadisticoDefaults() {
  const ahora = new Date();
  const actualMes = ahora.getMonth() + 1;
  const actualAnio = ahora.getFullYear();
  const fechaAnterior = new Date(actualAnio, ahora.getMonth() - 1, 1);

  return {
    actualMes,
    actualAnio,
    anteriorMes: fechaAnterior.getMonth() + 1,
    anteriorAnio: fechaAnterior.getFullYear(),
  };
}

export function ConfiguracionContent({
  periodos,
  usuarios,
  departamentos,
}: Props) {
  const periodoMesEstadisticoDefaults = getPeriodoMesEstadisticoDefaults();
  const [tab, setTab] = useState<'periodos' | 'usuarios'>('periodos');
  const [isPending, startTransition] = useTransition();

  // Nuevo período
  const [showNuevoPeriodo, setShowNuevoPeriodo] = useState(false);
  const [modoPeriodo, setModoPeriodo] = useState<'manual' | 'mes-estadistico'>('mes-estadistico');
  const [periodoAnt, setPeriodoAnt] = useState('');
  const [periodoAct, setPeriodoAct] = useState('');
  const [anteriorMes, setAnteriorMes] = useState(periodoMesEstadisticoDefaults.anteriorMes);
  const [anteriorAnio, setAnteriorAnio] = useState(periodoMesEstadisticoDefaults.anteriorAnio);
  const [actualMes, setActualMes] = useState(periodoMesEstadisticoDefaults.actualMes);
  const [actualAnio, setActualAnio] = useState(periodoMesEstadisticoDefaults.actualAnio);

  // Nuevo usuario
  const [showNuevoUsuario, setShowNuevoUsuario] = useState(false);
  const [nuevoUser, setNuevoUser] = useState({
    username: '',
    password: '',
    nombre: '',
    rol: 'VIEWER' as 'ADMIN' | 'EDITOR' | 'VIEWER',
    departamentoId: '',
  });

  const resetPeriodoForm = () => {
    const defaults = getPeriodoMesEstadisticoDefaults();
    setModoPeriodo('mes-estadistico');
    setPeriodoAnt('');
    setPeriodoAct('');
    setAnteriorMes(defaults.anteriorMes);
    setAnteriorAnio(defaults.anteriorAnio);
    setActualMes(defaults.actualMes);
    setActualAnio(defaults.actualAnio);
  };

  const handleToggleNuevoPeriodo = () => {
    if (showNuevoPeriodo) {
      setShowNuevoPeriodo(false);
      return;
    }

    resetPeriodoForm();
    setShowNuevoPeriodo(true);
  };

  const handleCloseNuevoPeriodo = () => {
    resetPeriodoForm();
    setShowNuevoPeriodo(false);
  };

  const handleCrearPeriodo = () => {
    startTransition(async () => {
      if (modoPeriodo === 'manual') {
        if (!periodoAnt.trim() || !periodoAct.trim()) return;
        await crearPeriodo({
          modo: 'manual',
          periodoAnterior: periodoAnt,
          periodoActual: periodoAct,
        });
      } else {
        await crearPeriodo({
          modo: 'mes-estadistico',
          anteriorMes,
          anteriorAnio,
          actualMes,
          actualAnio,
        });
      }

      handleCloseNuevoPeriodo();
    });
  };

  const formatFecha = (fecha: Date) =>
    new Date(fecha).toLocaleDateString('es-AR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });

  const previewMesEstadistico = `Mes estadístico ${MESES[anteriorMes - 1]} ${anteriorAnio} vs Mes estadístico ${MESES[actualMes - 1]} ${actualAnio}`;

  const handleActivar = (id: string) => {
    startTransition(async () => {
      await activarPeriodo(id);
    });
  };

  const handleCrearUsuario = () => {
    if (!nuevoUser.username || !nuevoUser.password || !nuevoUser.nombre) return;
    startTransition(async () => {
      await crearUsuario({
        ...nuevoUser,
        departamentoId: nuevoUser.departamentoId || undefined,
      });
      setNuevoUser({
        username: '',
        password: '',
        nombre: '',
        rol: 'VIEWER',
        departamentoId: '',
      });
      setShowNuevoUsuario(false);
    });
  };

  const handleToggleActivo = (id: string, activo: boolean) => {
    startTransition(async () => {
      await toggleUsuarioActivo(id, !activo);
    });
  };

  const handleResetTotp = (id: string) => {
    if (!confirm('¿Está seguro de resetear el 2FA de este usuario? Deberá configurarlo nuevamente al iniciar sesión.')) return;
    startTransition(async () => {
      await resetTotpUsuario(id);
    });
  };

  return (
    <div>
      <PageHeader
        titulo="Configuración"
        subtitulo="Gestión de períodos y usuarios del sistema"
        color="#c9a94e"
        icon={<Settings size={24} />}
      />

      {/* Tabs */}
      <div className="flex gap-1 mb-6 bg-gray-100 rounded-lg p-1 w-fit">
        <button
          onClick={() => setTab('periodos')}
          className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
            tab === 'periodos'
              ? 'bg-white text-policia-primary shadow-sm'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          <Calendar size={16} />
          Períodos
        </button>
        <button
          onClick={() => setTab('usuarios')}
          className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
            tab === 'usuarios'
              ? 'bg-white text-policia-primary shadow-sm'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          <Users size={16} />
          Usuarios
        </button>
      </div>

      {/* Períodos */}
      {tab === 'periodos' && (
        <div>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold text-gray-800">
              Períodos Comparativos
            </h2>
            <button
              onClick={handleToggleNuevoPeriodo}
              className="btn-primary flex items-center gap-2 text-sm"
            >
              <Plus size={16} />
              Nuevo Período
            </button>
          </div>

          {showNuevoPeriodo && (
            <div className="card p-4 mb-4 border-2 border-policia-secondary">
              <div className="mb-4 flex flex-wrap gap-2 rounded-lg bg-gray-100 p-1 w-fit">
                <button
                  onClick={() => setModoPeriodo('mes-estadistico')}
                  className={`flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                    modoPeriodo === 'mes-estadistico'
                      ? 'bg-white text-policia-primary shadow-sm'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  <CalendarRange size={16} />
                  Mes estadístico
                </button>
                <button
                  onClick={() => setModoPeriodo('manual')}
                  className={`flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                    modoPeriodo === 'manual'
                      ? 'bg-white text-policia-primary shadow-sm'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  <Edit3 size={16} />
                  Etiqueta manual
                </button>
              </div>

              {modoPeriodo === 'mes-estadistico' ? (
                <>
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
                    <div className="rounded-xl border border-gray-200 p-4 bg-gray-50/80">
                      <label className="block text-sm font-medium text-gray-700 mb-3">
                        Mes estadístico anterior
                      </label>
                      <div className="grid grid-cols-2 gap-3">
                        <select
                          className="input-field w-full"
                          value={anteriorMes}
                          onChange={e => setAnteriorMes(Number(e.target.value))}
                        >
                          {MESES.map((mes, index) => (
                            <option key={mes} value={index + 1}>
                              {mes}
                            </option>
                          ))}
                        </select>
                        <input
                          type="number"
                          className="input-field w-full"
                          min={2000}
                          max={2100}
                          value={anteriorAnio}
                          onChange={e => setAnteriorAnio(Number(e.target.value) || new Date().getFullYear())}
                        />
                      </div>
                    </div>

                    <div className="rounded-xl border border-gray-200 p-4 bg-gray-50/80">
                      <label className="block text-sm font-medium text-gray-700 mb-3">
                        Mes estadístico actual
                      </label>
                      <div className="grid grid-cols-2 gap-3">
                        <select
                          className="input-field w-full"
                          value={actualMes}
                          onChange={e => setActualMes(Number(e.target.value))}
                        >
                          {MESES.map((mes, index) => (
                            <option key={mes} value={index + 1}>
                              {mes}
                            </option>
                          ))}
                        </select>
                        <input
                          type="number"
                          className="input-field w-full"
                          min={2000}
                          max={2100}
                          value={actualAnio}
                          onChange={e => setActualAnio(Number(e.target.value) || new Date().getFullYear())}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="rounded-xl border border-dashed border-policia-secondary/50 bg-policia-secondary/5 px-4 py-3 mb-4">
                    <p className="text-sm font-medium text-gray-700">
                      Comparación a crear
                    </p>
                    <p className="text-sm text-gray-600 mt-1">{previewMesEstadistico}</p>
                  </div>
                </>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Período Anterior
                    </label>
                    <input
                      type="text"
                      className="input-field w-full"
                      placeholder="Ej: Gestión 2025"
                      value={periodoAnt}
                      onChange={e => setPeriodoAnt(e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Período Actual
                    </label>
                    <input
                      type="text"
                      className="input-field w-full"
                      placeholder="Ej: Gestión 2026"
                      value={periodoAct}
                      onChange={e => setPeriodoAct(e.target.value)}
                    />
                  </div>
                </div>
              )}

              <div className="flex gap-2 justify-end">
                <button
                  onClick={handleCloseNuevoPeriodo}
                  className="btn-secondary text-sm"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleCrearPeriodo}
                  disabled={isPending}
                  className="btn-primary text-sm"
                >
                  {isPending ? 'Guardando...' : 'Crear Período'}
                </button>
              </div>
            </div>
          )}

          <div className="space-y-3">
            {periodos.map(p => (
              <div
                key={p.id}
                className={`card p-4 flex items-center justify-between ${p.activo ? 'border-2 border-green-400' : ''}`}
              >
                <div className="flex items-center gap-4">
                  {p.activo && (
                    <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-green-100 text-green-700">
                      ACTIVO
                    </span>
                  )}
                  <div>
                    <span className="text-sm font-medium text-gray-800">
                      {p.anteriorLabel}
                    </span>
                    <span className="mx-2 text-gray-400">→</span>
                    <span className="text-sm font-medium text-gray-800">
                      {p.actualLabel}
                    </span>
                    <p className="text-xs text-gray-500 mt-1">
                      {formatFecha(p.anteriorInicio)} al {formatFecha(p.anteriorFin)}
                      {' · '}
                      {formatFecha(p.actualInicio)} al {formatFecha(p.actualFin)}
                    </p>
                  </div>
                  <span className="text-xs text-gray-400">
                    {new Date(p.createdAt).toLocaleDateString('es-AR')}
                  </span>
                </div>
                {!p.activo && (
                  <button
                    onClick={() => handleActivar(p.id)}
                    disabled={isPending}
                    className="flex items-center gap-1 text-sm text-green-600 hover:text-green-700 font-medium"
                  >
                    <Check size={14} />
                    Activar
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Usuarios */}
      {tab === 'usuarios' && (
        <div>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold text-gray-800">
              Usuarios del Sistema
            </h2>
            <button
              onClick={() => setShowNuevoUsuario(!showNuevoUsuario)}
              className="btn-primary flex items-center gap-2 text-sm"
            >
              <Plus size={16} />
              Nuevo Usuario
            </button>
          </div>

          {showNuevoUsuario && (
            <div className="card p-4 mb-4 border-2 border-policia-secondary">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Usuario
                  </label>
                  <input
                    type="text"
                    className="input-field w-full"
                    value={nuevoUser.username}
                    onChange={e =>
                      setNuevoUser({ ...nuevoUser, username: e.target.value })
                    }
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Contraseña
                  </label>
                  <input
                    type="password"
                    className="input-field w-full"
                    value={nuevoUser.password}
                    onChange={e =>
                      setNuevoUser({ ...nuevoUser, password: e.target.value })
                    }
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nombre Completo
                  </label>
                  <input
                    type="text"
                    className="input-field w-full"
                    value={nuevoUser.nombre}
                    onChange={e =>
                      setNuevoUser({ ...nuevoUser, nombre: e.target.value })
                    }
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Rol
                  </label>
                  <select
                    className="input-field w-full"
                    value={nuevoUser.rol}
                    onChange={e =>
                      setNuevoUser({
                        ...nuevoUser,
                        rol: e.target.value as 'ADMIN' | 'EDITOR' | 'VIEWER',
                      })
                    }
                  >
                    <option value="VIEWER">Visualizador</option>
                    <option value="EDITOR">Editor</option>
                    <option value="ADMIN">Administrador</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Departamento
                  </label>
                  <select
                    className="input-field w-full"
                    value={nuevoUser.departamentoId}
                    onChange={e =>
                      setNuevoUser({
                        ...nuevoUser,
                        departamentoId: e.target.value,
                      })
                    }
                  >
                    <option value="">Todos (Admin)</option>
                    {departamentos.map(d => (
                      <option key={d.id} value={d.id}>
                        {d.nombre}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="flex gap-2 justify-end">
                <button
                  onClick={() => setShowNuevoUsuario(false)}
                  className="btn-secondary text-sm"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleCrearUsuario}
                  disabled={isPending}
                  className="btn-primary text-sm"
                >
                  {isPending ? 'Creando...' : 'Crear Usuario'}
                </button>
              </div>
            </div>
          )}

          <div className="card overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="table-header">
                  <th className="table-cell font-semibold text-left">Nombre</th>
                  <th className="table-cell font-semibold text-left">
                    Usuario
                  </th>
                  <th className="table-cell font-semibold text-left">Rol</th>
                  <th className="table-cell font-semibold text-left">Estado</th>
                  <th className="table-cell font-semibold text-left">2FA</th>
                  <th className="table-cell font-semibold text-left">Creado</th>
                  <th className="table-cell font-semibold text-center">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody>
                {usuarios.map(u => {
                  const RolIcon = rolIcons[u.rol] || Eye;
                  return (
                    <tr
                      key={u.id}
                      className="border-b border-gray-100 hover:bg-gray-50 transition-colors"
                    >
                      <td className="table-cell text-sm font-medium text-gray-800">
                        {u.nombre}
                      </td>
                      <td className="table-cell text-sm text-gray-600 font-mono">
                        {u.username}
                      </td>
                      <td className="table-cell text-sm">
                        <span
                          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${rolColors[u.rol]}`}
                        >
                          <RolIcon size={12} />
                          {u.rol}
                        </span>
                      </td>
                      <td className="table-cell text-sm">
                        <span
                          className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                            u.activo
                              ? 'bg-green-100 text-green-700'
                              : 'bg-red-100 text-red-700'
                          }`}
                        >
                          {u.activo ? 'Activo' : 'Inactivo'}
                        </span>
                      </td>
                      <td className="table-cell text-sm">
                        {u.totpEnabled ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-700">
                            <KeyRound size={12} />
                            Activo
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-700">
                            Pendiente
                          </span>
                        )}
                      </td>
                      <td className="table-cell text-sm text-gray-400">
                        {new Date(u.createdAt).toLocaleDateString('es-AR')}
                      </td>
                      <td className="table-cell text-center">
                        <div className="flex items-center justify-center gap-1">
                          <button
                            onClick={() => handleToggleActivo(u.id, u.activo)}
                            disabled={isPending}
                            className={`text-xs font-medium px-3 py-1 rounded-md transition-colors ${
                              u.activo
                                ? 'text-red-600 hover:bg-red-50'
                                : 'text-green-600 hover:bg-green-50'
                            }`}
                          >
                            {u.activo ? (
                              <span className="flex items-center gap-1">
                                <X size={12} /> Desactivar
                              </span>
                            ) : (
                              <span className="flex items-center gap-1">
                                <Check size={12} /> Activar
                              </span>
                            )}
                          </button>
                          {u.totpEnabled && (
                            <button
                              onClick={() => handleResetTotp(u.id)}
                              disabled={isPending}
                              className="text-xs font-medium px-3 py-1 rounded-md text-orange-600 hover:bg-orange-50 transition-colors"
                            >
                              <span className="flex items-center gap-1">
                                <KeyRound size={12} /> Reset 2FA
                              </span>
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
