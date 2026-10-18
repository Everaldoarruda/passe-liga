import { Clock, ListOrdered, Shield, Swords, Trophy, Users, type LucideIcon } from 'lucide-react';
import { Link, NavLink } from 'react-router';
import { listClubs } from '../api/clubs';
import { listMatches } from '../api/league';
import { countAllPlayers } from '../api/players';
import { useFetch } from '../hooks/useFetch';

const linkClass = ({ isActive }: { isActive: boolean }) =>
  `flex items-center gap-2 rounded-md px-3 py-1.5 text-sm ${
    isActive
      ? 'bg-white font-semibold text-gray-900 shadow-sm ring-1 ring-gray-200'
      : 'text-gray-600 hover:bg-white'
  }`;

function NavItem({
  to,
  label,
  icon: Icon,
  count,
}: {
  to: string;
  label: string;
  icon: LucideIcon;
  count?: number;
}) {
  return (
    <NavLink to={to} className={linkClass}>
      <Icon size={16} aria-hidden="true" />
      <span className="flex-1">{label}</span>
      {count !== undefined && <span className="text-xs text-gray-400">{count}</span>}
    </NavLink>
  );
}

function SidebarSummary() {
  const { data: players } = useFetch(countAllPlayers);
  const { data: clubs } = useFetch(listClubs);
  const { data: matches } = useFetch(listMatches);
  const lastMatch = matches?.[0];

  return (
    <div className="flex flex-1 flex-col gap-4 px-2 pb-3">
      <div>
        <p className="px-3 pb-1 text-xs font-medium text-gray-400">Mercado</p>
        <NavItem to="/players" label="Jogadores" icon={Users} count={players ?? undefined} />
        <NavItem to="/clubs" label="Clubes" icon={Shield} count={clubs?.length} />
      </div>
      <div>
        <p className="px-3 pb-1 text-xs font-medium text-gray-400">Liga</p>
        <NavItem to="/matches" label="Partidas" icon={Swords} count={matches?.length} />
        <NavItem to="/standings" label="Classificação" icon={ListOrdered} />
      </div>
      <div>
        <p className="px-3 pb-1 text-xs font-medium text-gray-400">Clubes</p>
        {clubs?.length === 0 && <p className="px-3 text-xs text-gray-400">Nenhum clube ainda.</p>}
        {clubs?.map((club) => (
          <Link
            key={club.id}
            to={`/clubs/${club.id}`}
            className="flex items-center gap-2 rounded-md px-3 py-1 text-sm text-gray-700 hover:bg-white"
          >
            <span className="flex h-5 w-5 items-center justify-center rounded bg-gray-200 text-[10px] font-semibold">
              {club.name[0]}
            </span>
            {club.name}
          </Link>
        ))}
      </div>
      <div className="mt-auto space-y-2 rounded-lg border border-gray-200 bg-white p-3 text-xs text-gray-600">
        <p className="flex items-start gap-2">
          <Trophy size={14} className="mt-0.5 text-gray-400" aria-hidden="true" />
          <span>
            <strong className="block text-gray-900">Liga Fictícia 2026</strong>
            {clubs?.length ?? 0} clubes · {players ?? 0} jogadores
          </span>
        </p>
        <p className="flex items-start gap-2">
          <Swords size={14} className="mt-0.5 text-gray-400" aria-hidden="true" />
          <span>
            <strong className="block text-gray-900">Última partida</strong>
            {lastMatch
              ? `${lastMatch.home.club_name} ${lastMatch.home.goals} × ${lastMatch.away.goals} ${lastMatch.away.club_name}`
              : 'nenhuma ainda'}
          </span>
        </p>
        <p className="flex items-center gap-2 border-t border-gray-100 pt-2 text-gray-500">
          <Clock size={14} aria-hidden="true" /> Horário de Brasília (UTC−3)
        </p>
      </div>
    </div>
  );
}

export default SidebarSummary;
