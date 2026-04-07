import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { db } from '@/db';
import { departamentos, configPeriodos } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { Sidebar } from '@/components/layout/Sidebar';
import { Header } from '@/components/layout/Header';
import { DashboardShell } from '@/components/layout/DashboardShell';

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  if (!session?.user) redirect('/login');

  const user = session.user;
  const esSuperAdmin = user.permisos?.includes('all') ?? false;

  // Obtener nombre del departamento
  let departamentoNombre = 'Sin departamento';
  if (user.departamentoId) {
    const [dept] = await db
      .select({ nombre: departamentos.nombre })
      .from(departamentos)
      .where(eq(departamentos.id, user.departamentoId))
      .limit(1);
    if (dept) departamentoNombre = dept.nombre;
  } else if (esSuperAdmin) {
    departamentoNombre = 'Administración General';
  }

  // Obtener periodos activos
  const [periodo] = await db
    .select()
    .from(configPeriodos)
    .where(eq(configPeriodos.activo, true))
    .limit(1);

  const periodoAnteriorLabel = periodo?.anteriorLabel ?? 'Período Anterior';
  const periodoActualLabel = periodo?.actualLabel ?? 'Período Actual';

  return (
    <div className="min-h-screen bg-policia-light">
      <Sidebar
        userNombre={user.nombre ?? 'Usuario'}
        userColor={user.color ?? '#1e3a5f'}
        userDepartamento={departamentoNombre}
        userPermisos={user.permisos ?? []}
      />
      <Header
        userNombre={user.nombre ?? 'Usuario'}
        userColor={user.color ?? '#1e3a5f'}
        userRol={user.rol ?? 'VIEWER'}
        esSuperAdmin={esSuperAdmin}
        periodoAnteriorLabel={periodoAnteriorLabel}
        periodoActualLabel={periodoActualLabel}
      />
      <DashboardShell>{children}</DashboardShell>
    </div>
  );
}
