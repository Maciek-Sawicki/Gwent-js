import { GameContext } from "../effects/GameContext";

export interface CardDefinition {
  id: string;
  basePower: number;

  tags?: string[];

  onPlay?: (context: GameContext) => void;
}