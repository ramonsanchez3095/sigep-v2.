import { ReactNode } from 'react';

interface PageHeaderProps {
  titulo: string;
  subtitulo?: string;
  color?: string;
  icon?: ReactNode;
  children?: ReactNode;
}

export function PageHeader({
  titulo,
  subtitulo,
  color = '#1e3a5f',
  icon,
  children,
}: PageHeaderProps) {
  return (
    <div className="mb-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-4">
          {icon && (
            <div
              className="w-12 h-12 rounded-xl flex items-center justify-center text-white shadow-lg"
              style={{ backgroundColor: color }}
            >
              {icon}
            </div>
          )}
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{titulo}</h1>
            {subtitulo && <p className="text-gray-500 mt-1">{subtitulo}</p>}
          </div>
        </div>
        {children && <div className="flex items-center gap-3">{children}</div>}
      </div>
      <div
        className="h-1 w-32 rounded-full mt-4"
        style={{ backgroundColor: color }}
      />
    </div>
  );
}

interface SectionHeaderProps {
  titulo: string;
  subtitulo?: string;
  color?: string;
}

export function SectionHeader({
  titulo,
  subtitulo,
  color = '#1e3a5f',
}: SectionHeaderProps) {
  return (
    <div className="mb-4">
      <div className="flex items-center gap-2">
        <div
          className="w-1 h-6 rounded-full"
          style={{ backgroundColor: color }}
        />
        <h2 className="text-lg font-semibold text-gray-800">{titulo}</h2>
      </div>
      {subtitulo && (
        <p className="text-sm text-gray-500 mt-1 ml-3">{subtitulo}</p>
      )}
    </div>
  );
}
