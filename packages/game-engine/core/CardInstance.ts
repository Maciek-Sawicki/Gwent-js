import { Modifier } from "../scoring/Modifier";

export interface CardInstance {
  id: string;
  definitionId: string;

  modifiers: Modifier[];
}