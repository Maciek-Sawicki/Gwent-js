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

/** T4 z tabeli wymagań: ostatnia karta w ręce → po zagraniu ręka pusta, karta na planszy. */
describe("T4 (req): p1 last card — hand becomes empty", () => {
  test("after playing sole card, p1.hand is empty and card is on board", () => {
    const initialState = createEmptyState()
    const engine = new GameEngine(initialState)

    const onlyCard = engine.createCardInstance("blue_stripes_commando_1")
    initialState.players.p1.hand.push(onlyCard)

    const keepP2InGame = engine.createCardInstance("blue_stripes_commando_2")
    initialState.players.p2.hand.push(keepP2InGame)

    engine.dispatch({
      type: "PLAY_CARD",
      playerId: "p1",
      cardId: onlyCard.id,
      row: "MELEE",
    })

    const s = engine.getState()
    expect(s.players.p1.hand).toHaveLength(0)
    expect(s.players.p1.board.MELEE.some((c) => c.id === onlyCard.id)).toBe(true)
  })
})
