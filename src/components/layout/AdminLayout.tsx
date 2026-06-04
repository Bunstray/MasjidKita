import { Outlet, Navigate, Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, Receipt, FileText, ArrowLeft, Ticket } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

export default function AdminLayout() {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) return null;
  
  if (!user || user.role !== 'admin') {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  const tabs = [
    { path: '/admin', label: 'Dashboard', icon: LayoutDashboard },
    { path: '/admin/infaq', label: 'Infaq', icon: Receipt },
    { path: '/admin/news', label: 'Berita', icon: FileText },
    { path: '/admin/e-coupons', label: 'E-Kupon', icon: Ticket },
    // { path: '/admin/settings', label: 'Pengaturan', icon: FileText }
  ];

  return (
    <div className="flex min-h-screen w-full flex-col overflow-x-hidden bg-bg-primary">
      {/* Admin Header */}
      <header className="sticky top-0 z-40 bg-white px-4 py-3 shadow-sm">
        <div className="mx-auto flex max-w-7xl items-center gap-3">
           <Link to="/profile" className="pressable flex h-10 w-10 items-center justify-center rounded-xl bg-bg-elevated">
            <ArrowLeft size={20} className="text-text-primary" />
          </Link>
          <div>
            <h1 className="font-heading text-lg font-bold text-text-primary">Admin Panel</h1>
            <p className="text-xs text-text-muted">MasjidKita</p>
          </div>
        </div>
      </header>

      <div className="flex flex-1 flex-col md:flex-row">
        {/* Sidebar for Desktop, Tabs for Mobile */}
        <nav className="border-b border-bg-elevated bg-white p-2 md:w-64 md:border-b-0 md:border-r md:p-4">
          <div className="flex overflow-x-auto md:flex-col md:space-y-2">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = location.pathname === tab.path;
              return (
                <Link
                  key={tab.path}
                  to={tab.path}
                  className={`flex shrink-0 items-center gap-2 rounded-xl px-4 py-3 text-sm font-semibold transition-colors ${
                    isActive
                      ? 'bg-primary text-white'
                      : 'text-text-secondary hover:bg-bg-elevated hover:text-primary'
                  }`}
                >
                  <Icon size={18} />
                  {tab.label}
                </Link>
              );
            })}
          </div>
        </nav>

        {/* Main Content Area */}
        <main className="flex-1 bg-bg-primary p-4 md:p-6 pb-24 md:pb-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
