import type { Condition } from '../api/types';
import { CONDITION_NAMES } from '../lib/labels';
import Badge from './Badge';

const conditionTones = {
  APTO: 'success',
  MAL_CONDICIONADO: 'warning',
  DOENTE: 'danger',
} as const;

function ConditionBadge({ condition }: { condition: Condition }) {
  return (
    <Badge tone={conditionTones[condition]}>
      <span className="h-1.5 w-1.5 rounded-full bg-current" aria-hidden="true" />
      {CONDITION_NAMES[condition]}
    </Badge>
  );
}

export default ConditionBadge;
