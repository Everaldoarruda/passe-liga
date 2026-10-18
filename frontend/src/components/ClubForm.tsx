import { useState, type FormEvent } from 'react';
import type { ClubCreate } from '../api/clubs';
import { checkText } from '../lib/validation';
import Button from './Button';
import Field, { inputClass } from './Field';

type FormErrors = Partial<Record<keyof ClubCreate, string>>;

function validate(values: ClubCreate): FormErrors {
  return {
    name: checkText(values.name, 3, 60),
    acronym: /^[A-Z]{3}$/.test(values.acronym) ? undefined : 'Use exatamente 3 letras maiúsculas, de A a Z.',
  };
}

interface ClubFormProps {
  submitting: boolean;
  onSubmit: (values: ClubCreate) => void;
  onCancel: () => void;
}

function ClubForm({ submitting, onSubmit, onCancel }: ClubFormProps) {
  const [values, setValues] = useState<ClubCreate>({ name: '', acronym: '' });
  const [errors, setErrors] = useState<FormErrors>({});

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    const found = validate(values);
    setErrors(found);
    if (Object.values(found).some(Boolean)) return;
    onSubmit(values);
  };

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-3">
      <Field label="Nome" htmlFor="club-name" error={errors.name}>
        <input
          id="club-name"
          className={inputClass}
          value={values.name}
          onChange={(event) => setValues((current) => ({ ...current, name: event.target.value }))}
        />
      </Field>
      <Field label="Sigla" htmlFor="club-acronym" error={errors.acronym}>
        <input
          id="club-acronym"
          className={inputClass}
          maxLength={3}
          value={values.acronym}
          onChange={(event) => setValues((current) => ({ ...current, acronym: event.target.value }))}
        />
      </Field>
      <div className="flex justify-end gap-2 pt-2">
        <Button onClick={onCancel} disabled={submitting}>
          Cancelar
        </Button>
        <Button type="submit" variant="primary" loading={submitting}>
          Criar clube
        </Button>
      </div>
    </form>
  );
}

export default ClubForm;
