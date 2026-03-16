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

const meleeUnit = engine.createCardInstance("blue_stripes_commando_1");
const fogCard = engine.createCardInstance("fog");

engine.getState().players["p1"].hand.push(meleeUnit, engine.createCardInstance("blue_stripes_commando_2"));
engine.getState().players["p2"].hand.push(fogCard, engine.createCardInstance("fog"));

engine.dispatch({
  type: "PLAY_CARD",
  playerId: "p1",
  cardId: meleeUnit.id,
  row: "MELEE" as Row,
});

engine.dispatch({
  type: "PLAY_CARD",
  playerId: "p2",
  cardId: fogCard.id,
  row: "MELEE" as Row,
});

const meleePower = engine.getRowPower("p1", "MELEE");
console.log("Siła wiersza MELEE gracza 1 po Fog:", meleePower);
console.log("Stan wiersza MELEE gracza 1:", engine.getState().players["p1"].board.MELEE);