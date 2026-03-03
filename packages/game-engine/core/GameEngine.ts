import { GameState } from "./GameState";
import { EventQueue } from "../events/EventQueue";
import { ScoringService } from "../scoring/ScoringService";

export class GameEngine {
  private state: GameState;
  private eventQueue = new EventQueue();

  constructor(initialState: GameState) {
    this.state = initialState;
  }

  getState(): GameState {
    return this.state;
  }

  playCard(playerId: string, cardId: string) {
    const player = this.state.players[playerId];

    if (this.state.currentPlayer !== playerId) {
      throw new Error("Not your turn");
    }

    const cardIndex = player.hand.findIndex(c => c.id === cardId);
    if (cardIndex === -1) {
      throw new Error("Card not found");
    }

    const [card] = player.hand.splice(cardIndex, 1);
    player.board.push(card);

    this.switchTurn();
  }

  pass(playerId: string) {
    const player = this.state.players[playerId];
    player.passed = true;

    this.switchTurn();
  }

  private switchTurn() {
    const playerIds = Object.keys(this.state.players);
    const currentIndex = playerIds.indexOf(this.state.currentPlayer);
    const nextIndex = (currentIndex + 1) % playerIds.length;
    this.state.currentPlayer = playerIds[nextIndex];
  }

  getScore(playerId: string): number {
    return ScoringService.calculateScore(
      this.state.players[playerId]
    );
  }
}