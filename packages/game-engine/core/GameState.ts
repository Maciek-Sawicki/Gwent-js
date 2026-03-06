import { PlayerState } from "./PlayerState";

export interface GameState {
  players: Record<string, PlayerState>;
  currentPlayer: string;
  round: number;
  status: "IN_PROGRESS" | "ROUND_END" | "FINISHED" | "WAITING";
}