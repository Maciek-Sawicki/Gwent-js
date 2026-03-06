export interface CardModifier {
  id: string
  source: string       
  type: "ADD" | "MULTIPLY" | "SET"
  value: number
}