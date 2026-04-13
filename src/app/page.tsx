import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth';

export default async function Home() {
  const session = await auth();

  if (!session?.user) {
    redirect('/login');
  }

  if (!session.user.totpEnabled) {
    redirect('/configurar-2fa');
  }

  redirect('/dashboard');
}
