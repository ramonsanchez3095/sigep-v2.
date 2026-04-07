import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { Configurar2FAContent } from './Configurar2FAContent';

export default async function Configurar2FAPage() {
  const session = await auth();
  if (!session?.user) redirect('/login');
  if (session.user.totpEnabled) redirect('/dashboard');

  return <Configurar2FAContent />;
}
