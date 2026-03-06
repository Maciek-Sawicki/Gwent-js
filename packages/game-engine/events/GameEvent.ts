import { Row } from "@shared/types/Row";

export interface CardPlayedEvent {
  type: "CARD_PLAYED";
  playerId: string;
  cardId: string;
  row: Row;
}

export interface PlayerPassedEvent {
  type: "PLAYER_PASSED";
  playerId: string;
}

export type GameEvent =
  | CardPlayedEvent
  | PlayerPassedEvent;