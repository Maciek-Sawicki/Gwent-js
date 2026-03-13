import { Faction } from "../cards/CardDefinition";
import { CardInstance } from "./CardInstance";

export interface PlayerBoard {
  MELEE: CardInstance[];
  RANGED: CardInstance[];
  SIEGE: CardInstance[];
}

export interface PlayerState {
  id: string;
  deck: CardInstance[];
  hand: CardInstance[];
  board: PlayerBoard;
  passed: boolean;
  roundsWon: number;
  faction: Faction;
  graveyard: CardInstance[];
  mulligansUsed: number;
}