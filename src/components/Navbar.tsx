import { Home, Search, Flame, Calendar, Trophy, ShieldAlert, Menu, X } from 'lucide-react';
import { useState } from 'react';
import { navigate } from '@/lib/store';

interface NavbarProps {
  currentPath: string;
}

const navItems = [
  { path: '/', label: 'Home', icon: Home },
  { path: '/search', label: 'Search', icon: Search },
  { path: '/season', label: 'Seasonal', icon: Calendar },
  { path: '/top', label: 'Rankings', icon: Trophy },
  { path: '/airing', label: 'Airing', icon: Flame },
];

export function Navbar({ currentPath }: NavbarProps) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const isActive = (p: string) => currentPath === p || (p !== '/' && currentPath.startsWith(p));

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-[9000] h-16 bg-system-bg/90 backdrop-blur-md border-b border-system-border">
        <div className="max-w-[1600px] mx-auto h-full px-4 flex items-center justify-between gap-4">
          {/* Logo */}
          <button
            onClick={() => navigate('/')}
            className="flex items-center gap-2 group shrink-0"
          >
            <div className="relative w-8 h-8 flex items-center justify-center">
              <div className="absolute inset-0 border border-system-glow rotate-45 group-hover:rotate-[225deg] transition-transform duration-700" />
              <div className="absolute inset-1 border border-system-cyan/50 rotate-45 group-hover:rotate-[135deg] transition-transform duration-700" />
              <span className="font-system text-sm font-bold text-system-cyan sys-text-glow z-10">G</span>
            </div>
            <span className="font-system text-lg font-bold tracking-widest text-white sys-text-glow hidden sm:block">
              GODCHAIR
            </span>
          </button>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.path);
              return (
                <button
                  key={item.path}
                  onClick={() => navigate(item.path)}
                  className={`flex items-center gap-2 px-3 py-2 font-system text-xs tracking-wider uppercase transition-all border ${
                    active
                      ? 'text-white border-system-glow bg-system-glow/10 sys-text-glow'
                      : 'text-system-dim border-transparent hover:text-system-cyan hover:border-system-border'
                  }`}
                >
                  <Icon size={14} />
                  {item.label}
                </button>
              );
            })}
          </nav>

          {/* Mature button */}
          <button
            onClick={() => navigate('/mature')}
            className={`hidden md:flex items-center gap-2 px-3 py-2 font-system text-xs tracking-wider uppercase transition-all border ${
              isActive('/mature')
                ? 'text-mature-red border-mature-red/50 bg-mature-red/10 mature-text-glow'
                : 'text-mature-dim border-transparent hover:text-mature-red hover:border-mature-border/50'
            }`}
          >
            <ShieldAlert size={14} />
            18+
          </button>

          {/* Mobile toggle */}
          <button
            className="md:hidden text-system-cyan p-2"
            onClick={() => setMobileOpen(!mobileOpen)}
          >
            {mobileOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>

        {/* Mobile menu */}
        {mobileOpen && (
          <nav className="md:hidden absolute top-16 left-0 right-0 bg-system-bg/95 backdrop-blur-md border-b border-system-border flex flex-col p-4 gap-1 animate-fade-in">
            {navItems.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.path);
              return (
                <button
                  key={item.path}
                  onClick={() => {
                    navigate(item.path);
                    setMobileOpen(false);
                  }}
                  className={`flex items-center gap-3 px-4 py-3 font-system text-sm tracking-wider uppercase border ${
                    active
                      ? 'text-white border-system-glow bg-system-glow/10'
                      : 'text-system-dim border-transparent'
                  }`}
                >
                  <Icon size={16} />
                  {item.label}
                </button>
              );
            })}
            <button
              onClick={() => {
                navigate('/mature');
                setMobileOpen(false);
              }}
              className="flex items-center gap-3 px-4 py-3 font-system text-sm tracking-wider uppercase text-mature-red border border-mature-border/50"
            >
              <ShieldAlert size={16} />
              18+ Restricted
            </button>
          </nav>
        )}
      </header>
      <div className="h-16" />
    </>
  );
}
