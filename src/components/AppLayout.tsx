import { Outlet } from 'react-router-dom';
import { Sidebar } from '@/components/Sidebar';
import { BottomNav } from '@/components/BottomNav';

export const AppLayout = () => {
  return (
    <div className="min-h-screen bg-background">
      <Sidebar />
      {/* 
        The sidebar toggles between 260px and 72px.
        We use peer approach via CSS but since sidebar is internal-state, 
        we use a safe max margin that works for both states.
        The sidebar has transition, main content uses md:ml-[72px] as base 
        and the sidebar pushes content naturally.
      */}
      <main className="md:ml-[72px] lg:ml-[260px] transition-all duration-300">
        <div className="page-container">
          <Outlet />
        </div>
      </main>
      <BottomNav />
    </div>
  );
};
