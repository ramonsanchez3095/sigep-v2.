import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'SIGEP - Sistema de Gestión Estadística Policial',
  description: 'Policía de Tucumán - Sistema de Gestión Estadística Policial',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body className="antialiased font-sans">{children}</body>
    </html>
  );
}
