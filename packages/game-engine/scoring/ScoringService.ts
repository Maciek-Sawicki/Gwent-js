import { CardRegistry } from "../cards/CardRegistry";
import { PlayerState } from "../core/PlayerState";
import { CardInstance } from "../core/CardInstance";
import { Modifier } from "./Modifier";

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

  static calculatePlayerScore(player: PlayerState): number {
    return player.board.reduce((sum, card) => {
      return sum + this.calculateCardPower(card);
    }, 0);
  }
}