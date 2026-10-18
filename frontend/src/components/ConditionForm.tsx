import { useState, type FormEvent } from 'react';
import type { Condition, Player } from '../api/types';
import { CONDITION_NAMES } from '../lib/labels';
import Button from './Button';
import Field, { inputClass } from './Field';

interface ConditionFormProps {
  player: Player;
  submitting: boolean;
  onSubmit: (condition: Condition) => void;
  onCancel: () => void;
}

function ConditionForm({ player, submitting, onSubmit, onCancel }: ConditionFormProps) {
  const [condition, setCondition] = useState<Condition>(player.condition);
  const sick = player.condition === 'DOENTE';

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    onSubmit(condition);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <Field label="Condição física" htmlFor="player-condition">
        <select
          id="player-condition"
          className={inputClass}
          value={condition}
          onChange={(event) => setCondition(event.target.value as Condition)}
        >
          {Object.entries(CONDITION_NAMES).map(([value, label]) => (
            <option key={value} value={value} disabled={sick && value === 'APTO'}>
              {label}
            </option>
          ))}
        </select>
      </Field>
      {sick && <p className="text-xs text-gray-500">De Doente, o jogador não vai direto para Apto.</p>}
      <div className="flex justify-end gap-2 pt-2">
        <Button onClick={onCancel} disabled={submitting}>
          Cancelar
        </Button>
        <Button type="submit" variant="primary" loading={submitting}>
          Salvar
        </Button>
      </div>
    </form>
  );
}

export default ConditionForm;
