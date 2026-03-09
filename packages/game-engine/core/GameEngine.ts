import { GameState } from "./GameState"
import { GameCommand } from "../../shared/commands/GameCommand"
import { EventQueue } from "../events/EventQueue"
import { CardRegistry } from "../cards/CardRegistry"
import { Row } from "../../shared/types/Row"
import { CardInstance } from "./CardInstance"
import { PlayerState } from "./PlayerState"
import { Modifier } from "../scoring/Modifier"
import { ScoringService } from "../scoring/ScoringService"

export class GameEngine {
  private state: GameState
  private eventQueue = new EventQueue()

  constructor(initialState: GameState) {
    this.state = initialState
  }

  getState(): GameState {
    return this.state
  }

  dispatch(command: GameCommand): void {
    switch (command.type) {
      case "PLAY_CARD":
        this.handlePlayCard(
          command.playerId,
          command.cardId,
          command.row
        )
        break
      case "PASS":
        this.handlePass(command.playerId)
        break
    }
    this.processEvents()
  }

  private handlePlayCard(playerId: string, cardId: string, row: Row) {
    this.ensureTurn(playerId);

    const player = this.state.players[playerId];
    const index = player.hand.findIndex(c => c.id === cardId);

    if (index === -1) throw new Error("Card not in hand");

    const [card] = player.hand.splice(index, 1);
    const definition = CardRegistry.get(card.definitionId);

    if (!definition.allowedRows.includes(row)) {
      throw new Error("Card cannot be played on this row");
    }

    card.row = row;
    player.board[row].push(card);
    this.recalculateRowEffects(playerId, row);

    this.eventQueue.push({
      type: "CARD_PLAYED",
      playerId,
      cardId,
      row
    });

    this.switchTurn();
  }

  private handlePass(playerId: string) {
    this.ensureTurn(playerId)
    this.state.players[playerId].passed = true
    this.switchTurn()
    this.checkRoundEnd()
  }

  private ensureTurn(playerId: string) {
    if (this.state.currentPlayer !== playerId) {
      throw new Error("Not your turn")
    }
  }

  private switchTurn() {
    const ids = Object.keys(this.state.players)
    const currentIndex = ids.indexOf(this.state.currentPlayer)
    const nextIndex = (currentIndex + 1) % ids.length
    this.state.currentPlayer = ids[nextIndex]
  }

  private processEvents() {
    this.eventQueue.process(event => {
      if (event.type === "CARD_PLAYED") {
        const card = this.getCard(event.cardId)
        const definition = CardRegistry.get(card.definitionId)
        if (definition.onPlay) {
          definition.onPlay({
            engine: this,
            state: this.state,
            playerId: event.playerId,
            cardInstanceId: event.cardId,
            row: event.row
          })
          console.log("onPlay triggered for", event.cardId, "definition", definition.id, "by player", event.playerId, "on row", event.row);
        }
      }
    })
  }

  recalculateRowEffects(playerId: string, row: Row) {
    const cards = this.getRow(playerId, row);

    for (const card of cards) {
      this.removeModifiersBySource(card.id, "tightBond");
    }

    for (const card of cards) {
      const definition = CardRegistry.get(card.definitionId);

      if (definition.isHero) continue

      if (definition.ongoing) {
        definition.ongoing({
          engine: this,
          state: this.state,
          playerId,
          cardInstanceId: card.id,
          row
        });
      }
    }
  }

  createCardInstance(definitionId: string): CardInstance {
    const def = CardRegistry.get(definitionId);
    return {
      id: crypto.randomUUID(),
      definitionId,
      row: undefined,
      modifiers: [],
      bondGroup: def.bondGroup // <-- dodajemy bondGroup do instancji
    };
  }

  getCard(cardId: string): CardInstance {
    for (const player of Object.values(this.state.players)) {
      for (const row of Object.values(player.board)) {
        const card = row.find(
          (c: CardInstance) => c.id === cardId
        )
        if (card) return card
      }
    }
    throw new Error("Card not found")
  }

  getRow(playerId: string, row: Row): CardInstance[] {
    return this.state.players[playerId].board[row]
  }

  getAllBoardCards(): CardInstance[] {
    const cards: CardInstance[] = []
    for (const player of Object.values(this.state.players)) {
      cards.push(
        ...player.board.MELEE,
        ...player.board.RANGED,
        ...player.board.SIEGE
      )
    }
    return cards
  }

  destroyCard(cardId: string) {
    for (const player of Object.values(this.state.players)) {
      for (const rowName of ["MELEE", "RANGED", "SIEGE"] as Row[]) {
        const row = player.board[rowName]
        this.recalculateRowEffects(player.id, rowName)
        const index = row.findIndex(
          (c: CardInstance) => c.id === cardId
        )
        if (index !== -1) {
          const [card] = row.splice(index, 1)
          player.graveyard.push(card)
          return
        }
      }
    }
  }

  addModifier(cardId: string, modifier: Modifier) {
    const card = this.getCard(cardId)
    card.modifiers.push(modifier)
  }

  removeModifier(cardId: string, modifierId: string) {
    const card = this.getCard(cardId)
    card.modifiers = card.modifiers.filter(
      m => m.id !== modifierId
    )
  }

  removeModifiersBySource(cardId: string, source: string) {
    const card = this.getCard(cardId)
    card.modifiers = card.modifiers.filter(
      m => m.source !== source
    )
  }

  getCardPower(card: CardInstance): number {
    return ScoringService.calculateCardPower(card)
  }

  getRowPower(playerId: string, row: Row): number {
    return ScoringService.calculateRowScore(this.getRow(playerId, row))
  }

  getPlayerScore(playerId: string): number {
    return ScoringService.calculatePlayerScore(this.state.players[playerId])
  }

  private resolveRoundWinner(): string {
    const players = Object.values(this.state.players)
    const scored = players.map(p => ({
      id: p.id,
      score: this.getPlayerScore(p.id)
    }))
    scored.sort((a, b) => b.score - a.score)
    return scored[0].id
  }

  private checkRoundEnd() {
    const allPassed = Object.values(this.state.players)
      .every(p => p.passed)
    if (!allPassed) return
    this.state.status = "ROUND_END"
    const winner = this.resolveRoundWinner()
    this.state.players[winner].roundsWon++
    this.prepareNextRound()
  }

  private prepareNextRound() {
    for (const player of Object.values(this.state.players)) {
      player.board = {
        MELEE: [],
        RANGED: [],
        SIEGE: []
      }
      player.passed = false
    }
    this.state.round++
  }
}