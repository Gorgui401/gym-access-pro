import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from '@/components/Sidebar';
import { BottomNav } from '@/components/BottomNav';
import { cn } from '@/lib/utils';

export const AppLayout = () => {
  const [sidebarExpanded, setSidebarExpanded] = useState(true);

  return (
    <div className="min-h-screen bg-background">
      <Sidebar expanded={sidebarExpanded} onToggle={() => setSidebarExpanded(!sidebarExpanded)} />
      <main className={cn('transition-all duration-300', sidebarExpanded ? 'md:ml-[260px]' : 'md:ml-[72px]')}>
        <div className="page-container">
          <Outlet />
        </div>
      </main>
      <BottomNav />
    </div>
  );
};
