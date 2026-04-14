'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAppStore } from '@/store';
import {
  Menu,
  X,
  ChevronDown,
  ChevronRight,
  Users,
  Shield,
  Activity,
  Truck,
  Scale,
  AlertTriangle,
  TreePine,
  Pill,
  Phone,
  Star,
  GraduationCap,
  MapPin,
  Home,
  BarChart3,
  type LucideIcon,
} from 'lucide-react';
import clsx from 'clsx';
import { DivisionBrand } from '@/components/branding/DivisionBrand';

interface MenuItem {
  id: string;
  label: string;
  icon: LucideIcon;
  shieldImg?: string; // ruta relativa a /public, ej: '/shields/d1.png'
  path: string;
  color: string;
  children?: { id: string; label: string; path: string; color: string }[];
}

const menuItems: MenuItem[] = [
  {
    id: 'dashboard',
    label: 'Dashboard',
    icon: Home,
    path: '/dashboard',
    color: '#94a3b8', // Slate-400 for better visibility
  },
  {
    id: 'estadisticas',
    label: 'Estadísticas',
    icon: BarChart3,
    path: '/estadisticas',
    color: '#6366f1', // Indigo-500
  },
  {
    id: 'd1',
    label: 'D-1 Personal',
    icon: Users,
    shieldImg: '/shields/d1.png',
    path: '/d1',
    color: '#60a5fa', // Blue-400 for better visibility
  },
  {
    id: 'd2',
    label: 'D-2 Inteligencia Criminal',
    icon: Shield,
    shieldImg: '/d2.png',
    path: '/d2',
    color: '#8B4513',
  },
  {
    id: 'd3',
    label: 'D-3 Operaciones',
    icon: Activity,
    shieldImg: '/d3.png',
    path: '/d3',
    color: '#0ea5e9',
  },
  {
    id: 'd4',
    label: 'D-4 Logística',
    icon: Truck,
    shieldImg: '/d4.png',
    path: '/d4',
    color: '#3b82f6', // Blue-500 for better visibility
  },
  {
    id: 'd5',
    label: 'D-5 Judicial',
    icon: Scale,
    shieldImg: '/d5.png',
    path: '/d5',
    color: '#d69e2e',
  },
  {
    id: 'asuntos_internos',
    label: 'Asuntos Internos',
    icon: AlertTriangle,
    shieldImg: '/ASUNTOS INT.png',
    path: '/asuntos_internos',
    color: '#818cf8', // Indigo-400 for better visibility
  },
  {
    id: 'delitos_rurales',
    label: 'Delitos Rurales',
    icon: TreePine,
    shieldImg: '/DELITOSRURALES.png',
    path: '/delitos_rurales',
    color: '#166534',
  },
  {
    id: 'digedrop',
    label: 'DIGEDROP',
    icon: Pill,
    shieldImg: '/DIGEDROP.png',
    path: '/digedrop',
    color: '#dc2626',
  },
  {
    id: 'prevencion_ciudadana',
    label: 'Prevención Ciudadana',
    icon: Phone,
    shieldImg: '/PREVENCION.png',
    path: '/prevencion_ciudadana',
    color: '#22c55e',
  },
  {
    id: 'unidades_especiales',
    label: 'Unidades Especiales',
    icon: Star,
    shieldImg: '/UNI ESP.png',
    path: '/unidades_especiales',
    color: '#ea580c',
  },
  {
    id: 'institutos',
    label: 'Institutos e Instrucción',
    icon: GraduationCap,
    shieldImg: '/INSTITUCIONES.png',
    path: '/institutos',
    color: '#7c3aed',
  },
  {
    id: 'unidades_regionales',
    label: 'Unidades Regionales',
    icon: MapPin,
    path: '/unidades_regionales',
    color: '#94a3b8', // Slate-400 for better visibility
    children: [
      {
        id: 'ur_capital',
        label: 'UR Capital',
        path: '/unidades_regionales/capital',
        color: '#3b82f6',
      },
      {
        id: 'ur_norte',
        label: 'UR Norte',
        path: '/unidades_regionales/norte',
        color: '#10b981',
      },
      {
        id: 'ur_sur',
        label: 'UR Sur',
        path: '/unidades_regionales/sur',
        color: '#f97316',
      },
      {
        id: 'ur_este',
        label: 'UR Este',
        path: '/unidades_regionales/este',
        color: '#8b5cf6',
      },
      {
        id: 'ur_oeste',
        label: 'UR Oeste',
        path: '/unidades_regionales/oeste',
        color: '#ef4444',
      },
    ],
  },
];

interface SidebarProps {
  userNombre: string;
  userColor: string;
  userDepartamento: string;
  userPermisos: string[];
}

