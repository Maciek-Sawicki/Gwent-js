import { GameEngine } from "../../packages/game-engine/core/GameEngine";
import { GameState } from "../../packages/game-engine/core/GameState";
import { Row } from "../../packages/shared/types/Row";
import { CardRegistry } from "../../packages/game-engine/cards/CardRegistry";
import { northernRealmsCards } from "../../packages/game-engine/cards/definitions/northernRealmsCards";

northernRealmsCards.forEach(card => CardRegistry.register(card));

const initialState: GameState = {
  round: 1,
  currentPlayer: "p1",
  status: "IN_PROGRESS",
  players: {
    p1: {
      id: "p1",
      faction: "NORTHERN_REALMS",
      hand: [],
      board: { MELEE: [], RANGED: [], SIEGE: [] },
      deck: [],
      graveyard: [],
      passed: false,
      roundsWon: 0,
      mulligansUsed: 0,
    },
    p2: {
      id: "p2",
      faction: "NEUTRAL",
      hand: [],
      board: { MELEE: [], RANGED: [], SIEGE: [] },
      deck: [],
      graveyard: [],
      passed: false,
      roundsWon: 0,
      mulligansUsed: 0,
    },
  },
};

const engine = new GameEngine(initialState);

const siegeUnit = engine.createCardInstance("catapult_1");
const rainCard = engine.createCardInstance("rain");

engine.getState().players["p1"].hand.push(siegeUnit, engine.createCardInstance("catapult_2"));
engine.getState().players["p2"].hand.push(rainCard, engine.createCardInstance("rain"));

engine.dispatch({
  type: "PLAY_CARD",
  playerId: "p1",
  cardId: siegeUnit.id,
  row: "SIEGE" as Row,
});

engine.dispatch({
  type: "PLAY_CARD",
  playerId: "p2",
  cardId: rainCard.id,
  row: "SIEGE" as Row,
});

const siegePower = engine.getRowPower("p1", "SIEGE");
console.log("Siła wiersza SIEGE gracza 1 po Rain:", siegePower);
console.log("Stan wiersza SIEGE gracza 1:", engine.getState().players["p1"].board.SIEGE);