import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { obtenerPeriodos, obtenerUsuarios } from '@/actions/configuracion';
import { obtenerDepartamentos } from '@/actions/datos';
import { ConfiguracionContent } from './ConfiguracionContent';

export const metadata = {
  title: 'Configuración | SIGEP',
};

export default async function ConfiguracionPage() {
  const session = await auth();
  if (!session || session.user.rol !== 'ADMIN') {
    redirect('/dashboard');
  }

  const [periodos, usuariosList, departamentos] = await Promise.all([
    obtenerPeriodos(),
    obtenerUsuarios(),
    obtenerDepartamentos(),
  ]);

  return (
    <ConfiguracionContent
      periodos={periodos}
      usuarios={usuariosList}
      departamentos={departamentos}
    />
  );
}
