import {
  ArrowRight,
  ChevronRight,
  CircleCheck,
  Clock,
  HandCoins,
  History,
  Shield,
  ShoppingCart,
  Swords,
  Trophy,
  User,
  Users,
  type LucideIcon,
} from 'lucide-react';
import { Fragment, useEffect } from 'react';
import { Link, useNavigate } from 'react-router';
import { listClubs } from '../api/clubs';
import { listMatches, listStandings } from '../api/league';
import { countAllPlayers, countFreePlayers } from '../api/players';
import { useFetch } from '../hooks/useFetch';

const STEPS: { icon: LucideIcon; title: string; text: string }[] = [
  {
    icon: Users,
    title: 'Jogadores',
    text: 'Nascem livres e Apto; o valor de mercado vem da condição, agilidade e idade.',
  },
  { icon: Shield, title: 'Clubes', text: 'Começam com 300,00 em caixa e sem jogadores.' },
  {
    icon: ShoppingCart,
    title: 'Compra',
    text: 'Valor + taxa, até 50% do caixa, com contrato de fidelidade.',
  },
  { icon: HandCoins, title: 'Venda', text: 'Multa antes do fim da fidelidade e comissão sobre o lucro.' },
  { icon: History, title: 'Histórico', text: 'Toda compra e venda fica registrada, com totais e CSV.' },
  { icon: Trophy, title: 'Liga', text: 'Escale 5 titulares e jogue partidas que entram na classificação.' },
];

function Pitch() {
  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden rounded-3xl">
      <div className="absolute inset-y-0 left-1/2 border-l border-gray-200" />
      <div className="absolute top-1/2 left-1/2 h-56 w-56 -translate-x-1/2 -translate-y-1/2 rounded-full border border-gray-200" />
      <div className="absolute top-1/2 left-0 h-80 w-36 -translate-y-1/2 border border-l-0 border-gray-200" />
      <div className="absolute top-1/2 right-0 h-80 w-36 -translate-y-1/2 border border-r-0 border-gray-200" />
    </div>
  );
}

function Counter({
  icon: Icon,
  value,
  label,
}: {
  icon: LucideIcon;
  value: number | undefined;
  label: string;
}) {
  return (
    <span className="flex items-center gap-1.5">
      <Icon size={14} aria-hidden="true" />
      <strong className="text-gray-900">{value ?? '–'}</strong>
      {label}
    </span>
  );
}

function HomePage() {
  const navigate = useNavigate();
  const { data: players } = useFetch(countAllPlayers);
  const { data: free } = useFetch(countFreePlayers);
  const { data: clubs } = useFetch(listClubs);
  const { data: matches } = useFetch(listMatches);
  const { data: standings } = useFetch(listStandings);

  useEffect(() => {
    const start = (event: KeyboardEvent) => {
      if (event.key === 'Enter') navigate('/players');
    };
    document.addEventListener('keydown', start);
    return () => document.removeEventListener('keydown', start);
  }, [navigate]);

  const leader = standings?.[0];
  const status =
    matches && matches.length > 0 && leader
      ? `líder: ${leader.club_name}, ${leader.points} pontos`
      : 'nenhuma partida ainda';

  return (
    <div className="flex min-h-screen items-center justify-center bg-white p-6">
      <div className="relative w-full max-w-6xl rounded-3xl border border-gray-200 px-4 py-12">
        <Pitch />
        <div className="relative flex flex-col items-center text-center">
          <div className="flex items-center gap-3">
            <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-brand text-2xl font-bold text-white">
              P
            </span>
            <span className="text-3xl font-semibold text-gray-900">Passe</span>
          </div>
          <p className="mt-4 flex items-center gap-2 rounded-full border border-gray-200 bg-white px-3 py-1 text-xs text-gray-600">
            <span className="h-2 w-2 rounded-full bg-green-600" aria-hidden="true" />
            <strong className="text-gray-900">Liga Fictícia 2026</strong> · {status}
          </p>
          <h1 className="mt-5 text-4xl font-bold text-gray-900">
            Gestão da liga, do mercado à classificação
          </h1>
          <p className="mt-3 max-w-xl text-gray-600">
            Cadastre jogadores, monte os clubes e negocie com contrato de fidelidade. Depois, escale os
            titulares e jogue partidas com placar calculado pelos atributos.
          </p>
          <div className="mt-6 flex items-center gap-3">
            <Link
              to="/players"
              className="flex w-44 items-center justify-center gap-2 rounded-md bg-brand py-2 text-sm font-medium text-white hover:bg-brand-dark"
            >
              Iniciar <ArrowRight size={16} aria-hidden="true" />
            </Link>
            <span className="text-sm text-gray-500">
              ou tecle <kbd className="rounded border border-gray-200 bg-gray-50 px-1.5 text-xs">Enter</kbd>
            </span>
          </div>
          <div className="mt-6 flex flex-wrap items-center justify-center gap-x-4 gap-y-1 text-xs text-gray-600">
            <Counter icon={Users} value={players ?? undefined} label="jogadores" />
            <Counter icon={User} value={free ?? undefined} label="livres" />
            <Counter icon={Shield} value={clubs?.length} label="clubes" />
            <Counter icon={Swords} value={matches?.length} label="partidas" />
            <span className="flex items-center gap-1.5">
              <CircleCheck size={14} aria-hidden="true" /> Não precisa de login
            </span>
          </div>
          <div className="mt-10 flex w-full items-stretch">
            {STEPS.map(({ icon: Icon, title, text }, index) => (
              <Fragment key={title}>
                {index > 0 && (
                  <ChevronRight
                    size={16}
                    className="mx-1 shrink-0 self-center text-gray-400"
                    aria-hidden="true"
                  />
                )}
                <div className="flex-1 rounded-xl border border-gray-200 bg-white p-3 text-left">
                  <div className="flex items-center gap-2">
                    <span className="flex h-7 w-7 items-center justify-center rounded-md bg-blue-50 text-brand">
                      <Icon size={16} aria-hidden="true" />
                    </span>
                    <span className="font-mono text-xs text-gray-400">
                      {String(index + 1).padStart(2, '0')}
                    </span>
                  </div>
                  <p className="mt-3 text-sm font-semibold text-gray-900">{title}</p>
                  <p className="mt-1 text-xs text-gray-600">{text}</p>
                </div>
              </Fragment>
            ))}
          </div>
          <p className="mt-8 flex items-center gap-1.5 text-xs text-gray-500">
            <Clock size={14} aria-hidden="true" /> Liga Fictícia 2026 · Horário de Brasília (UTC−3)
          </p>
        </div>
      </div>
    </div>
  );
}

export default HomePage;
