import { GameEngine } from "../../packages/game-engine/core/GameEngine";
import { GameState } from "../../packages/game-engine/core/GameState";
import { CardRegistrySetup } from "../../packages/game-engine/cards/CardRegistrySetup";

CardRegistrySetup(); 

const initialState: GameState = {
  round: 1,
  status: "IN_PROGRESS",
  currentPlayer: "p1",
  players: {
    p1: { id: "p1", hand: [], board: { MELEE: [], RANGED: [], SIEGE: [] }, passed: false, roundsWon: 0, faction: "NORTHERN_REALMS", graveyard: [] },
    p2: { id: "p2", hand: [], board: { MELEE: [], RANGED: [], SIEGE: [] }, passed: false, roundsWon: 0, faction: "NORTHERN_REALMS", graveyard: [] }
  }
};

const engine = new GameEngine(initialState);
const p1_cards = ["blue_stripes_commando_1", "blue_stripes_commando_2", "blue_stripes_commando_2", "blue_stripes_commando_2", "yarpen_zigrin"];
const p2_cards = ["crinfrid_reavers_dragon_hunter_1", "crinfrid_reavers_dragon_hunter_1", "keadweni_siege_expert_1", "balista_1", "keadweni_siege_expert_1"];

p1_cards.forEach(id => engine.getState().players.p1.hand.push(engine.createCardInstance(id)));
p2_cards.forEach(id => engine.getState().players.p2.hand.push(engine.createCardInstance(id)));


console.log("Before play:");
console.log("P1 score:", engine.getPlayerScore("p1"));
console.log("P2 score:", engine.getPlayerScore("p2"));

engine.dispatch({ type: "PLAY_CARD", playerId: "p1", cardId: engine.getState().players.p1.hand[0].id, row: "MELEE" }); 
console.log("\nAfter P1 blue_stripes_commando_1:");
console.log("P1 score:", engine.getPlayerScore("p1"));

engine.dispatch({ type: "PLAY_CARD", playerId: "p2", cardId: engine.getState().players.p2.hand[0].id, row: "RANGED" }); 
console.log("\nAfter P2 plays Crinfrid 1:");
console.log("P2 score:", engine.getPlayerScore("p2"));

engine.dispatch({ type: "PLAY_CARD", playerId: "p1", cardId: engine.getState().players.p1.hand[0].id, row: "MELEE" }); 
console.log("\nAfter P1 blue_stripes_commando_1:");
console.log("P1 score:", engine.getPlayerScore("p1"));

engine.dispatch({ type: "PLAY_CARD", playerId: "p2", cardId: engine.getState().players.p2.hand[0].id, row: "RANGED" }); 
console.log("\nAfter P2 plays Crinfrid 1:");
console.log("P2 score:", engine.getPlayerScore("p2"));

engine.dispatch({ type: "PLAY_CARD", playerId: "p1", cardId: engine.getState().players.p1.hand[0].id, row: "MELEE" }); 
console.log("\nAfter P1 blue_stripes_commando_1:");
console.log("P1 score:", engine.getPlayerScore("p1"));





engine.dispatch({ type: "PLAY_CARD", playerId: "p2", cardId: engine.getState().players.p2.hand[0].id, row: "SIEGE" });
console.log("\nAfter P2 plays keadweni_siege_expert_1:");
console.log("P2 score:", engine.getPlayerScore("p2"));
console.log("\nP2 row scores:", engine.getRowPower("p2", "SIEGE"));


engine.dispatch({ type: "PLAY_CARD", playerId: "p1", cardId: engine.getState().players.p1.hand[0].id, row: "MELEE" });
console.log("\nAfter P1 blue_stripes_commando_1:");
console.log("P1 score:", engine.getPlayerScore("p1"));

engine.dispatch({ type: "PLAY_CARD", playerId: "p2", cardId: engine.getState().players.p2.hand[0].id, row: "SIEGE" });
console.log("\nAfter P2 plays balista_1:");
console.log("P2 score:", engine.getPlayerScore("p2"));
console.log("\nP2 row scores:", engine.getRowPower("p2", "SIEGE"));

engine.dispatch({ type: "PLAY_CARD", playerId: "p1", cardId: engine.getState().players.p1.hand[0].id, row: "MELEE" });
console.log("\nAfter P1 plays keadweni_siege_expert_1:");
console.log("P1 score:", engine.getPlayerScore("p1"));
console.log("\nP1 row scores:", engine.getRowPower("p1", "MELEE"));

engine.dispatch({ type: "PLAY_CARD", playerId: "p2", cardId: engine.getState().players.p2.hand[0].id, row: "SIEGE" });
console.log("\nAfter P2 plays keadweni_siege_expert_1:");
console.log("P2 score:", engine.getPlayerScore("p2"));
console.log("\nP2 row scores:", engine.getRowPower("p2", "SIEGE"));





console.log("\nBoard P1:");
console.log(JSON.stringify(engine.getState().players.p1.board, null, 2));
console.log("\nBoard P2:");
console.log(JSON.stringify(engine.getState().players.p2.board, null, 2));

const meleeCardsP1 = engine.getState().players.p1.board.MELEE;
meleeCardsP1.forEach(c => {
  console.log(`Card ${c.id} power: ${engine.getCardPower(c)}`);
});