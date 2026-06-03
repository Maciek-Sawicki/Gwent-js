import type { Faction } from "../cards/CardDefinition";
import type { GameState } from "./GameState";
import type { PlayerBoard, PlayerState } from "./PlayerState";

function createEmptyBoard(): PlayerBoard {
  return { MELEE: [], RANGED: [], SIEGE: [] };
}

function createPlayerState(id: string, faction: Faction): PlayerState {
  return {
    id,
    deck: [],
    hand: [],
    board: createEmptyBoard(),
    passed: false,
    roundsWon: 0,
    faction,
    graveyard: [],
    mulligansUsed: 0,
  };
}

export function createInitialGameState(): GameState {
  return {
    round: 1,
    status: "WAITING",
    currentPlayer: "p1",
    players: {
      p1: createPlayerState("p1", "NORTHERN_REALMS"),
      p2: createPlayerState("p2", "NORTHERN_REALMS"),
    },
  };
}
