import { describe, test, expect, beforeAll } from "vitest"
import { GameEngine } from "../../packages/game-engine/core/GameEngine"
import { CardRegistrySetup } from "../../packages/game-engine/cards/CardRegistrySetup"

/**
 * Zgodnie z Gwint-js.pdf (R2 – karta schodzi z ręki na planszę):
 * T21 invalid card id, T22 same card twice, T26 last card → empty hand.
 */

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

describe("T21 (R2): invalid card id — error, no state change", () => {
  test("unknown cardId throws and snapshot unchanged", () => {
    const initialState = createEmptyState()
    const engine = new GameEngine(initialState)

    const invalidId = `ghost-card-${crypto.randomUUID()}`

    const before = JSON.stringify(engine.getState())

    expect(() => {
      engine.dispatch({
        type: "PLAY_CARD",
        playerId: "p1",
        cardId: invalidId,
        row: "MELEE",
      })
    }).toThrow("Card not in hand")

    expect(JSON.stringify(engine.getState())).toBe(before)
  })
})

describe("T22 (R2): same card played twice — error, no state change", () => {
  test("second play with id already on board is rejected", () => {
    const initialState = createEmptyState()
    const engine = new GameEngine(initialState)

    const first = engine.createCardInstance("blue_stripes_commando_1")
    const secondInHand = engine.createCardInstance("blue_stripes_commando_2")
    const p2Card = engine.createCardInstance("ballista_1")
    initialState.players.p1.hand.push(first, secondInHand)
    initialState.players.p2.hand.push(p2Card)

    engine.dispatch({
      type: "PLAY_CARD",
      playerId: "p1",
      cardId: first.id,
      row: "MELEE",
    })
    engine.dispatch({ type: "PASS", playerId: "p2" })

    expect(engine.getState().currentPlayer).toBe("p1")

    const beforeReplay = JSON.stringify(engine.getState())

    expect(() => {
      engine.dispatch({
        type: "PLAY_CARD",
        playerId: "p1",
        cardId: first.id,
        row: "MELEE",
      })
    }).toThrow("Card not in hand")

    expect(JSON.stringify(engine.getState())).toBe(beforeReplay)
  })
})

describe("T26 (R2): p1 last card — hand empty after play", () => {
  test("single card in hand → after PLAY_CARD hand is []", () => {
    const initialState = createEmptyState()
    const engine = new GameEngine(initialState)

    const only = engine.createCardInstance("blue_stripes_commando_1")
    initialState.players.p1.hand.push(only)
    initialState.players.p2.hand.push(engine.createCardInstance("blue_stripes_commando_2"))

    engine.dispatch({
      type: "PLAY_CARD",
      playerId: "p1",
      cardId: only.id,
      row: "MELEE",
    })

    const s = engine.getState()
    expect(s.players.p1.hand).toHaveLength(0)
    expect(s.players.p1.board.MELEE.some((c) => c.id === only.id)).toBe(true)
  })
})
