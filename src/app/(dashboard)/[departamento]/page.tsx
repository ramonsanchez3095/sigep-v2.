import { notFound } from 'next/navigation';
import { obtenerTablasDelDepartamento } from '@/actions/datos';
import { db } from '@/db';
import { configPeriodos } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { DepartamentoContent } from './DepartamentoContent';

// Mapeo de departamentos a iconos y metadata
const DEPT_META: Record<string, { label: string; iconName: string }> = {
  d1: { label: 'D-1 Personal', iconName: 'Users' },
  d2: { label: 'D-2 Inteligencia Criminal', iconName: 'Shield' },
  d3: { label: 'D-3 Operaciones', iconName: 'Activity' },
  d4: { label: 'D-4 Logística', iconName: 'Truck' },
  d5: { label: 'D-5 Judicial', iconName: 'Scale' },
  asuntos_internos: { label: 'Asuntos Internos', iconName: 'AlertTriangle' },
  delitos_rurales: { label: 'Delitos Rurales', iconName: 'TreePine' },
  digedrop: { label: 'DIGEDROP', iconName: 'Pill' },
  prevencion_ciudadana: { label: 'Prevención Ciudadana', iconName: 'Phone' },
  unidades_especiales: { label: 'Unidades Especiales', iconName: 'Star' },
  institutos: { label: 'Institutos e Instrucción', iconName: 'GraduationCap' },
  unidades_regionales: { label: 'Unidades Regionales', iconName: 'MapPin' },
};

export async function generateMetadata({
  params,
}: {
  params: Promise<{ departamento: string }>;
}) {
  const { departamento } = await params;
  const meta = DEPT_META[departamento];
  return {
    title: meta ? `${meta.label} - SIGEP` : 'SIGEP',
  };
}

export default async function DepartamentoPage({
  params,
}: {
  params: Promise<{ departamento: string }>;
}) {
  const { departamento: codigoDept } = await params;

  const { departamento, tablas } =
    await obtenerTablasDelDepartamento(codigoDept);
  if (!departamento) notFound();

  const [periodo] = await db
    .select()
    .from(configPeriodos)
    .where(eq(configPeriodos.activo, true))
    .limit(1);

  const periodoAnteriorLabel = periodo?.anteriorLabel ?? 'Período Anterior';
  const periodoActualLabel = periodo?.actualLabel ?? 'Período Actual';

  return (
    <DepartamentoContent
      departamento={departamento}
      tablas={tablas}
      periodoAnteriorLabel={periodoAnteriorLabel}
      periodoActualLabel={periodoActualLabel}
    />
  );
}
