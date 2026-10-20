import type { Player } from '../api/types';
import { initials } from '../lib/format';
import { POSITION_NAMES } from '../lib/labels';

function PlayerName({ player, onSelect }: { player: Player; onSelect?: () => void }) {
  return (
    <div className="flex items-center gap-2">
      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gray-100 text-xs font-medium text-gray-600">
        {initials(player.name)}
      </span>
      <div>
        {onSelect ? (
          <button
            type="button"
            onClick={onSelect}
            className="font-medium text-gray-900 hover:text-brand hover:underline"
          >
            {player.name}
          </button>
        ) : (
          <p className="font-medium text-gray-900">{player.name}</p>
        )}
        <p className="text-xs text-gray-500">{POSITION_NAMES[player.position]}</p>
      </div>
    </div>
  );
}

export default PlayerName;
