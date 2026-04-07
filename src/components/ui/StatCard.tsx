import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import clsx from 'clsx';
import { ReactNode } from 'react';

interface StatCardProps {
  titulo: string;
  valor: number | string;
  valorAnterior?: number;
  porcentaje?: number;
  color?: string;
  icon?: ReactNode;
  formato?: 'numero' | 'porcentaje' | 'moneda';
  subtitulo?: string;
}

export function StatCard({
  titulo,
  valor,
  valorAnterior,
  porcentaje,
  color = '#1e3a5f',
  icon,
  formato = 'numero',
  subtitulo,
}: StatCardProps) {
  const formatValue = (val: number | string) => {
    if (typeof val === 'string') return val;
    switch (formato) {
      case 'porcentaje':
        return `${val.toFixed(2)}%`;
      case 'moneda':
        return new Intl.NumberFormat('es-AR', {
          style: 'currency',
          currency: 'ARS',
          maximumFractionDigits: 0,
        }).format(val);
      default:
        return new Intl.NumberFormat('es-AR').format(val);
    }
  };

  const getTrend = () => {
    if (porcentaje === undefined || porcentaje === 0)
      return {
        icon: <Minus size={16} />,
        color: 'text-gray-500',
        bg: 'bg-gray-100',
      };
    if (porcentaje > 0)
      return {
        icon: <TrendingUp size={16} />,
        color: 'text-green-600',
        bg: 'bg-green-100',
      };
    return {
      icon: <TrendingDown size={16} />,
      color: 'text-red-600',
      bg: 'bg-red-100',
    };
  };

  const trend = getTrend();

  return (
    <div className="card p-6 hover:shadow-lg transition-shadow duration-200">
      <div className="flex items-start justify-between mb-4">
        <div>
          <p className="text-sm text-gray-500 font-medium">{titulo}</p>
          {subtitulo && (
            <p className="text-xs text-gray-400 mt-0.5">{subtitulo}</p>
          )}
        </div>
        {icon && (
          <div
            className="w-10 h-10 rounded-lg flex items-center justify-center"
            style={{ backgroundColor: `${color}15` }}
          >
            <span style={{ color }}>{icon}</span>
          </div>
        )}
      </div>
      <div className="flex items-end justify-between">
        <div>
          <p className="text-3xl font-bold text-gray-900">
            {formatValue(valor)}
          </p>
          {valorAnterior !== undefined && (
            <p className="text-sm text-gray-400 mt-1">
              Anterior: {formatValue(valorAnterior)}
            </p>
          )}
        </div>
        {porcentaje !== undefined && (
          <div
            className={clsx(
              'flex items-center gap-1 px-2.5 py-1 rounded-full text-sm font-medium',
              trend.bg,
              trend.color
            )}
          >
            {trend.icon}
            <span>
              {porcentaje > 0 ? '+' : ''}
              {porcentaje}%
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
