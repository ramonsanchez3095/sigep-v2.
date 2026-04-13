'use client';

import { useAppStore } from '@/store';
import { signOut } from 'next-auth/react';
import {
  Menu,
  LogOut,
  Calendar,
  Bell,
  Settings,
  Edit3,
  Save,
  History,
} from 'lucide-react';
import clsx from 'clsx';
import Link from 'next/link';
import { DivisionBrand } from '@/components/branding/DivisionBrand';

interface HeaderProps {
  userNombre: string;
  userColor: string;
  userRol: string;
  esSuperAdmin: boolean;
  periodoAnteriorLabel: string;
  periodoActualLabel: string;
}

export function Header({
  userNombre,
  userColor,
  userRol,
  esSuperAdmin,
  periodoAnteriorLabel,
  periodoActualLabel,
}: HeaderProps) {
  const { sidebarOpen, toggleSidebar, edicionHabilitada, toggleEdicion } =
    useAppStore();

  const handleLogout = () => {
    signOut({ callbackUrl: '/login' });
  };

  return (
    <>
      {/* Banner de modo edición */}
      {edicionHabilitada && (
        <div className="fixed top-0 left-0 right-0 h-10 bg-gradient-to-r from-amber-500 to-orange-500 text-white flex items-center justify-center gap-3 z-50 shadow-md">
          <Edit3 size={16} className="animate-pulse" />
          <span className="font-medium text-sm">
            MODO EDICIÓN ACTIVO - Los usuarios pueden modificar los datos
          </span>
          <Edit3 size={16} className="animate-pulse" />
        </div>
      )}

      <header
        className={clsx(
          'fixed right-0 h-16 border-b border-gray-200/80 bg-white/88 backdrop-blur-md shadow-[0_10px_28px_rgba(15,29,48,0.06)] z-40 flex items-center justify-between px-4 lg:px-6 transition-all duration-300',
          edicionHabilitada ? 'top-10' : 'top-0'
        )}
        style={{ left: sidebarOpen ? '288px' : '80px' }}
      >
        {/* Lado izquierdo */}
        <div className="flex min-w-0 items-center gap-3 lg:gap-4">
          <button
            onClick={toggleSidebar}
            className="p-2 rounded-lg hover:bg-gray-100 transition-colors lg:hidden"
          >
            <Menu size={20} className="text-gray-600" />
          </button>

          <DivisionBrand variant="header" className="max-w-[26rem]" />

          <div className="flex min-w-0 items-center gap-2 rounded-2xl border border-gray-200 bg-gray-50/90 px-3 py-2 shadow-sm lg:px-4">
            <Calendar size={18} className="text-policia-primary" />
            <div className="min-w-0 text-sm">
              <span className="text-gray-500">Período comparativo: </span>
              <span className="font-medium text-gray-700 truncate">
                {periodoAnteriorLabel} vs {periodoActualLabel}
              </span>
            </div>
          </div>
        </div>

        {/* Lado derecho */}
        <div className="flex items-center gap-2 lg:gap-3">
          {esSuperAdmin && (
            <>
              <Link
                href="/historial"
                className="p-2 rounded-lg hover:bg-gray-100 transition-colors text-gray-600 hover:text-blue-600"
                title="Ver historial de cambios"
              >
                <History size={20} />
              </Link>

              <button
                className="p-2 rounded-lg hover:bg-gray-100 transition-colors text-gray-600 hover:text-green-600"
                title="Guardar snapshot mensual"
              >
                <Save size={20} />
              </button>

              <button
                onClick={toggleEdicion}
                className={clsx(
                  'p-2 rounded-lg transition-colors flex items-center gap-2',
                  edicionHabilitada
                    ? 'bg-amber-100 text-amber-700 hover:bg-amber-200'
                    : 'hover:bg-gray-100 text-gray-600'
                )}
                title={
                  edicionHabilitada ? 'Desactivar edición' : 'Habilitar edición'
                }
              >
                <Edit3 size={20} />
                <span className="text-xs font-medium hidden md:inline">
                  {edicionHabilitada ? 'Edición ON' : 'Edición OFF'}
                </span>
              </button>

              <div className="h-8 w-px bg-gray-200" />
            </>
          )}

          <button className="p-2 rounded-lg hover:bg-gray-100 transition-colors relative">
            <Bell size={20} className="text-gray-600" />
            <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
          </button>

          <Link
            href="/configuracion"
            className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <Settings size={20} className="text-gray-600" />
          </Link>

          <div className="h-8 w-px bg-gray-200" />

          <div className="flex items-center gap-3">
            <div className="text-right hidden sm:block">
              <p className="text-sm font-medium text-gray-700">{userNombre}</p>
              <p className="text-xs text-gray-500">
                {userRol === 'ADMIN'
                  ? 'Administrador'
                  : userRol === 'EDITOR'
                    ? 'Editor'
                    : 'Visor'}
              </p>
            </div>

            <div
              className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm"
              style={{ backgroundColor: userColor }}
            >
              {userNombre.charAt(0).toUpperCase()}
            </div>

            <button
              onClick={handleLogout}
              className="p-2 rounded-lg hover:bg-red-50 text-gray-600 hover:text-red-600 transition-colors"
              title="Cerrar sesión"
            >
              <LogOut size={20} />
            </button>
          </div>
        </div>
      </header>
    </>
  );
}
