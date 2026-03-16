import { describe, it, expect } from "vitest";
import { GameEngine } from "../../../packages/game-engine/core/GameEngine";
import { GameState } from "../../../packages/game-engine/core/GameState";
import { CardRegistrySetup } from "../../../packages/game-engine/cards/CardRegistrySetup";


describe("tight bond", () => {
  it("should double power when two cards exist", () => {
    
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

    const p1_cards = ["blue_stripes_commando_1", "blue_stripes_commando_2", "blue_stripes_commando_2", "blue_stripes_commando_2", "yarpen_zigrin"];
    const p2_cards = ["crinfrid_reavers_dragon_hunter_1", "crinfrid_reavers_dragon_hunter_1", "keadweni_siege_expert_1", "balista_1", "keadweni_siege_expert_1"];

    p1_cards.forEach(id => engine.getState().players.p1.hand.push(engine.createCardInstance(id)));
    p2_cards.forEach(id => engine.getState().players.p2.hand.push(engine.createCardInstance(id)));

    engine.dispatch({ type: "PLAY_CARD", playerId: "p1", cardId: engine.getState().players.p1.hand[0].id, row: "MELEE" });
    engine.dispatch({ type: "PLAY_CARD", playerId: "p2", cardId: engine.getState().players.p2.hand[0].id, row: "RANGED" });
    engine.dispatch({ type: "PLAY_CARD", playerId: "p1", cardId: engine.getState().players.p1.hand[0].id, row: "MELEE" });

    const meleeCardsP1 = engine.getState().players.p1.board.MELEE;
    const card1 = meleeCardsP1[0];
    const card2 = meleeCardsP1[1];

    expect(engine.getCardPower(card1)).toBe(8);
    expect(engine.getCardPower(card2)).toBe(8);
  });

});
