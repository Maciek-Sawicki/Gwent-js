import { PlayerId, CardInstanceId } from "../types/ids";

export interface CardDto {
  id: CardInstanceId;
  definitionId: string;
  power: number;
}

export interface PlayerDto {
  id: PlayerId;
  hand: CardDto[];
  board: CardDto[];
  score: number;
  passed: boolean;
}

export interface GameStateDto {
  players: PlayerDto[];
  currentPlayer: PlayerId;
  round: number;
}