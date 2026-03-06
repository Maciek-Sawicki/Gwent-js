import { Modifier } from "../scoring/Modifier";
import { Row } from "../../shared/types/Row";

export interface CardInstance {
  id: string;
  definitionId: string;
  modifiers: Modifier[];
  row?: Row;
  bondGroup?: string;
}