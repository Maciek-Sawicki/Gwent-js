import type { Row } from "../../shared/types/Row";
import type { CardInstance } from "./CardInstance";
import type { PlayerBoard, PlayerState } from "./PlayerState";

function createEmptyBoard(): PlayerBoard {
  return { MELEE: [], RANGED: [], SIEGE: [] };
}

export class PlayerEntity {
  constructor(private readonly state: PlayerState) {}

  get id(): string {
    return this.state.id;
  }

  get passed(): boolean {
    return this.state.passed;
  }

  get handSize(): number {
    return this.state.hand.length;
  }

  get snapshot(): PlayerState {
    return this.state;
  }

  takeCardFromHand(cardId: string): CardInstance {
    const index = this.state.hand.findIndex(card => card.id === cardId);
    if (index === -1) throw new Error("Card not in hand");

    const [card] = this.state.hand.splice(index, 1);
    return card;
  }

  getCardFromHand(cardId: string): CardInstance {
    const card = this.state.hand.find(cardInHand => cardInHand.id === cardId);
    if (!card) throw new Error("Card not in hand");

    return card;
  }

  placeCardOnBoard(card: CardInstance, row: Row): void {
    card.row = row;
    this.state.board[row].push(card);
  }

  pass(): void {
    this.state.passed = true;
  }

  winRound(): void {
    this.state.roundsWon++;
  }

  prepareNextRound(): void {
    this.state.board = createEmptyBoard();
    this.state.passed = false;
  }

  drawCards(count: number): void {
    for (let i = 0; i < count; i++) {
      const card = this.state.deck.pop();
      if (!card) break;

      this.state.hand.push(card);
    }
  }

  returnCardToDeck(cardId: string): CardInstance {
    const card = this.takeCardFromHand(cardId);
    this.state.deck.push(card);
    return card;
  }

  ensureCanMulligan(): void {
    if (this.state.mulligansUsed >= 2) {
      throw new Error("No mulligans left");
    }
  }

  useMulligan(): void {
    this.state.mulligansUsed++;
  }
}
