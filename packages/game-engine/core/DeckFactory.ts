import { CardInstance } from "./CardInstance";
import { northernRealmsCards } from "../cards/definitions/northernRealmsCards";
import { GameEngine } from "./GameEngine";

export enum DeckMode {
  NORMAL = "NORMAL",
  DEMO = "DEMO",
  SPY_TEST = "SPY_TEST",
  DEMO_FIXED_HAND = "DEMO_FIXED_HAND",
}

export class DeckFactory {
  constructor(private engine: GameEngine) { }

  private createCardInstance(id: string): CardInstance {
    return this.engine.createCardInstance(id);
  }

  createNorthernRealmsDeck(): CardInstance[] {
    const nonLeaderCards = northernRealmsCards.filter(c => !c.isLeader);

    const deck: CardInstance[] = [];
    while (deck.length < 40) {
      for (const card of nonLeaderCards) {
        if (deck.length >= 40) break;
        deck.push(this.createCardInstance(card.id));
      }
    }

    return deck;
  }

  createDemoDecks() {
    const player1: CardInstance[] = [
      this.createCardInstance("ballista_1"),
      this.createCardInstance("ballista_2"),
      this.createCardInstance("blue_stripes_commando_1"),
      this.createCardInstance("blue_stripes_commando_2"),
      this.createCardInstance("kaedweni_siege_expert_1"),
      this.createCardInstance("kaedweni_siege_expert_2"),
      this.createCardInstance("prince_stennis"),
      this.createCardInstance("sigismund_dijkstra"),
      this.createCardInstance("dun_banner_medic"),
      this.createCardInstance("dethmold"),
      this.createCardInstance("ballista_1"),
      this.createCardInstance("ballista_1"),
      this.createCardInstance("ballista_1"),
      this.createCardInstance("ballista_1"),
    ];

    const player2: CardInstance[] = [
      this.createCardInstance("catapult_1"),
      this.createCardInstance("catapult_2"),
      this.createCardInstance("trebuchet_1"),
      this.createCardInstance("trebuchet_2"),
      this.createCardInstance("poor_fucking_infantry_1"),
      this.createCardInstance("poor_fucking_infantry_2"),
      this.createCardInstance("kaedweni_siege_expert_3"),
      this.createCardInstance("thaler"),
      this.createCardInstance("redanian_foot_soldier_2"),
      this.createCardInstance("shelden_skaggs"),
      this.createCardInstance("siege_tower_2"),
      this.createCardInstance("sile_de_bruyne"),
      this.createCardInstance("yarpen_zigrin"),
      this.createCardInstance("crinfrid_reavers_dragon_hunter_1"),
      this.createCardInstance("crinfrid_reavers_dragon_hunter_2"),
      this.createCardInstance("crinfrid_reavers_dragon_hunter_3"),
    ];

    return { player1, player2 };
  }

  createFixedDemoSetup() {
    const hand = [
      "sigismund_dijkstra",
      "ballista_1",
      "ballista_2",
      "blue_stripes_commando_1",
      "blue_stripes_commando_2",
      "kaedweni_siege_expert_1",
      "prince_stennis",
      "dun_banner_medic",
      "dethmold",
      "ves",
    ];

    const extraDeck = [
      "ballista_1",
      "ballista_1",
      "ballista_1",
      "siege_tower_1",
      "siege_tower_2",
      "yarpen_zigrin",
      "keira_metz",
      "sabrina_glevissig",
    ];

    return { hand, deck: extraDeck };

  }

  createSpyTestDeck() {
    const deck = Array.from({ length: 16 }, () =>
      this.createCardInstance("sigismund_dijkstra")
    );

    return {
      player1: [...deck],
      player2: [...deck]
    };
  }

  initializeDecks(players: Record<string, any>, mode: DeckMode) {
    const ids = Object.keys(players);

    if (mode === DeckMode.DEMO_FIXED_HAND) {
      const setup = this.createFixedDemoSetup();

      for (const player of Object.values(players)) {
        player.hand = setup.hand.map(id => this.createCardInstance(id));
        player.deck = setup.deck.map(id => this.createCardInstance(id));
      }

      console.log("Tryb: DEMO_FIXED_HAND");
      return;
    }

    if (mode === DeckMode.SPY_TEST) {
      const decks = this.createSpyTestDeck();
      players[ids[0]].deck = decks.player1;
      players[ids[1]].deck = decks.player2;
      console.log("Tryb: SPY_TEST");
      return;
    }

    if (mode === DeckMode.DEMO && ids.length >= 2) {
      const decks = this.createDemoDecks();
      players[ids[0]].deck = decks.player1;
      players[ids[1]].deck = decks.player2;
      console.log("Tryb: DEMO");
      return;
    }

    // NORMAL
    const allCards = this.createNorthernRealmsDeck();

    for (let i = allCards.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [allCards[i], allCards[j]] = [allCards[j], allCards[i]];
    }

    for (const player of Object.values(players)) {
      player.deck = allCards.slice(0, 20);
    }

    console.log("Tryb: NORMAL");
  }
}