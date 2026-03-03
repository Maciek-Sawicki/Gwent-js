import { CardInstance } from "./CardInstance";

export interface PlayerState {
  id: string;
  hand: CardInstance[];
  board: CardInstance[];
  passed: boolean;
}