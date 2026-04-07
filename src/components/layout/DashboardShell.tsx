'use client';

import { useAppStore } from '@/store';
import clsx from 'clsx';

export function DashboardShell({ children }: { children: React.ReactNode }) {
  const { sidebarOpen, edicionHabilitada } = useAppStore();

  return (
    <main
      className={clsx(
        'transition-all duration-300 p-6',
        sidebarOpen ? 'ml-72' : 'ml-20',
        edicionHabilitada ? 'mt-[104px]' : 'mt-16'
      )}
    >
      {children}
    </main>
  );
}
