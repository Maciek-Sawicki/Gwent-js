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

/** T9 z tabeli: p2 zagrywa po p1, potem znowu tura p1. */
describe("T9 (req): p2 plays after p1 → currentPlayer is p1", () => {
  test("p1 plays, p2 plays, turn returns to p1", () => {
    const initialState = createEmptyState()
    const engine = new GameEngine(initialState)

    const p1First = engine.createCardInstance("blue_stripes_commando_1")
    const p1Second = engine.createCardInstance("blue_stripes_commando_2")
    initialState.players.p1.hand.push(p1First, p1Second)

    const p2Only = engine.createCardInstance("blue_stripes_commando_3")
    initialState.players.p2.hand.push(p2Only)

    engine.dispatch({
      type: "PLAY_CARD",
      playerId: "p1",
      cardId: p1First.id,
      row: "MELEE",
    })
    expect(engine.getState().currentPlayer).toBe("p2")

    engine.dispatch({
      type: "PLAY_CARD",
      playerId: "p2",
      cardId: p2Only.id,
      row: "MELEE",
    })

    const s = engine.getState()
    expect(s.currentPlayer).toBe("p1")
    expect(s.players.p2.hand).toHaveLength(0)
    expect(s.players.p1.hand).toHaveLength(1)
  })
})
