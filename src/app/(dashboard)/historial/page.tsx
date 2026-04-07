import { obtenerHistorial } from '@/actions/historial';
import { HistorialContent } from './HistorialContent';

export const metadata = {
  title: 'Historial de Cambios | SIGEP',
};

export default async function HistorialPage() {
  const cambios = await obtenerHistorial(100);

  return <HistorialContent cambios={cambios} />;
}
