import { PlayerId, CardInstanceId } from "../types/ids";
import { Row } from "../types/Row";

export interface CardDto {
  id: CardInstanceId;
  definitionId: string;
  name: string;
  image?: string;
  power: number;
  row?: Row;
}

export interface PlayerDto {
  id: string;
  passed: boolean;
  score: number;
  hand: CardDto[];
  board: {
    MELEE: CardDto[];
    RANGED: CardDto[];
    SIEGE: CardDto[];
  };
}

export interface GameStateDto {
  players: PlayerDto[];
  currentPlayer: PlayerId;
  round: number;
}