
import { describe, it, expect } from "vitest";
import { GameEngine } from "../../packages/game-engine/core/GameEngine";
import { GameState } from "../../packages/game-engine/core/GameState";
import { CardRegistrySetup } from "../../packages/game-engine/cards/CardRegistrySetup";


describe("Play ranged cards", () => {
  it("should correctly play cards to RANGED row", () => {
    
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

    const p1_cards = ["dethmold", "dethmold", "crinfrid_reavers_dragon_hunter_1"];
    const p2_cards = ["dethmold", "dethmold", "crinfrid_reavers_dragon_hunter_1"];

    p1_cards.forEach(id => engine.getState().players.p1.hand.push(engine.createCardInstance(id)));
    p2_cards.forEach(id => engine.getState().players.p2.hand.push(engine.createCardInstance(id)));

    engine.dispatch({ type: "PLAY_CARD", playerId: "p1", cardId: engine.getState().players.p1.hand[0].id, row: "RANGED" });
    engine.dispatch({ type: "PLAY_CARD", playerId: "p2", cardId: engine.getState().players.p2.hand[0].id, row: "RANGED" });
    engine.dispatch({ type: "PLAY_CARD", playerId: "p1", cardId: engine.getState().players.p1.hand[0].id, row: "RANGED" });
    engine.dispatch({ type: "PLAY_CARD", playerId: "p2", cardId: engine.getState().players.p2.hand[0].id, row: "RANGED" });
    engine.dispatch({ type: "PLAY_CARD", playerId: "p1", cardId: engine.getState().players.p1.hand[0].id, row: "RANGED" });
    engine.dispatch({ type: "PLAY_CARD", playerId: "p2", cardId: engine.getState().players.p2.hand[0].id, row: "RANGED" });

    const rangedCardsP1 = engine.getState().players.p1.board.RANGED;
    const rangedCardsP2 = engine.getState().players.p2.board.RANGED;
  
    const P1card1 = rangedCardsP1[0];
    const P1card2 = rangedCardsP1[1];
    const P1card3 = rangedCardsP1[2];

    const P2card1 = rangedCardsP2[0];
    const P2card2 = rangedCardsP2[1];
    const P2card3 = rangedCardsP2[2];

    expect(engine.getCardPower(P1card1)).toBe(6);
    expect(engine.getCardPower(P1card2)).toBe(6);
    expect(engine.getCardPower(P1card3)).toBe(5);
    expect(engine.getCardPower(P2card1)).toBe(6);
    expect(engine.getCardPower(P2card2)).toBe(6);
    expect(engine.getCardPower(P2card3)).toBe(5);

    expect(engine.getRowPower("p1", "RANGED")).toBe(17);
    expect(engine.getRowPower("p2", "RANGED")).toBe(17);

    expect(engine.getPlayerScore("p1")).toBe(17);
    expect(engine.getPlayerScore("p2")).toBe(17);

  });

});

