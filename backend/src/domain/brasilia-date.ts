const PATTERN = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})-03:00$/;
const OFFSET_MS = 3 * 60 * 60 * 1000;

// Devolve null para formato diferente ou data/hora inexistente (nunca ajusta)
export function parseBrasiliaDate(text: string): Date | null {
  const match = PATTERN.exec(text);
  if (!match) return null;
  const [year, month, day, hour, minute] = match.slice(1).map(Number);

  const date = new Date(Date.UTC(year, month - 1, day, hour, minute) + OFFSET_MS);
  const local = new Date(date.getTime() - OFFSET_MS);
  const exact =
    local.getUTCFullYear() === year &&
    local.getUTCMonth() === month - 1 &&
    local.getUTCDate() === day &&
    local.getUTCHours() === hour &&
    local.getUTCMinutes() === minute;
  return exact ? date : null;
}

// Formato das respostas: AAAA-MM-DDTHH:MM:SS-03:00
export function formatBrasilia(date: Date): string {
  return new Date(date.getTime() - OFFSET_MS).toISOString().slice(0, 19) + '-03:00';
}
