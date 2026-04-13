export function calcularTendencia(
  puntos: Array<{ x: number; y: number }>
): number {
  const n = puntos.length;
  if (n < 2) return 0;

  const sumX = puntos.reduce((a, p) => a + p.x, 0);
  const sumY = puntos.reduce((a, p) => a + p.y, 0);
  const sumXY = puntos.reduce((a, p) => a + p.x * p.y, 0);
  const sumX2 = puntos.reduce((a, p) => a + p.x * p.x, 0);

  const denom = n * sumX2 - sumX * sumX;
  if (denom === 0) return 0;

  return (n * sumXY - sumX * sumY) / denom;
}

export function proyectarSiguiente(
  puntos: Array<{ x: number; y: number }>
): { valor: number; tendencia: number } {
  const n = puntos.length;
  if (n < 2) return { valor: 0, tendencia: 0 };

  const sumX = puntos.reduce((a, p) => a + p.x, 0);
  const sumY = puntos.reduce((a, p) => a + p.y, 0);
  const sumXY = puntos.reduce((a, p) => a + p.x * p.y, 0);
  const sumX2 = puntos.reduce((a, p) => a + p.x * p.x, 0);

  const denom = n * sumX2 - sumX * sumX;
  if (denom === 0) return { valor: sumY / n, tendencia: 0 };

  const b = (n * sumXY - sumX * sumY) / denom;
  const a = (sumY - b * sumX) / n;

  const nextX = puntos[n - 1].x + 1;
  return { valor: a + b * nextX, tendencia: b };
}