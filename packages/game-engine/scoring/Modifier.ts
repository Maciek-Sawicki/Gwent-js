export type ModifierType =
  | "SET"
  | "ADD"
  | "MULTIPLY";

export interface Modifier {
  id: string;             
  source: string;         
  type: ModifierType;
  value: number;
}