import { GameState } from "./GameState"
import { GameCommand } from "../../shared/commands/GameCommand"
import { EventQueue } from "../events/EventQueue"
import { CardRegistry } from "../cards/CardRegistry"
import { Row } from "../../shared/types/Row"
import { CardInstance } from "./CardInstance"
import { PlayerState } from "./PlayerState"
import { Modifier } from "../scoring/Modifier"
import { ScoringService } from "../scoring/ScoringService"
import { northernRealmsCards } from "../cards/definitions/northernRealmsCards"

export class GameEngine {
  private state: GameState
  private eventQueue = new EventQueue()

  constructor(initialState: GameState) {
    this.state = initialState
  }

  getState(): GameState {
    return this.state
  }

  // Ważny bug do naprawy

  // > play 0 RANGED
  // Playing Balista -> RANGED
  // Server error: Error: Card cannot be played on this row
  // > play 0 SIEGE
  // Playing Balista -> SIEGE
  // Server error: Error: Card not in hand

  // jeżeli wibierzemy rząd, na którym karta nie może być zagrana, to karta znika z ręki i nie trafia na planszę.
  // Dzieje się tak dlatego, że najpierw usuwamy kartę z ręki, a dopiero potem sprawdzamy, czy można ją zagrać na dany rząd.
  // Jeśli nie można, to rzucamy wyjątek, ale karta już została usunięta z ręki i nie wraca na nią.
  // Giga ważne do naprawy, bo inaczej gra jest niegrywalna


  dispatch(command: GameCommand): void {
    if (this.state.status === "FINISHED") {
      console.log("[ENGINE] Command ignored. Game is already finished.");
      return;
    }

    switch (command.type) {
      case "PLAY_CARD":
        console.log("[ENGINE] Trying to play cardId:", command.cardId);
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

    const card = player.hand[index];
    const definition = CardRegistry.get(card.definitionId);

    if (!definition.allowedRows.includes(row)) {
      throw new Error("Card cannot be played on this row");
    }
    card.row = row;
    player.board[row].push(card);
    player.hand.splice(index, 1);
    this.recalculateRowEffects(playerId, row);

    this.eventQueue.push({
      type: "CARD_PLAYED",
      playerId,
      cardId,
      row
    });
    this.switchTurnToNextActivePlayer();
  }

  private handlePass(playerId: string) {
    const player = this.state.players[playerId];
    if (player.passed) {
      console.log(`[PASS IGNORED] Player ${playerId} already passed.`);
      return;
    }
    player.passed = true;
    console.log(`[PASS] Player ${playerId} has passed.`)
    this.switchTurnToNextActivePlayer();
    this.checkRoundEnd()
  }

  private switchTurnToNextActivePlayer() {
    const playerIds = Object.keys(this.state.players);
    let currentIndex = playerIds.indexOf(this.state.currentPlayer);

    for (let i = 1; i <= playerIds.length; i++) {
      const nextIndex = (currentIndex + i) % playerIds.length;
      const nextPlayerId = playerIds[nextIndex];

      if (!this.state.players[nextPlayerId].passed) {
        this.state.currentPlayer = nextPlayerId;
        console.log(`[TURN] Next active player: ${nextPlayerId}`);
        return;
      }
    }
    console.log("[TURN] All players passed, ending round...");
    this.checkRoundEnd();
  }

  private ensureTurn(playerId: string) {
    if (this.state.players[playerId].passed) {
      throw new Error("You have already passed");
    }

    if (this.state.currentPlayer !== playerId) {
      throw new Error("Not your turn");
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

  private resolveRoundWinner(): string[] {
    const players = Object.values(this.state.players)

    const scored = players.map(p => ({
      id: p.id,
      score: this.getPlayerScore(p.id)
    }))

    const maxScore = Math.max(...scored.map(s => s.score))

    return scored
      .filter(s => s.score === maxScore)
      .map(s => s.id)
  }

  private checkRoundEnd() {
    if (this.state.status === "FINISHED") {
      console.log("[ENGINE] Round end check ignored. Game is already finished.");
      return;
    }

    const allPassed = Object.values(this.state.players).every(p => p.passed);
    if (!allPassed) return;

    console.log("[ROUND END] All players passed, resolving round...");
    this.state.status = "ROUND_END";

    const winners = this.resolveRoundWinner();

    for (const winnerId of winners) {
      const player = this.state.players[winnerId];
      player.roundsWon++;
      console.log(`[ROUND RESULT] ${winnerId} wins the round (total wins: ${player.roundsWon})`);
    }

    const players = Object.values(this.state.players);

    const someoneHasTwoWins = players.some(p => p.roundsWon >= 2);
    const reachedMaxRounds = this.state.round >= 3;

    if (someoneHasTwoWins || reachedMaxRounds) {
      this.state.status = "FINISHED";

      const gameWinner = [...players].sort((a, b) => b.roundsWon - a.roundsWon)[0];

      console.log(
        `[GAME FINISHED] Winner: ${gameWinner.id} with ${gameWinner.roundsWon} rounds`
      );

      return;
    }

    this.prepareNextRound();
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

  drawCards(playerId: string, count: number) {
    const player = this.state.players[playerId]

    for (let i = 0; i < count; i++) {
      const card = player.deck.pop()
      if (!card) break

      player.hand.push(card)
    }
  }

  shuffleDeck(playerId: string) {
    const deck = this.state.players[playerId].deck

    for (let i = deck.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1))
        ;[deck[i], deck[j]] = [deck[j], deck[i]]
    }
  }

  startGame() {
    for (const player of Object.values(this.state.players)) {
      this.shuffleDeck(player.id)
      this.drawCards(player.id, 10)
    }
  }

  createDeck(definitionIds: string[]): CardInstance[] {
    return definitionIds.map(id => this.createCardInstance(id))
  }

  createNorthernRealmsDeck(): CardInstance[] {
    return northernRealmsCards.map(card =>
      this.createCardInstance(card.id)
    )
  }

  initializeDecks() {
    for (const player of Object.values(this.state.players)) {
      if (player.faction === "NORTHERN_REALMS") {
        player.deck = this.createNorthernRealmsDeck();
      }
    }
  }

  mulliganCard(playerId: string, cardId: string) {
    const player = this.state.players[playerId]
    if (player.mulligansUsed >= 2) {
      throw new Error("No mulligans left")
    }
    const index = player.hand.findIndex(c => c.id === cardId)
    if (index === -1) {
      throw new Error("Card not in hand")
    }
    const [card] = player.hand.splice(index, 1)
    player.deck.push(card)
    this.shuffleDeck(playerId)
    this.drawCards(playerId, 1)
    player.mulligansUsed++
  }
}
