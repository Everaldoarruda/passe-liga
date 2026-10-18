import { useState, type FormEvent } from 'react';
import type { LineupInput } from '../api/league';
import type { Player } from '../api/types';
import { FORMATIONS, slotsFor } from '../lib/lineup';
import { checkRequired } from '../lib/validation';
import Button from './Button';
import Field, { inputClass } from './Field';

interface LineupFormProps {
  squad: Player[];
  submitting: boolean;
  onSubmit: (values: LineupInput) => void;
}

function LineupForm({ squad, submitting, onSubmit }: LineupFormProps) {
  const [formation, setFormation] = useState('');
  const [picks, setPicks] = useState<Record<string, string>>({});
  const [errors, setErrors] = useState<Record<string, string | undefined>>({});

  const slots = formation ? slotsFor(formation) : [];
  const available = squad.filter((player) => player.condition !== 'DOENTE');
  const chosen = Object.values(picks);

  const changeFormation = (value: string) => {
    setFormation(value);
    setPicks({});
    setErrors({});
  };

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    const found: Record<string, string | undefined> = { formation: checkRequired(formation) };
    for (const slot of slots) found[slot.key] = picks[slot.key] ? undefined : 'Escolha um jogador.';
    setErrors(found);
    if (Object.values(found).some(Boolean)) return;
    onSubmit({ formation, player_ids: slots.map((slot) => Number(picks[slot.key])) });
  };

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-3 p-3">
      <div className="w-48">
        <Field label="Formação" htmlFor="lineup-formation" error={errors.formation}>
          <select
            id="lineup-formation"
            className={inputClass}
            value={formation}
            onChange={(event) => changeFormation(event.target.value)}
          >
            <option value="">Escolha</option>
            {FORMATIONS.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </Field>
      </div>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {slots.map((slot) => {
          const options = available.filter(
            (player) =>
              slot.positions.includes(player.position) &&
              (picks[slot.key] === String(player.id) || !chosen.includes(String(player.id))),
          );
          return (
            <Field key={slot.key} label={slot.label} htmlFor={`lineup-${slot.key}`} error={errors[slot.key]}>
              <select
                id={`lineup-${slot.key}`}
                className={inputClass}
                value={picks[slot.key] ?? ''}
                onChange={(event) => setPicks((current) => ({ ...current, [slot.key]: event.target.value }))}
              >
                <option value="">Escolha</option>
                {options.map((player) => (
                  <option key={player.id} value={player.id}>
                    {player.name} ({player.position})
                  </option>
                ))}
              </select>
            </Field>
          );
        })}
      </div>
      <Button type="submit" variant="primary" loading={submitting}>
        Salvar escalação
      </Button>
    </form>
  );
}

export default LineupForm;
