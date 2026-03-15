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
import { spyEffect } from "../effects/spy"

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

    // Sprawdź czy gracz nie spasował przed wykonaniem komendy
    const player = this.state.players[command.playerId];
    if (player && player.passed && command.type === "PLAY_CARD") {
      console.log(`[ENGINE] Command ignored. Player ${command.playerId} has already passed.`);
      return;
    }

    switch (command.type) {
      case "PLAY_CARD":
        console.log("[ENGINE] Trying to play cardId:", command.cardId, "by player:", command.playerId, "currentPlayer:", this.state.currentPlayer);
        try {
          this.handlePlayCard(
            command.playerId,
            command.cardId,
            command.row
          )
        } catch (error) {
          console.log("[ENGINE] Error playing card:", error);
          throw error;
        }
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
    
    // Sprawdź czy gracz nie spasował
    if (player.passed) {
      throw new Error("You have already passed");
    }
    
    const index = player.hand.findIndex(c => c.id === cardId);
    if (index === -1) throw new Error("Card not in hand");

    const card = player.hand[index];
    const definition = CardRegistry.get(card.definitionId);

    if (!definition.allowedRows.includes(row)) {
      throw new Error("Card cannot be played on this row");
    }
    
    // Sprawdź czy to karta Spy - jeśli tak, połóż na planszę przeciwnika
    const isSpy = definition.onPlay === spyEffect;
    const targetPlayerId = isSpy ? this.getOpponentId(playerId) : playerId;
    const targetPlayer = this.state.players[targetPlayerId];
    
    card.row = row;
    targetPlayer.board[row].push(card);
    player.hand.splice(index, 1);
    
    // Przelicz efekty dla planszy na którą karta została położona
    this.recalculateRowEffects(targetPlayerId, row);

    this.eventQueue.push({
      type: "CARD_PLAYED",
      playerId,
      cardId,
      row
    });

    // Jeśli graczowi skończyły się karty w ręce, automatycznie spasuje
    if (player.hand.length === 0) {
      console.log(`[AUTO PASS] Player ${playerId} has no cards left, auto-passing`);
      player.passed = true;
    }

    this.switchTurnToNextActivePlayer();
  }

  private getOpponentId(playerId: string): string {
    const playerIds = Object.keys(this.state.players);
    return playerIds.find(id => id !== playerId) || playerId;
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

    // Sprawdź czy aktualny gracz nie ma kart - jeśli nie ma, automatycznie spasuj
    const currentPlayer = this.state.players[this.state.currentPlayer];
    if (currentPlayer && !currentPlayer.passed && currentPlayer.hand.length === 0) {
      console.log(`[AUTO PASS] Player ${this.state.currentPlayer} has no cards left, auto-passing`);
      currentPlayer.passed = true;
    }

    // Sprawdź czy wszyscy gracze spasowali
    const allPassed = playerIds.every(id => this.state.players[id].passed);
    if (allPassed) {
      console.log("[TURN] All players passed, ending round...");
      this.checkRoundEnd();
      return;
    }

    for (let i = 1; i <= playerIds.length; i++) {
      const nextIndex = (currentIndex + i) % playerIds.length;
      const nextPlayerId = playerIds[nextIndex];
      const nextPlayer = this.state.players[nextPlayerId];

      // Sprawdź czy następny gracz nie ma kart - jeśli nie ma, automatycznie spasuj
      if (!nextPlayer.passed && nextPlayer.hand.length === 0) {
        console.log(`[AUTO PASS] Player ${nextPlayerId} has no cards left, auto-passing`);
        nextPlayer.passed = true;
        // Sprawdź ponownie czy wszyscy spasowali
        const allPassedNow = playerIds.every(id => this.state.players[id].passed);
        if (allPassedNow) {
          console.log("[TURN] All players passed, ending round...");
          this.checkRoundEnd();
          return;
        }
        // Kontynuuj szukanie następnego aktywnego gracza
        continue;
      }

      if (!nextPlayer.passed) {
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
    // Wyklucz leaderów z talii (są oddzielnie)
    const nonLeaderCards = northernRealmsCards.filter(card => !card.isLeader);
    
    // Utwórz pulę 40 kart (możemy mieć duplikaty jeśli potrzeba)
    // Jeśli mamy mniej niż 40 kart, powtarzamy karty
    const deck: CardInstance[] = [];
    while (deck.length < 40) {
      for (const card of nonLeaderCards) {
        if (deck.length >= 40) break;
        deck.push(this.createCardInstance(card.id));
      }
    }
    
    return deck;
  }

  /**
   * Tworzy stałe talie z kartami pokazującymi wszystkie efekty
   * Każdy gracz dostaje karty które demonstrują:
   * - Tight Bond (Ballista, Catapult, Blue Stripes Commando, etc.)
   * - Morale Boost (Keadweni Siege Expert)
   * - Spy (Prince Stennis, Sigismund Dijkstra, Thaler)
   * - Medic (Dun Banner Medic)
   */
  createDemonstrationDecks(): { player1: CardInstance[], player2: CardInstance[] } {
    // Karty pokazujące efekty:
    const tightBondCards = [
      "balista_1", "balista_2", // Tight Bond - 2 karty (SIEGE)
      "catapult_1", "catapult_2", // Tight Bond - 2 karty (SIEGE)
      "blue_stripes_commando_1", "blue_stripes_commando_2", "blue_stripes_commando_3", // Tight Bond - 3 karty (MELEE)
      "trebuchet_1", "trebuchet_2", // Tight Bond - 2 karty (SIEGE)
      "poor_fucking_infantry_1", "poor_fucking_infantry_2", "poor_fucking_infantry_3", // Tight Bond - 3 karty (MELEE)
      "crinfrid_reavers_dragon_hunter_1", "crinfrid_reavers_dragon_hunter_2", "crinfrid_reavers_dragon_hunter_3", // Tight Bond - 3 karty (RANGED)
    ];
    
    const moraleBoostCards = [
      "keadweni_siege_expert_1", "keadweni_siege_expert_2", "keadweni_siege_expert_3", // Morale Boost - 3 karty (SIEGE)
    ];
    
    const spyCards = [
      "prince_stennis", // Spy (MELEE)
      "sigismund_dijkstra", // Spy (MELEE)
      "thaler", // Spy (SIEGE)
    ];
    
    const medicCards = [
      "dun_banner_medic", // Medic (SIEGE)
    ];
    
    // Pozostałe karty do wypełnienia talii
    const otherCards = [
      "dethmold",
      "esterad_thyssen",
      "john_natalis",
      "keira_metz",
      "philippa_eilhart",
      "redanian_foot_soldier_1", "redanian_foot_soldier_2",
      "sabrina_glevissig",
      "shelden_skaggs",
      "siege_tower_1", "siege_tower_2",
      "siegfried_of_denesle",
      "sile_de_bruyne",
      "vernon_roche",
      "ves",
      "yarpen_zigrin",
    ];
    
    // Talia gracza 1 (20 kart) - zawiera wszystkie efekty
    const player1Deck: CardInstance[] = [
      // Tight Bond przykłady (można pokazać efekt z 2 kartami)
      this.createCardInstance("balista_1"),
      this.createCardInstance("balista_2"), // Tight Bond - razem = 12+12=24
      this.createCardInstance("blue_stripes_commando_1"),
      this.createCardInstance("blue_stripes_commando_2"), // Tight Bond - razem = 8+8=16
      // Morale Boost
      this.createCardInstance("keadweni_siege_expert_1"),
      this.createCardInstance("keadweni_siege_expert_2"), // Morale Boost - każda daje +1 innym
      // Spy
      this.createCardInstance("prince_stennis"), // Spy
      this.createCardInstance("sigismund_dijkstra"), // Spy
      // Medic
      this.createCardInstance("dun_banner_medic"), // Medic
      // Pozostałe karty (11 kart)
      this.createCardInstance("dethmold"),
      this.createCardInstance("esterad_thyssen"),
      this.createCardInstance("john_natalis"),
      this.createCardInstance("keira_metz"),
      this.createCardInstance("philippa_eilhart"),
      this.createCardInstance("redanian_foot_soldier_1"),
      this.createCardInstance("sabrina_glevissig"),
      this.createCardInstance("siege_tower_1"),
      this.createCardInstance("siegfried_of_denesle"),
      this.createCardInstance("vernon_roche"),
      this.createCardInstance("ves"),
    ];
    
    // Talia gracza 2 (20 kart) - zawiera wszystkie efekty
    const player2Deck: CardInstance[] = [
      // Tight Bond przykłady
      this.createCardInstance("catapult_1"),
      this.createCardInstance("catapult_2"), // Tight Bond - razem = 16+16=32
      this.createCardInstance("trebuchet_1"),
      this.createCardInstance("trebuchet_2"), // Tight Bond - razem = 12+12=24
      this.createCardInstance("poor_fucking_infantry_1"),
      this.createCardInstance("poor_fucking_infantry_2"), // Tight Bond - razem = 2+2=4
      // Morale Boost
      this.createCardInstance("keadweni_siege_expert_3"), // Morale Boost
      // Spy
      this.createCardInstance("thaler"), // Spy
      // Pozostałe karty (12 kart)
      this.createCardInstance("redanian_foot_soldier_2"),
      this.createCardInstance("shelden_skaggs"),
      this.createCardInstance("siege_tower_2"),
      this.createCardInstance("sile_de_bruyne"),
      this.createCardInstance("yarpen_zigrin"),
      this.createCardInstance("crinfrid_reavers_dragon_hunter_1"),
      this.createCardInstance("crinfrid_reavers_dragon_hunter_2"),
      this.createCardInstance("crinfrid_reavers_dragon_hunter_3"), // Tight Bond - razem = 15+15+15=45
      this.createCardInstance("blue_stripes_commando_3"), // Dodatkowa dla Tight Bond
      this.createCardInstance("poor_fucking_infantry_3"), // Dodatkowa dla Tight Bond
      this.createCardInstance("dethmold"), // Duplikat dla wypełnienia
      this.createCardInstance("keira_metz"), // Duplikat dla wypełnienia
    ];
    
    return {
      player1: player1Deck,
      player2: player2Deck
    };
  }

  initializeDecks() {
    const playerIds = Object.keys(this.state.players);
    
    if (playerIds.length >= 2) {
      // Użyj stałych talii z kartami pokazującymi wszystkie efekty
      const decks = this.createDemonstrationDecks();
      this.state.players[playerIds[0]].deck = decks.player1;
      this.state.players[playerIds[1]].deck = decks.player2;
    } else {
      // Fallback: jeśli tylko jeden gracz, użyj losowej talii
      const allCards = this.createNorthernRealmsDeck();
      for (let i = allCards.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [allCards[i], allCards[j]] = [allCards[j], allCards[i]];
      }
      for (const player of Object.values(this.state.players)) {
        if (player.faction === "NORTHERN_REALMS") {
          player.deck = allCards.slice(0, 20);
        }
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