export function Sidebar({
  userNombre,
  userColor,
  userDepartamento,
  userPermisos,
}: SidebarProps) {
  const pathname = usePathname();
  const { sidebarOpen, toggleSidebar } = useAppStore();
  const [expandedMenus, setExpandedMenus] = useState<string[]>([
    'unidades_regionales',
  ]);

  const toggleExpanded = (id: string) => {
    setExpandedMenus(prev =>
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  const hasPermission = (permission: string) => {
    if (userPermisos.includes('all')) return true;
    return userPermisos.includes(permission);
  };

  const canAccessItem = (itemId: string) => {
    if (hasPermission('all')) return true;
    if (itemId === 'dashboard') return true;
    return hasPermission(itemId);
  };

  const isActive = (path: string) =>
    pathname === path || pathname.startsWith(path + '/');

  return (
    <aside
      className={clsx(
        'fixed left-0 top-0 h-full bg-policia-primary text-white transition-all duration-300 z-50 flex flex-col',
        sidebarOpen ? 'w-72' : 'w-20'
      )}
    >
      {/* Logo y toggle */}
      <div className="border-b border-white/10 p-4">
        <div
          className={clsx(
            'flex items-start gap-3',
            !sidebarOpen && 'justify-center'
          )}
        >
          <DivisionBrand
            collapsed={!sidebarOpen}
            className={clsx('animate-fadeIn', sidebarOpen ? 'w-full' : 'w-auto')}
          />

          {sidebarOpen && (
            <button
              onClick={toggleSidebar}
              className="rounded-2xl border border-white/10 bg-white/5 p-2 text-white/80 hover:bg-white/10 hover:text-white transition-colors"
              title="Contraer menú lateral"
            >
              <X size={20} />
            </button>
          )}
        </div>

        {!sidebarOpen && (
          <button
            onClick={toggleSidebar}
            className="mt-3 flex w-full items-center justify-center rounded-2xl border border-white/10 bg-white/5 p-3 text-white/80 hover:bg-white/10 hover:text-white transition-colors"
            title="Expandir menú lateral"
          >
            <Menu size={22} />
          </button>
        )}
      </div>

      {/* Menú de navegación */}
      <nav className="flex-1 overflow-y-auto scrollbar-thin py-4">
        {menuItems.map(item => {
          if (!canAccessItem(item.id) && item.id !== 'dashboard') return null;

          const Icon = item.icon;
          const hasChildren = item.children && item.children.length > 0;
          const isExpanded = expandedMenus.includes(item.id);
          const active = isActive(item.path);

          return (
            <div key={item.id} className="px-3 mb-1">
              {hasChildren ? (
                <button
                  onClick={() => {
                    toggleExpanded(item.id);
                    if (!sidebarOpen) toggleSidebar();
                  }}
                  className={clsx(
                    'w-full sidebar-item',
                    active && 'active',
                    !sidebarOpen && 'justify-center px-2'
                  )}
                  style={{
                    borderLeft: active
                      ? `4px solid ${item.color}`
                      : '4px solid transparent',
                  }}
                >
                  <Icon size={20} style={{ color: item.color }} />
                  {sidebarOpen && (
                    <>
                      <span className="flex-1 text-left text-sm">
                        {item.label}
                      </span>
                      {isExpanded ? (
                        <ChevronDown size={16} />
                      ) : (
                        <ChevronRight size={16} />
                      )}
                    </>
                  )}
                </button>
              ) : (
                <Link
                  href={item.path}
                  className={clsx(
                    'w-full sidebar-item',
                    active && 'active',
                    !sidebarOpen && 'justify-center px-2'
                  )}
                  style={{
                    borderLeft: active
                      ? `4px solid ${item.color}`
                      : '4px solid transparent',
                  }}
                >
                  {item.shieldImg ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={item.shieldImg}
                      alt={item.label}
                      width={22}
                      height={22}
                      className="shrink-0 object-contain"
                    />
                  ) : (
                    <Icon size={20} style={{ color: item.color }} />
                  )}
                  {sidebarOpen && (
                    <span className="flex-1 text-left text-sm">
                      {item.label}
                    </span>
                  )}
                </Link>
              )}

              {/* Submenú */}
              {hasChildren && isExpanded && sidebarOpen && (
                <div className="ml-6 mt-1 space-y-1 animate-fadeIn">
                  {item.children!.map(child => {
                    if (!canAccessItem(child.id) && !hasPermission('all'))
                      return null;
                    const childActive = pathname === child.path;
                    return (
                      <Link
                        key={child.id}
                        href={child.path}
                        className={clsx(
                          'block text-left px-4 py-2 rounded-lg text-sm transition-all hover:bg-white/10',
                          childActive && 'bg-white/20 font-medium'
                        )}
                        style={{
                          borderLeft: `3px solid ${child.color}`,
                          marginLeft: '8px',
                        }}
                      >
                        {child.label}
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </nav>

      {/* Usuario actual */}
      {sidebarOpen && (
        <div className="p-4 border-t border-white/10">
          <div className="flex items-center gap-3 p-3 rounded-lg bg-white/5">
            <div
              className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold shrink-0"
              style={{ backgroundColor: userColor }}
            >
              {userNombre.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{userNombre}</p>
              <p className="text-xs text-white/60 truncate">
                {userDepartamento}
              </p>
            </div>
          </div>
        </div>
      )}
    </aside>
  );
}
