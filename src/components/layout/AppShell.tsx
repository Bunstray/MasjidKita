import { Outlet } from 'react-router-dom';
import BottomNav from './BottomNav';

export default function AppShell() {
  return (
    <div className="relative mx-auto flex h-[100dvh] w-full max-w-lg flex-col overflow-hidden bg-bg-primary">
      <main className="flex-1 overflow-y-auto pb-4">
        <Outlet />
      </main>
      <BottomNav />
    </div>
  );
}
