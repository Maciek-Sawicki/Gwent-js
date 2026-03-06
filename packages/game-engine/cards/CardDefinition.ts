import { Row } from "@shared/types/Row";
import { CardPlayContext } from "./CardPlayContext";

export type Faction = "NILFGAARD"| "NORTHERN_REALMS" | "SCOIATAEL" | "MONSTERS" | "SKELLIGE" | "NEUTRAL" ;

export interface CardDefinition {
  id: string;
  name: string;
  basePower: number;
  allowedRows: Row[];
  faction?: Faction;
  image?: string;
  bondGroup?: string;
  tags?: string[];
  onPlay?: (ctx: CardPlayContext) => void;
}

