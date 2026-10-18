import { useState, type FormEvent } from 'react';
import type { MatchInput } from '../api/league';
import type { Club } from '../api/types';
import { checkRequired } from '../lib/validation';
import Button from './Button';
import Field, { inputClass } from './Field';

interface MatchFormProps {
  clubs: Club[];
  submitting: boolean;
  onSubmit: (values: MatchInput) => void;
}

function MatchForm({ clubs, submitting, onSubmit }: MatchFormProps) {
  const [homeId, setHomeId] = useState('');
  const [awayId, setAwayId] = useState('');
  const [errors, setErrors] = useState<{ home?: string; away?: string }>({});

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    const found = { home: checkRequired(homeId), away: checkRequired(awayId) };
    setErrors(found);
    if (found.home || found.away) return;
    onSubmit({ home_club_id: Number(homeId), away_club_id: Number(awayId) });
  };

  const clubOptions = clubs.map((club) => (
    <option key={club.id} value={club.id}>
      {club.name}
    </option>
  ));

  return (
    <form onSubmit={handleSubmit} noValidate className="flex flex-wrap items-end gap-3 p-4">
      <div className="w-56">
        <Field label="Mandante" htmlFor="match-home" error={errors.home}>
          <select
            id="match-home"
            className={inputClass}
            value={homeId}
            onChange={(event) => setHomeId(event.target.value)}
          >
            <option value="">Escolha</option>
            {clubOptions}
          </select>
        </Field>
      </div>
      <div className="w-56">
        <Field label="Visitante" htmlFor="match-away" error={errors.away}>
          <select
            id="match-away"
            className={inputClass}
            value={awayId}
            onChange={(event) => setAwayId(event.target.value)}
          >
            <option value="">Escolha</option>
            {clubOptions}
          </select>
        </Field>
      </div>
      <Button type="submit" variant="primary" loading={submitting}>
        Jogar partida
      </Button>
    </form>
  );
}

export default MatchForm;
