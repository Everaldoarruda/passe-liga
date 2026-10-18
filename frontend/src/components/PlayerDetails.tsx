import { ChartColumn, Coins, Tag, TrendingUp, type LucideIcon } from 'lucide-react';
import type { Club, Player } from '../api/types';
import Badge from './Badge';
import ConditionBadge from './ConditionBadge';
import ResultList from './ResultList';
import { formatMoney, initials } from '../lib/format';
import { ATTRIBUTE_NAMES } from '../lib/labels';

const INDICATORS = ['pace', 'shooting', 'passing', 'dribbling', 'defending', 'physical'] as const;

interface StatCardProps {
  icon: LucideIcon;
  label: string;
  value: string | number;
  hint: string;
}

function StatCard({ icon: Icon, label, value, hint }: StatCardProps) {
  return (
    <div className="rounded-lg border border-gray-200 p-3">
      <div className="flex items-center justify-between text-xs text-gray-500">
        {label}
        <Icon size={14} aria-hidden="true" />
      </div>
      <p className="mt-1 text-2xl font-bold text-gray-900">{value}</p>
      <p className="text-xs text-gray-500">{hint}</p>
    </div>
  );
}

// Barra azul até o valor do atributo e azul-claro até o potencial, na escala de 1 a 99
function IndicatorBar({ label, value, potential }: { label: string; value: number; potential: number }) {
  return (
    <div className="flex items-center gap-3 text-sm">
      <span className="w-24 text-gray-600">{label}</span>
      <div className="relative h-1.5 flex-1 rounded bg-gray-100">
        <div className="absolute h-1.5 rounded bg-blue-200" style={{ width: `${potential}%` }} />
        <div className="absolute h-1.5 rounded bg-brand" style={{ width: `${value}%` }} />
      </div>
      <span className="w-6 text-right font-medium text-gray-900">{value}</span>
    </div>
  );
}

function PlayerDetails({ player, club }: { player: Player; club: Club | undefined }) {
  return (
    <div className="space-y-5">
      <div className="flex items-center gap-3 pr-8">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gray-100 text-sm font-medium text-gray-600">
          {initials(player.name)}
        </span>
        <div>
          <h2 className="text-lg font-semibold text-gray-900">{player.name}</h2>
          <div className="mt-1 flex gap-1">
            <Badge>{player.position}</Badge>
            <ConditionBadge condition={player.condition} />
            <Badge>{club ? club.acronym : 'Livre'}</Badge>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <StatCard
          icon={Coins}
          label="Valor de mercado"
          value={formatMoney(player.market_value)}
          hint="Calculado automaticamente"
        />
        <StatCard
          icon={Tag}
          label="Valor base"
          value={formatMoney(player.base_value)}
          hint="Calculado no cadastro"
        />
        <StatCard icon={ChartColumn} label="Overall" value={player.overall} hint="Calculado pela posição" />
        <StatCard icon={TrendingUp} label="Potencial" value={player.potential} hint="Informado no cadastro" />
      </div>

      <section>
        <div className="mb-3 flex items-baseline justify-between">
          <h3 className="font-semibold text-gray-900">Indicadores técnicos</h3>
          <span className="text-xs text-gray-500">Escala de 1 a 99</span>
        </div>
        <div className="space-y-2">
          {INDICATORS.map((key) => (
            <IndicatorBar
              key={key}
              label={ATTRIBUTE_NAMES[key]}
              value={player[key]}
              potential={player.potential}
            />
          ))}
        </div>
        <div className="mt-3 flex gap-4 text-xs text-gray-500">
          <span className="flex items-center gap-1">
            <span className="h-2 w-2 rounded-sm bg-brand" aria-hidden="true" /> Valor do atributo
          </span>
          <span className="flex items-center gap-1">
            <span className="h-2 w-2 rounded-sm bg-blue-200" aria-hidden="true" /> Até o potencial (
            {player.potential}), que nenhum atributo passa
          </span>
        </div>
      </section>

      <div className="rounded-lg border border-gray-200 px-3">
        <ResultList
          items={[
            { label: 'Idade', value: `${player.age} anos` },
            { label: 'Agilidade', value: player.agility },
            { label: 'Clube', value: club ? club.name : 'Livre' },
          ]}
        />
      </div>
    </div>
  );
}

export default PlayerDetails;
