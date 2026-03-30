import { GameEngine } from "../../packages/game-engine/core/GameEngine"
import { CardRegistrySetup } from "../../packages/game-engine/cards/CardRegistrySetup"

beforeAll(() => {
  CardRegistrySetup()
})

function createEmptyState() {
  return {
    round: 1,
    status: "IN_PROGRESS",
    currentPlayer: "p1",
    players: {
      p1: {
        id: "p1",
        hand: [],
        board: { MELEE: [], RANGED: [], SIEGE: [] },
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
        board: { MELEE: [], RANGED: [], SIEGE: [] },
        passed: false,
        roundsWon: 0,
        faction: "NORTHERN_REALMS",
        graveyard: [],
        mulligansUsed: 0,
        deck: [],
      },
    },
  }
}

describe("T5: p1 plays card not in hand", () => {
  test("error 'Card not in hand' and state unchanged", () => {
    const initialState = createEmptyState()
    const engine = new GameEngine(initialState)

    const fakeCardId = "non-existent-card-id"

    const prevStateJson = JSON.stringify(engine.getState())

    expect(() => {
      engine.dispatch({
        type: "PLAY_CARD",
        playerId: "p1",
        cardId: fakeCardId,
        row: "MELEE",
      })
    }).toThrow("Card not in hand")

    expect(JSON.stringify(engine.getState())).toBe(prevStateJson)
  })
})

