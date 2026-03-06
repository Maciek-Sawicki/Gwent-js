import { Row } from "@shared/types/Row";
import { CardPlayContext } from "../cards/CardPlayContext";

export interface CardDefinition {
  id: string;
  basePower: number;
  allowedRows: Row[];
  onPlay?: (ctx: CardPlayContext) => void;
}