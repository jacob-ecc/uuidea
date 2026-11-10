/** Startzustand einer Spielseite aus `?id=` und `#r=` – rein, testbar. */
import { decodeResult, parseChallengeUrl } from '@/lib/share/codec';
import { fromBytes, toBytes } from '@/lib/uuid/bytes';
import type { GameMeta } from '../types';

export interface Challenge {
  nick: string;
  fields: number[];
}

export interface InitialState {
  uuid: string;
  /** true, wenn die UUID aus dem Link kam */
  fromLink: boolean;
  challenge: Challenge | null;
  error: 'broken' | 'game' | null;
}

export const FALLBACK_NICK = '????';

export function initialState(
  game: Pick<GameMeta, 'id' | 'valid'>,
  url: { search: string; hash: string },
  fallbackUuid: () => string,
): InitialState {
  const { id, code } = parseChallengeUrl(url);
  const bytes = id ? toBytes(id) : null;
  const uuid = bytes ? fromBytes(bytes) : fallbackUuid().toLowerCase();
  if (!code) return { uuid, fromLink: !!bytes, challenge: null, error: null };
  if (!bytes) return { uuid, fromLink: false, challenge: null, error: 'broken' };

  const r = decodeResult(uuid, code);
  if (!r.ok) return { uuid, fromLink: true, challenge: null, error: 'broken' };
  if (r.value.gameId !== game.id) return { uuid, fromLink: true, challenge: null, error: 'game' };
  if (!game.valid(r.value.fields, uuid))
    return { uuid, fromLink: true, challenge: null, error: 'broken' };
  return {
    uuid,
    fromLink: true,
    challenge: { nick: r.value.nick || FALLBACK_NICK, fields: r.value.fields },
    error: null,
  };
}
