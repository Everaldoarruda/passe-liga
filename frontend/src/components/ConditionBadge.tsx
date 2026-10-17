import type { Condition } from '../api/types';
import { CONDITION_NAMES } from '../lib/labels';
import Badge from './Badge';

const conditionTones = {
  APTO: 'success',
  MAL_CONDICIONADO: 'warning',
  DOENTE: 'danger',
} as const;

function ConditionBadge({ condition }: { condition: Condition }) {
  return <Badge tone={conditionTones[condition]}>{CONDITION_NAMES[condition]}</Badge>;
}

export default ConditionBadge;
