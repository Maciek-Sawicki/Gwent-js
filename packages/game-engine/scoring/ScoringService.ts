import { CardRegistry } from "../cards/CardRegistry";
import { PlayerState } from "../core/PlayerState";
import { CardInstance } from "../core/CardInstance";
import { Modifier } from "./Modifier";
import { Row } from "@shared/types/Row";

export class ScoringService {

  static calculateCardPower(card: CardInstance): number {
    const definition = CardRegistry.get(card.definitionId);
    let power = definition.basePower;

    const setModifiers = card.modifiers.filter(m => m.type === "SET");
    if (setModifiers.length > 0) {
      power = setModifiers[setModifiers.length - 1].value;
    }
    const addModifiers = card.modifiers.filter(m => m.type === "ADD");
    power += addModifiers.reduce((sum, m) => sum + m.value, 0);

    const multiplyModifiers = card.modifiers.filter(m => m.type === "MULTIPLY");
    multiplyModifiers.forEach(m => {
      power *= m.value;
    });

    return power;
  }

  static calculateRowScore(cards: CardInstance[]): number {
    return cards.reduce((sum, card) => sum + this.calculateCardPower(card), 0);
  }

  static calculatePlayerScore(player: PlayerState): number {
    const rows: Row[] = ["MELEE", "RANGED", "SIEGE"];
    return rows.reduce((sum, row) => {
      return sum + this.calculateRowScore(player.board[row]);
    }, 0);
  }
}