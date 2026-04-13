'use client';

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ReferenceLine,
} from 'recharts';

const fmtNumber = (value: unknown) =>
  new Intl.NumberFormat('es-AR').format(Number(value ?? 0));

interface TrendDataItem {
  nombre: string;
  valor: number;
  tipo: 'historico' | 'proyeccion';
}

interface TrendChartProps {
  datos: TrendDataItem[];
  height?: number;
  colorHistorico?: string;
  colorProyeccion?: string;
}

export function TrendChart({
  datos,
  height = 350,
  colorHistorico = '#1e3a5f',
  colorProyeccion = '#8b5cf6',
}: TrendChartProps) {
  // Separar líneas: histórico lleno, proyección solo donde corresponde
  const datosGrafico = datos.map(d => ({
    nombre: d.nombre,
    historico: d.tipo === 'historico' ? d.valor : undefined,
    proyeccion: d.valor, // línea completa para continuar desde el último punto
  }));

  // Punto donde empieza la proyección
  const indexProyeccion = datos.findIndex(d => d.tipo === 'proyeccion');
  // Solo mostrar la línea de proyección desde el penúltimo punto histórico
  const datosConProyeccion = datosGrafico.map((d, i) => ({
    ...d,
    proyeccion:
      i >= indexProyeccion - 1 ? d.proyeccion : undefined,
  }));

  return (
    <ResponsiveContainer width="100%" height={height}>
      <LineChart
        data={datosConProyeccion}
        margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
      >
        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
        <XAxis dataKey="nombre" tick={{ fontSize: 11 }} angle={-30} textAnchor="end" height={60} />
        <YAxis tick={{ fontSize: 12 }} />
        <Tooltip
          contentStyle={{
            backgroundColor: 'white',
            border: '1px solid #e5e7eb',
            borderRadius: '8px',
            boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
          }}
          formatter={fmtNumber}
        />
        <Legend />

        {/* Línea histórica (sólida) */}
        <Line
          type="monotone"
          dataKey="historico"
          name="Histórico"
          stroke={colorHistorico}
          strokeWidth={2.5}
          dot={{ fill: colorHistorico, strokeWidth: 2, r: 4 }}
          activeDot={{ r: 6 }}
          connectNulls={false}
        />

        {/* Línea de proyección (punteada) */}
        <Line
          type="monotone"
          dataKey="proyeccion"
          name="Proyección"
          stroke={colorProyeccion}
          strokeWidth={2.5}
          strokeDasharray="8 4"
          dot={{ fill: colorProyeccion, strokeWidth: 2, r: 5 }}
          activeDot={{ r: 7 }}
          connectNulls={false}
        />

        {indexProyeccion > 0 && (
          <ReferenceLine
            x={datos[indexProyeccion - 1]?.nombre}
            stroke="#94a3b8"
            strokeDasharray="3 3"
            label={{ value: 'Inicio proyección', position: 'top', fontSize: 10 }}
          />
        )}
      </LineChart>
    </ResponsiveContainer>
  );
}
