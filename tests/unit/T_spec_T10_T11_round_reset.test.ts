import { describe, test, expect, beforeAll } from "vitest"
import { GameEngine } from "../../packages/game-engine/core/GameEngine"
import { CardRegistrySetup } from "../../packages/game-engine/cards/CardRegistrySetup"

beforeAll(() => {
  CardRegistrySetup()
})

function createEmptyState() {
  return {
    round: 1,
    status: "IN_PROGRESS" as const,
    currentPlayer: "p1" as const,
    players: {
      p1: {
        id: "p1",
        hand: [],
        board: { MELEE: [], RANGED: [], SIEGE: [] },
        passed: false,
        roundsWon: 0,
        faction: "NORTHERN_REALMS" as const,
        graveyard: [],
        mulligansUsed: 0,
        deck: [],
      },
      p2: {
        id: "p2",
        hand: [],
        board: { MELEE: [], RANGED: [], SIEGE: [] },
        passed: false,
        roundsWon: 0,
        faction: "NORTHERN_REALMS" as const,
        graveyard: [],
        mulligansUsed: 0,
        deck: [],
      },
    },
  }
}

function boardIsEmpty(state: ReturnType<GameEngine["getState"]>) {
  for (const p of Object.values(state.players)) {
    for (const row of ["MELEE", "RANGED", "SIEGE"] as const) {
      if (p.board[row].length > 0) return false
    }
  }
  return true
}

/**
 * T10 — nowa runda: plansze czyste.
 * T11 — passed zresetowane na false.
 */
describe("T10/T11 (req): new round clears boards and resets passed", () => {
  test("after p1 plays and p2 passes, round 2 has empty boards and passed=false", () => {
    const initialState = createEmptyState()
    const engine = new GameEngine(initialState)

    const onBoard = engine.createCardInstance("blue_stripes_commando_1")
    const p2KeepsInHand = engine.createCardInstance("ballista_1")
    initialState.players.p1.hand.push(onBoard)
    initialState.players.p2.hand.push(p2KeepsInHand)

    engine.dispatch({ type: "PLAY_CARD", playerId: "p1", cardId: onBoard.id, row: "MELEE" })
    expect(engine.getState().currentPlayer).toBe("p2")

    engine.dispatch({ type: "PASS", playerId: "p2" })

    const s = engine.getState()
    expect(s.round).toBe(2)
    expect(s.status).toBe("IN_PROGRESS")
    expect(boardIsEmpty(s)).toBe(true)
    expect(s.players.p1.passed).toBe(false)
    expect(s.players.p2.passed).toBe(false)
  })
})
