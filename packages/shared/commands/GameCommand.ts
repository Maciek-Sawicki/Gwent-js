import { Row } from "../types/Row";

export interface PlayCardCommand {
  type: "PLAY_CARD";
  playerId: string;
  cardId: string;
  row: Row;
}

export interface PassCommand {
  type: "PASS";
  playerId: string;
}

export type GameCommand =
  | PlayCardCommand
  | PassCommand;