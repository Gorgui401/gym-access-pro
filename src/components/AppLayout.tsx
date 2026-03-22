import { Outlet } from 'react-router-dom';
import { Sidebar } from '@/components/Sidebar';
import { BottomNav } from '@/components/BottomNav';

export const AppLayout = () => {
  return (
    <div className="min-h-screen bg-background">
      <Sidebar />
      <main className="md:ml-64">
        <div className="page-container">
          <Outlet />
        </div>
      </main>
      <BottomNav />
    </div>
  );
};
