import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { obtenerFiltros } from '@/actions/estadisticas';
import EstadisticasContent from './EstadisticasContent';

export default async function EstadisticasPage() {
  const session = await auth();
  if (!session?.user) redirect('/login');

  const filtrosOpciones = await obtenerFiltros();

  return (
    <EstadisticasContent
      departamentos={filtrosOpciones.departamentos}
      tablas={filtrosOpciones.tablas}
      userDepartamentoId={session.user.departamentoId ?? undefined}
      esSuperAdmin={session.user.permisos?.includes('all') ?? false}
    />
  );
}
