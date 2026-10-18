import { ChevronRight } from 'lucide-react';
import { Link, Outlet, useLocation } from 'react-router';
import SidebarSummary from './SidebarSummary';

const SECTIONS: { prefix: string; trail: string[] }[] = [
  { prefix: '/players', trail: ['Mercado', 'Jogadores'] },
  { prefix: '/clubs', trail: ['Mercado', 'Clubes'] },
  { prefix: '/matches', trail: ['Liga', 'Partidas'] },
  { prefix: '/standings', trail: ['Liga', 'Classificação'] },
];

function Layout() {
  const { pathname } = useLocation();
  const trail = SECTIONS.find((section) => pathname.startsWith(section.prefix))?.trail ?? [];

  return (
    <div className="flex min-h-screen bg-gray-100">
      <aside className="sticky top-0 flex h-screen w-60 shrink-0 flex-col overflow-y-auto">
        <Link to="/" className="flex items-center gap-2 px-4 py-4">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand font-bold text-white">
            P
          </span>
          <span>
            <span className="block text-sm font-semibold text-gray-900">Passe</span>
            <span className="block text-xs text-gray-500">Gestão da liga</span>
          </span>
        </Link>
        <SidebarSummary key={pathname} />
      </aside>
      <div className="min-w-0 flex-1 py-2 pr-2">
        <div className="min-h-full rounded-xl border border-gray-200 bg-white">
          <nav
            aria-label="Caminho"
            className="flex items-center gap-1 border-b border-gray-200 px-6 py-3 text-sm text-gray-500"
          >
            {trail.map((part, index) => (
              <span key={part} className="flex items-center gap-1">
                {index > 0 && <ChevronRight size={14} aria-hidden="true" />}
                <span className={index === trail.length - 1 ? 'font-medium text-gray-900' : undefined}>
                  {part}
                </span>
              </span>
            ))}
          </nav>
          <main className="px-6 py-6">
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  );
}

export default Layout;
