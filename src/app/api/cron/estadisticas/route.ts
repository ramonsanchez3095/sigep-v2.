import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { ejecutarRollupCompleto } from '@/actions/agregacion';

export async function GET(request: NextRequest) {
  const authHeader = request.headers.get('authorization');
  const expectedToken = process.env.CRON_SECRET;

  if (!expectedToken || authHeader !== `Bearer ${expectedToken}`) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
  }

  try {
    await ejecutarRollupCompleto(db);
    return NextResponse.json({
      ok: true,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('[CRON] Error en rollup de estadísticas:', error);
    return NextResponse.json(
      { error: 'Error interno al ejecutar rollup' },
      { status: 500 }
    );
  }
}
