import { ListOrdered, Shield, Swords, Users, type LucideIcon } from 'lucide-react';
import { NavLink, Outlet } from 'react-router';

interface NavItem {
  to: string;
  label: string;
  icon: LucideIcon;
}

const sections: { title: string; items: NavItem[] }[] = [
  {
    title: 'Mercado',
    items: [
      { to: '/players', label: 'Jogadores', icon: Users },
      { to: '/clubs', label: 'Clubes', icon: Shield },
    ],
  },
  {
    title: 'Liga',
    items: [
      { to: '/matches', label: 'Partidas', icon: Swords },
      { to: '/standings', label: 'Classificação', icon: ListOrdered },
    ],
  },
];

const linkClass = ({ isActive }: { isActive: boolean }) =>
  `flex shrink-0 items-center gap-2 rounded-md px-3 py-1.5 text-sm ${
    isActive ? 'bg-gray-100 font-semibold text-gray-900' : 'text-gray-600 hover:bg-gray-50'
  }`;

function Layout() {
  return (
    <div className="min-h-screen bg-gray-50 md:flex">
      <aside className="border-b border-gray-200 bg-white md:w-60 md:shrink-0 md:border-r md:border-b-0">
        <div className="flex items-center gap-2 px-4 py-4">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand font-bold text-white">
            P
          </span>
          <div>
            <p className="text-sm font-semibold text-gray-900">Passe</p>
            <p className="text-xs text-gray-500">Gestão da liga</p>
          </div>
        </div>
        <nav className="flex gap-1 overflow-x-auto px-2 pb-3 md:flex-col md:gap-4">
          {sections.map((section) => (
            <div key={section.title} className="flex gap-1 md:flex-col">
              <p className="hidden px-3 text-xs font-medium text-gray-400 md:block">{section.title}</p>
              {section.items.map(({ to, label, icon: Icon }) => (
                <NavLink key={to} to={to} className={linkClass}>
                  <Icon size={16} aria-hidden="true" />
                  {label}
                </NavLink>
              ))}
            </div>
          ))}
        </nav>
      </aside>
      <main className="min-w-0 flex-1 px-4 py-6 md:px-8">
        <div className="mx-auto max-w-6xl">
          <Outlet />
        </div>
      </main>
    </div>
  );
}

export default Layout;
