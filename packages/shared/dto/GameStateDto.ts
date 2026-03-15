import { PlayerId, CardInstanceId } from "../types/ids";
import { Row } from "../types/Row";

export interface CardDto {
  id: CardInstanceId;
  definitionId: string;
  name: string;
  image?: string;
  power: number;
  row?: Row; // Rząd na którym karta jest położona (undefined dla kart w ręce)
  allowedRows?: Row[]; // Możliwe rzędy na które można położyć kartę
}

export interface PlayerDto {
  id: string;
  passed: boolean;
  score: number;
  roundsWon?: number;
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
  status?: "WAITING" | "IN_PROGRESS" | "ROUND_END" | "FINISHED";
}