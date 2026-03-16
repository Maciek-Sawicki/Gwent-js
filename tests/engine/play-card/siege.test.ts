import { describe, it, expect } from "vitest";
import { GameEngine } from "../../../packages/game-engine/core/GameEngine";
import { GameState } from "../../../packages/game-engine/core/GameState";
import { CardRegistrySetup } from "../../../packages/game-engine/cards/CardRegistrySetup";


describe("Play siege cards", () => {
  it("should correctly play cards to SIEGE row", () => {
    
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

    const p1_cards = ["siege_tower_1", "siege_tower_2"];
    const p2_cards = ["siege_tower_1", "siege_tower_2"];

    p1_cards.forEach(id => engine.getState().players.p1.hand.push(engine.createCardInstance(id)));
    p2_cards.forEach(id => engine.getState().players.p2.hand.push(engine.createCardInstance(id)));

    engine.dispatch({ type: "PLAY_CARD", playerId: "p1", cardId: engine.getState().players.p1.hand[0].id, row: "SIEGE" });
    engine.dispatch({ type: "PLAY_CARD", playerId: "p2", cardId: engine.getState().players.p2.hand[0].id, row: "SIEGE" });
    engine.dispatch({ type: "PLAY_CARD", playerId: "p1", cardId: engine.getState().players.p1.hand[0].id, row: "SIEGE" });
    engine.dispatch({ type: "PLAY_CARD", playerId: "p2", cardId: engine.getState().players.p2.hand[0].id, row: "SIEGE" });

    const siegeCardsP1 = engine.getState().players.p1.board.SIEGE;
    const siegeCardsP2 = engine.getState().players.p2.board.SIEGE;
  
    const P1card1 = siegeCardsP1[0];
    const P1card2 = siegeCardsP1[1];

    const P2card1 = siegeCardsP2[0];
    const P2card2 = siegeCardsP2[1];

    expect(engine.getCardPower(P1card1)).toBe(6);
    expect(engine.getCardPower(P1card2)).toBe(6);
    expect(engine.getCardPower(P2card1)).toBe(6);
    expect(engine.getCardPower(P2card2)).toBe(6);

    expect(engine.getRowPower("p1", "SIEGE")).toBe(12);
    expect(engine.getRowPower("p2", "SIEGE")).toBe(12);

    expect(engine.getPlayerScore("p1")).toBe(12);
    expect(engine.getPlayerScore("p2")).toBe(12);

  });

});
