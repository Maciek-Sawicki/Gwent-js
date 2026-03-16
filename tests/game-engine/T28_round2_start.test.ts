import { describe, test, expect, beforeAll } from "vitest"
import { GameEngine } from "../../packages/game-engine/core/GameEngine"
import { CardRegistrySetup } from "../../packages/game-engine/cards/CardRegistrySetup"
import type { GameState } from "../../packages/game-engine/core/GameState"

beforeAll(() => {
  CardRegistrySetup()
})

function createEmptyState(): GameState {
  return {
    round: 1,
    status: "IN_PROGRESS",
    currentPlayer: "p1",
    players: {
      p1: {
        id: "p1",
        hand: [],
        board: {
          MELEE: [],
          RANGED: [],
          SIEGE: [],
        },
        passed: false,
        roundsWon: 0,
        faction: "NORTHERN_REALMS",
        graveyard: [],
        mulligansUsed: 0,
        deck: [],
      },
      p2: {
        id: "p2",
        hand: [],
        board: {
          MELEE: [],
          RANGED: [],
          SIEGE: [],
        },
        passed: false,
        roundsWon: 0,
        faction: "NORTHERN_REALMS",
        graveyard: [],
        mulligansUsed: 0,
        deck: [],
      },
    },
  } as GameState
}

describe("T28: round=1 end → round=2 start", () => {
  test("after both players pass round should become 2", () => {

    const engine = new GameEngine(createEmptyState())

    engine.dispatch({
      type: "PASS",
      playerId: "p1",
    })

    engine.dispatch({
      type: "PASS",
      playerId: "p2",
    })

    const newState = engine.getState()

    expect(newState.round).toBe(2)
  })
})