import { CardRegistry } from "../cards/CardRegistry";
import { PlayerState } from "../core/PlayerState";
import { CardInstance } from "../core/CardInstance";
import { Modifier } from "./Modifier";
import { Row } from "../../shared/types/Row";

export class ScoringService {
  static calculateCardPower(card: CardInstance): number {
    const definition = CardRegistry.get(card.definitionId);

    if (definition.isHero) {
      return definition.basePower;
    }

    let power = definition.basePower;

    const setMods = card.modifiers.filter(m => m.type === "SET");
    if (setMods.length) {
      power = setMods[setMods.length - 1].value;
    }

    const addMods = card.modifiers.filter(m => m.type === "ADD");
    power += addMods.reduce((sum, m) => sum + m.value, 0);

    const multMods = card.modifiers.filter(m => m.type === "MULTIPLY");
    multMods.forEach(m => {
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