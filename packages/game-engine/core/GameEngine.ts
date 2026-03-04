import { GameState } from "./GameState";
import { GameCommand} from "../../shared/commands/GameCommand";
import { EventQueue } from "../events/EventQueue";
import { ScoringService } from "../scoring/ScoringService";
import { CardRegistry } from "../cards/CardRegistry";
import { Modifier } from "../scoring/Modifier";

export class GameEngine {
  private state: GameState;
  private eventQueue = new EventQueue();

  constructor(initialState: GameState) {
    this.state = initialState;
  }

  getState(): GameState {
    return this.state;
  }

  dispatch(command: GameCommand): void {
    switch (command.type) {
      case "PLAY_CARD":
        this.handlePlayCard(command.playerId, command.cardId);
        break;

      case "PASS":
        this.handlePass(command.playerId);
        break;
    }

    this.processEvents();
  }

  addModifier(cardId: string, modifier: Modifier) {
    const card = this.findCard(cardId);
    card.modifiers.push(modifier);
  }

  removeModifiersBySource(cardId: string, source: string) {
    const card = this.findCard(cardId);
    card.modifiers = card.modifiers.filter(
      m => m.source !== source
    );
  }

  private findCard(cardId: string) {
    for (const player of Object.values(this.state.players)) {
      const card = player.board.find(c => c.id === cardId);
      if (card) return card;
    }
    throw new Error("Card not found");
  }

  private handlePlayCard(playerId: string, cardId: string) {
    this.ensureTurn(playerId);

    const player = this.state.players[playerId];
    const index = player.hand.findIndex(c => c.id === cardId);

    if (index === -1) {
      throw new Error("Card not in hand");
    }

    const [card] = player.hand.splice(index, 1);
    player.board.push(card);

    this.eventQueue.push({
      type: "CARD_PLAYED",
      playerId,
      cardId: card.id
    });

    this.switchTurn();
  }

  private handlePass(playerId: string) {
    this.ensureTurn(playerId);

    this.state.players[playerId].passed = true;

    this.switchTurn();

    this.checkRoundEnd();
  }

  private ensureTurn(playerId: string) {
    if (this.state.currentPlayer !== playerId) {
      throw new Error("Not your turn");
    }
  }

  private resolveRoundWinner(): string {
    const players = Object.values(this.state.players);

    const scored = players.map(p => ({
      id: p.id,
      score: this.getScore(p.id)
    }));

    scored.sort((a, b) => b.score - a.score);

    return scored[0].id;
  }

  private checkRoundEnd() {
    const allPassed = Object.values(this.state.players)
      .every(p => p.passed);

    if (!allPassed) return;

    this.state.status = "ROUND_END";

    const winnerId = this.resolveRoundWinner();
    this.state.players[winnerId].roundsWon++;

    this.prepareNextRound();
  }

  private prepareNextRound() {
    Object.values(this.state.players).forEach(p => {
      p.board = [];
      p.passed = false;
    });

    this.state.round++;

    const someoneWon = Object.values(this.state.players)
      .some(p => p.roundsWon === 2);

    if (someoneWon) {
      this.state.status = "FINISHED";
    } else {
      this.state.status = "IN_PROGRESS";
    }
  }

  private switchTurn() {
    const ids = Object.keys(this.state.players);
    const currentIndex = ids.indexOf(this.state.currentPlayer);
    const nextIndex = (currentIndex + 1) % ids.length;

    this.state.currentPlayer = ids[nextIndex];
  }

  private processEvents() {
    this.eventQueue.process(event => {

      switch (event.type) {

        case "CARD_PLAYED": {
          const player = this.state.players[event.playerId];
          const card = player.board.find(c => c.id === event.cardId);
          if (!card) return;

          const definition = CardRegistry.get(card.definitionId);

          if (definition.onPlay) {
            definition.onPlay({
              engine: this,
              state: this.state,
              playerId: event.playerId,
              cardInstanceId: event.cardId
            });
          }

          break;
        }

        case "PLAYER_PASSED":
          break;
      }

    });
  }

  createCardInstance(definitionId: string) {
    return {
      id: crypto.randomUUID(),
      definitionId,
      modifiers: []
    };
  }


  getScore(playerId: string): number {
    return ScoringService.calculatePlayerScore(
      this.state.players[playerId]
    );
  }
}