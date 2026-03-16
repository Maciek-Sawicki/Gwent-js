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

describe("T4: p2 tries to play card when it's p1 turn", () => {
  test("error 'Not your turn' and state unchanged", () => {
    const initialState = createEmptyState()
    const engine = new GameEngine(initialState)

    const spyCard = engine.createCardInstance("thaler")
    initialState.players.p2.hand.push(spyCard)

    const prevStateJson = JSON.stringify(engine.getState())

    expect(() => {
      engine.dispatch({
        type: "PLAY_CARD",
        playerId: "p2",
        cardId: spyCard.id,
        row: "MELEE",
      })
    }).toThrow("Not your turn")

    expect(JSON.stringify(engine.getState())).toBe(prevStateJson)
  })
})

