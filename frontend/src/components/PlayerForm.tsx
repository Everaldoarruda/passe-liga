import { useState, type FormEvent } from 'react';
import type { PlayerCreate } from '../api/players';
import type { Player, Position } from '../api/types';
import { POSITION_NAMES } from '../lib/labels';
import { checkInteger, checkRequired, checkText } from '../lib/validation';
import Button from './Button';
import Field, { inputClass } from './Field';

const ATTRIBUTES = [
  { key: 'pace', label: 'Velocidade' },
  { key: 'shooting', label: 'Finalização' },
  { key: 'passing', label: 'Passe' },
  { key: 'dribbling', label: 'Drible' },
  { key: 'defending', label: 'Defesa' },
  { key: 'physical', label: 'Físico' },
  { key: 'potential', label: 'Potencial' },
] as const;

type FormValues = Record<keyof PlayerCreate, string>;
type FormErrors = Partial<Record<keyof PlayerCreate, string>>;

const EMPTY_VALUES: FormValues = {
  name: '',
  position: '',
  agility: '',
  age: '',
  pace: '',
  shooting: '',
  passing: '',
  dribbling: '',
  defending: '',
  physical: '',
  potential: '',
};

function initialValues(player?: Player): FormValues {
  if (!player) return EMPTY_VALUES;
  return {
    ...EMPTY_VALUES,
    name: player.name,
    position: player.position,
    agility: String(player.agility),
    age: String(player.age),
  };
}

function validate(values: FormValues, player?: Player): FormErrors {
  const errors: FormErrors = {
    name: checkText(values.name, 3, 100),
    position: checkRequired(values.position),
    agility: checkInteger(values.agility, 1, 100),
    age: checkInteger(values.age, player?.age ?? 16, 45),
  };
  if (!player) {
    for (const { key } of ATTRIBUTES) errors[key] = checkInteger(values[key], 1, 99);
  }
  return errors;
}

interface PlayerFormProps {
  player?: Player;
  submitting: boolean;
  onSubmit: (values: PlayerCreate) => void;
  onCancel: () => void;
}

function PlayerForm({ player, submitting, onSubmit, onCancel }: PlayerFormProps) {
  const [values, setValues] = useState(() => initialValues(player));
  const [errors, setErrors] = useState<FormErrors>({});
  const positionLocked = player?.club_id != null;

  const change = (key: keyof FormValues, value: string) =>
    setValues((current) => ({ ...current, [key]: value }));

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    const found = validate(values, player);
    setErrors(found);
    if (Object.values(found).some(Boolean)) return;
    onSubmit({
      name: values.name,
      position: values.position as Position,
      agility: Number(values.agility),
      age: Number(values.age),
      pace: Number(values.pace),
      shooting: Number(values.shooting),
      passing: Number(values.passing),
      dribbling: Number(values.dribbling),
      defending: Number(values.defending),
      physical: Number(values.physical),
      potential: Number(values.potential),
    });
  };

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-3">
      <Field label="Nome" htmlFor="player-name" error={errors.name}>
        <input
          id="player-name"
          className={inputClass}
          value={values.name}
          onChange={(event) => change('name', event.target.value)}
        />
      </Field>
      <div className="grid grid-cols-3 gap-3">
        <Field label="Posição" htmlFor="player-position" error={errors.position}>
          <select
            id="player-position"
            className={inputClass}
            value={values.position}
            disabled={positionLocked}
            title={positionLocked ? 'Jogador com clube não muda de posição' : undefined}
            onChange={(event) => change('position', event.target.value)}
          >
            <option value="">Escolha</option>
            {Object.entries(POSITION_NAMES).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Agilidade" htmlFor="player-agility" error={errors.agility}>
          <input
            id="player-agility"
            type="number"
            className={inputClass}
            value={values.agility}
            onChange={(event) => change('agility', event.target.value)}
          />
        </Field>
        <Field label="Idade" htmlFor="player-age" error={errors.age}>
          <input
            id="player-age"
            type="number"
            className={inputClass}
            value={values.age}
            onChange={(event) => change('age', event.target.value)}
          />
        </Field>
      </div>
      {!player && (
        <div className="grid grid-cols-3 gap-3 sm:grid-cols-4">
          {ATTRIBUTES.map(({ key, label }) => (
            <Field key={key} label={label} htmlFor={`player-${key}`} error={errors[key]}>
              <input
                id={`player-${key}`}
                type="number"
                className={inputClass}
                value={values[key]}
                onChange={(event) => change(key, event.target.value)}
              />
            </Field>
          ))}
        </div>
      )}
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

export default PlayerForm;
