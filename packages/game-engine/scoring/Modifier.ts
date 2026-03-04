export type ModifierType =
  | "SET"
  | "ADD"
  | "MULTIPLY";

export interface Modifier {
  id: string;             // unikalny ID efektu
  source: string;         // np. "tight_bond", "weather"
  type: ModifierType;
  value: number;
}