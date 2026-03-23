import { GameEngine } from "../core/GameEngine";
import { GameState } from "../core/GameState";
import type { Row } from "../../shared/types/Row";

export interface CardPlayContext {
  engine: GameEngine;
  state: GameState;
  playerId: string;
  cardInstanceId: string;
  row: Row;
}