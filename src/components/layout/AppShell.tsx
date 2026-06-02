import { Outlet } from 'react-router-dom';
import BottomNav from './BottomNav';

export default function AppShell() {
  return (
    <div className="relative mx-auto min-h-screen w-full max-w-lg overflow-x-hidden bg-bg-primary pb-28">
      <main>
        <Outlet />
      </main>
      <BottomNav />
    </div>
  );
}
