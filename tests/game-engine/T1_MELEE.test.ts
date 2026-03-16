import { describe, it, expect } from "vitest";
import { GameEngine } from "../../packages/game-engine/core/GameEngine";
import { GameState } from "../../packages/game-engine/core/GameState";
import { CardRegistrySetup } from "../../packages/game-engine/cards/CardRegistrySetup";


describe("Play melee cards", () => {
  it("should correctly play cards to MELEE row", () => {
    
    CardRegistrySetup();

    const initialState: GameState = {
      round: 1,
      status: "IN_PROGRESS",
      currentPlayer: "p1",
      players: {
        p1: { id: "p1", hand: [], board: { MELEE: [], RANGED: [], SIEGE: [] }, passed: false, roundsWon: 0, faction: "NORTHERN_REALMS", graveyard: [], mulligansUsed: 0, deck: [] },
        p2: { id: "p2", hand: [], board: { MELEE: [], RANGED: [], SIEGE: [] }, passed: false, roundsWon: 0, faction: "NORTHERN_REALMS", graveyard: [], mulligansUsed: 0, deck: [] }
      }
    };
    const engine = new GameEngine(initialState);

    const p1_cards = ["esterad_thyssen", "esterad_thyssen", "blue_stripes_commando_2", "blue_stripes_commando_2", "yarpen_zigrin"];
    const p2_cards = ["esterad_thyssen", "esterad_thyssen", "blue_stripes_commando_2", "blue_stripes_commando_2", "yarpen_zigrin"];

    p1_cards.forEach(id => engine.getState().players.p1.hand.push(engine.createCardInstance(id)));
    p2_cards.forEach(id => engine.getState().players.p2.hand.push(engine.createCardInstance(id)));

    engine.dispatch({ type: "PLAY_CARD", playerId: "p1", cardId: engine.getState().players.p1.hand[0].id, row: "MELEE" });
    engine.dispatch({ type: "PLAY_CARD", playerId: "p2", cardId: engine.getState().players.p2.hand[0].id, row: "MELEE" });
    engine.dispatch({ type: "PLAY_CARD", playerId: "p1", cardId: engine.getState().players.p1.hand[0].id, row: "MELEE" });
    engine.dispatch({ type: "PLAY_CARD", playerId: "p2", cardId: engine.getState().players.p2.hand[0].id, row: "MELEE" });
    engine.dispatch({ type: "PLAY_CARD", playerId: "p1", cardId: engine.getState().players.p1.hand[0].id, row: "MELEE" });
    engine.dispatch({ type: "PLAY_CARD", playerId: "p2", cardId: engine.getState().players.p2.hand[0].id, row: "MELEE" });

    const meleeCardsP1 = engine.getState().players.p1.board.MELEE;
    const meleeCardsP2 = engine.getState().players.p2.board.MELEE;
  
    const P1card1 = meleeCardsP1[0];
    const P1card2 = meleeCardsP1[1];
    const P1card3 = meleeCardsP1[2];

    const P2card1 = meleeCardsP2[0];
    const P2card2 = meleeCardsP2[1];
    const P2card3 = meleeCardsP2[2];

    expect(engine.getCardPower(P1card1)).toBe(10);
    expect(engine.getCardPower(P1card2)).toBe(10);
    expect(engine.getCardPower(P1card3)).toBe(4);
    expect(engine.getCardPower(P2card1)).toBe(10);
    expect(engine.getCardPower(P2card2)).toBe(10);
    expect(engine.getCardPower(P2card3)).toBe(4);

    expect(engine.getRowPower("p1", "MELEE")).toBe(24);
    expect(engine.getRowPower("p2", "MELEE")).toBe(24);

    expect(engine.getPlayerScore("p1")).toBe(24);
    expect(engine.getPlayerScore("p2")).toBe(24);

  });

});