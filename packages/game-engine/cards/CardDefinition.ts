import type { Row } from "../../shared/types/Row";
import { CardPlayContext } from "./CardPlayContext";

export type Faction = "NILFGAARD"| "NORTHERN_REALMS" | "SCOIATAEL" | "MONSTERS" | "SKELLIGE" | "NEUTRAL" ;

export interface CardDefinition {
  id: string;
  name: string;
  basePower: number;
  allowedRows: Row[];
  faction?: Faction;
  image?: string; // Obrazek dla planszy (bez pasków)
  handImage?: string; // Obrazek dla ręki (z paskami) - jeśli brak, użyj image
  bondGroup?: string;
  tags?: string[];
  onPlay?: (ctx: CardPlayContext) => void;
  ongoing?: (ctx: CardPlayContext) => void;
  isHero?: boolean;
  isLeader?: boolean;
  leaderAbility?: (ctx: CardPlayContext) => void;
}
