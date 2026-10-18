import { useState, type FormEvent } from 'react';
import type { PurchaseInput } from '../api/market';
import type { Club, Player } from '../api/types';
import { formatMoney, toApiDateTime } from '../lib/format';
import { checkRequired } from '../lib/validation';
import Button from './Button';
import Field, { inputClass } from './Field';

interface BuyFormProps {
  player: Player;
  clubs: Club[];
  submitting: boolean;
  onSubmit: (values: PurchaseInput) => void;
  onCancel: () => void;
}

function BuyForm({ player, clubs, submitting, onSubmit, onCancel }: BuyFormProps) {
  const [clubId, setClubId] = useState('');
  const [loyaltyUntil, setLoyaltyUntil] = useState('');
  const [errors, setErrors] = useState<{ club?: string; loyalty?: string }>({});

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    const found = { club: checkRequired(clubId), loyalty: checkRequired(loyaltyUntil) };
    setErrors(found);
    if (found.club || found.loyalty) return;
    onSubmit({ club_id: Number(clubId), loyalty_until: toApiDateTime(loyaltyUntil) });
  };

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-3">
      <p className="text-sm text-gray-600">
        Valor de mercado de <strong>{player.name}</strong>: {formatMoney(player.market_value)}
      </p>
      <Field label="Clube comprador" htmlFor="buy-club" error={errors.club}>
        <select
          id="buy-club"
          className={inputClass}
          value={clubId}
          onChange={(event) => setClubId(event.target.value)}
        >
          <option value="">Escolha</option>
          {clubs.map((club) => (
            <option key={club.id} value={club.id}>
              {club.name} (caixa {formatMoney(club.cash)})
            </option>
          ))}
        </select>
      </Field>
      <Field label="Fim da fidelidade (horário de Brasília)" htmlFor="buy-loyalty" error={errors.loyalty}>
        <input
          id="buy-loyalty"
          type="datetime-local"
          className={inputClass}
          value={loyaltyUntil}
          onChange={(event) => setLoyaltyUntil(event.target.value)}
        />
      </Field>
      <div className="flex justify-end gap-2 pt-2">
        <Button onClick={onCancel} disabled={submitting}>
          Cancelar
        </Button>
        <Button type="submit" variant="primary" loading={submitting}>
          Confirmar compra
        </Button>
      </div>
    </form>
  );
}

export default BuyForm;
