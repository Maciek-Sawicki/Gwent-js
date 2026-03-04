import { GameEngine } from "../core/GameEngine";
import { GameState } from "../core/GameState";

export interface GameContext {
  engine: GameEngine;
  state: GameState;
  playerId: string;
  cardInstanceId: string;
}