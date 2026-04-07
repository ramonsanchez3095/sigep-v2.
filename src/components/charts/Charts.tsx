'use client';

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  AreaChart,
  Area,
} from 'recharts';

const fmtNumber = (value: unknown) =>
  new Intl.NumberFormat('es-AR').format(Number(value ?? 0));
interface ChartContainerProps {
  titulo: string;
  children: React.ReactNode;
  className?: string;
}

export function ChartContainer({
  titulo,
  children,
  className,
}: ChartContainerProps) {
  return (
    <div className={`card ${className ?? ''}`}>
      <div className="card-header">{titulo}</div>
      <div className="card-body">{children}</div>
    </div>
  );
}

/* ── Bar Chart Comparativo ── */
interface BarChartComparativoProps {
  datos: Array<{ nombre: string; anterior: number; actual: number }>;
  colorAnterior?: string;
  colorActual?: string;
  height?: number;
}

export function BarChartComparativo({
  datos,
  colorAnterior = '#94a3b8',
  colorActual = '#1e3a5f',
  height = 300,
}: BarChartComparativoProps) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart
        data={datos}
        margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
      >
        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
        <XAxis dataKey="nombre" tick={{ fontSize: 12 }} />
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
        <Bar
          dataKey="anterior"
          name="Período Anterior"
          fill={colorAnterior}
          radius={[4, 4, 0, 0]}
        />
        <Bar
          dataKey="actual"
          name="Período Actual"
          fill={colorActual}
          radius={[4, 4, 0, 0]}
        />
      </BarChart>
    </ResponsiveContainer>
  );
}

/* ── Pie Chart ── */
interface PieChartDataItem {
  nombre: string;
  valor: number;
  color: string;
}

interface PieChartComponentProps {
  datos: PieChartDataItem[];
  height?: number;
  showLabel?: boolean;
}

export function PieChartComponent({
  datos,
  height = 300,
  showLabel = true,
}: PieChartComponentProps) {
  const RADIAN = Math.PI / 180;
  const renderLabel = ({
    cx,
    cy,
    midAngle,
    innerRadius,
    outerRadius,
    percent,
  }: any) => {
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);
    return percent > 0.05 ? (
      <text
        x={x}
        y={y}
        fill="white"
        textAnchor={x > cx ? 'start' : 'end'}
        dominantBaseline="central"
        fontSize={12}
        fontWeight="bold"
      >
        {`${(percent * 100).toFixed(0)}%`}
      </text>
    ) : null;
  };

  return (
    <ResponsiveContainer width="100%" height={height}>
      <PieChart>
        <Pie
          data={datos}
          cx="50%"
          cy="50%"
          labelLine={false}
          label={showLabel ? renderLabel : undefined}
          outerRadius={100}
          dataKey="valor"
          nameKey="nombre"
        >
          {datos.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={entry.color} />
          ))}
        </Pie>
        <Tooltip
          formatter={fmtNumber}
          contentStyle={{
            backgroundColor: 'white',
            border: '1px solid #e5e7eb',
            borderRadius: '8px',
          }}
        />
        <Legend />
      </PieChart>
    </ResponsiveContainer>
  );
}

/* ── Line Chart ── */
interface LineChartDataItem {
  nombre: string;
  [key: string]: string | number;
}

interface LineChartComponentProps {
  datos: LineChartDataItem[];
  lineas: Array<{ key: string; nombre: string; color: string }>;
  height?: number;
}

export function LineChartComponent({
  datos,
  lineas,
  height = 300,
}: LineChartComponentProps) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <LineChart
        data={datos}
        margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
      >
        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
        <XAxis dataKey="nombre" tick={{ fontSize: 12 }} />
        <YAxis tick={{ fontSize: 12 }} />
        <Tooltip
          contentStyle={{
            backgroundColor: 'white',
            border: '1px solid #e5e7eb',
            borderRadius: '8px',
          }}
          formatter={fmtNumber}
        />
        <Legend />
        {lineas.map(linea => (
          <Line
            key={linea.key}
            type="monotone"
            dataKey={linea.key}
            name={linea.nombre}
            stroke={linea.color}
            strokeWidth={2}
            dot={{ fill: linea.color, strokeWidth: 2 }}
            activeDot={{ r: 6 }}
          />
        ))}
      </LineChart>
    </ResponsiveContainer>
  );
}

/* ── Area Chart ── */
interface AreaChartComponentProps {
  datos: LineChartDataItem[];
  areas: Array<{ key: string; nombre: string; color: string }>;
  height?: number;
}

export function AreaChartComponent({
  datos,
  areas,
  height = 300,
}: AreaChartComponentProps) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <AreaChart
        data={datos}
        margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
      >
        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
        <XAxis dataKey="nombre" tick={{ fontSize: 12 }} />
        <YAxis tick={{ fontSize: 12 }} />
        <Tooltip
          contentStyle={{
            backgroundColor: 'white',
            border: '1px solid #e5e7eb',
            borderRadius: '8px',
          }}
          formatter={fmtNumber}
        />
        <Legend />
        {areas.map(area => (
          <Area
            key={area.key}
            type="monotone"
            dataKey={area.key}
            name={area.nombre}
            stroke={area.color}
            fill={area.color}
            fillOpacity={0.3}
          />
        ))}
      </AreaChart>
    </ResponsiveContainer>
  );
}
