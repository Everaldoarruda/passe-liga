import { NavLink, Outlet } from 'react-router';

const links = [
  { to: '/players', label: 'Jogadores' },
  { to: '/clubs', label: 'Clubes' },
  { to: '/matches', label: 'Partidas' },
  { to: '/standings', label: 'Classificação' },
];

function Layout() {
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="border-b border-gray-200 bg-white">
        <nav className="mx-auto flex max-w-6xl items-center gap-6 px-4 py-3">
          <span className="text-xl font-bold text-brand">Passe</span>
          {links.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              className={({ isActive }) =>
                isActive ? 'font-semibold text-brand' : 'text-gray-600 hover:text-gray-900'
              }
            >
              {link.label}
            </NavLink>
          ))}
        </nav>
      </header>
      <main className="mx-auto max-w-6xl px-4 py-6">
        <Outlet />
      </main>
    </div>
  );
}

export default Layout;
