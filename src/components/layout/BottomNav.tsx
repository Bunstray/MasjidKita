import { NavLink } from 'react-router-dom';
import { Home, Clock, BookOpen, Heart, Menu } from 'lucide-react';

const navItems = [
  { to: '/', icon: Home, label: 'Home' },
  { to: '/prayer', icon: Clock, label: 'Sholat' },
  { to: '/quran', icon: BookOpen, label: "Qur'an" },
  { to: '/infaq', icon: Heart, label: 'Infaq' },
  { to: '/more', icon: Menu, label: 'Lainnya' },
];

export default function BottomNav() {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 safe-bottom">
      <div className="glass border-t border-white/20 px-2 pb-1 pt-1">
        <div className="mx-auto flex max-w-lg items-center justify-around">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === '/'}
              className={({ isActive }) =>
                `tap-target flex flex-col items-center gap-0.5 rounded-xl px-3 py-1.5 transition-all duration-200 ${
                  isActive
                    ? 'text-primary'
                    : 'text-text-muted hover:text-text-secondary'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <div className="relative">
                    <item.icon
                      size={22}
                      strokeWidth={isActive ? 2.5 : 1.8}
                      className="transition-all duration-200"
                    />
                    {isActive && (
                      <div className="absolute -bottom-1 left-1/2 h-1 w-1 -translate-x-1/2 rounded-full bg-accent shadow-gold" />
                    )}
                  </div>
                  <span
                    className={`text-[10px] leading-tight transition-all duration-200 ${
                      isActive ? 'font-semibold' : 'font-medium'
                    }`}
                  >
                    {item.label}
                  </span>
                </>
              )}
            </NavLink>
          ))}
        </div>
      </div>
    </nav>
  );
}
