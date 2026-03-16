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

const rangedUnit = engine.createCardInstance("crinfrid_reavers_dragon_hunter_1");
const frostCard = engine.createCardInstance("frost");

engine.getState().players["p1"].hand.push(rangedUnit, engine.createCardInstance("crinfrid_reavers_dragon_hunter_2"));
engine.getState().players["p2"].hand.push(frostCard, engine.createCardInstance("frost"));

engine.dispatch({
  type: "PLAY_CARD",
  playerId: "p1",
  cardId: rangedUnit.id,
  row: "RANGED" as Row,
});

engine.dispatch({
  type: "PLAY_CARD",
  playerId: "p2",
  cardId: frostCard.id,
  row: "RANGED" as Row,
});

const rangedPower = engine.getRowPower("p1", "RANGED");
console.log("Siła wiersza RANGED gracza 1 po Frost:", rangedPower);
console.log("Stan wiersza RANGED gracza 1:", engine.getState().players["p1"].board.RANGED);