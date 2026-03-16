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

describe("T6: p1 finishes move, turn switches", () => {
  test("currentPlayer becomes p2 and card is on board", () => {
    const initialState = createEmptyState()
    const engine = new GameEngine(initialState)

    // p1 ma dwie karty w ręce, żeby po zagraniu jednej nie włączyło się auto-pass
    const card = engine.createCardInstance("blue_stripes_commando_1")
    const extraCardP1 = engine.createCardInstance("blue_stripes_commando_2")
    initialState.players.p1.hand.push(card, extraCardP1)

    // p2 też ma kartę, żeby nie był auto-passowany
    const cardP2 = engine.createCardInstance("blue_stripes_commando_3")
    initialState.players.p2.hand.push(cardP2)

    expect(initialState.currentPlayer).toBe("p1")

    engine.dispatch({
      type: "PLAY_CARD",
      playerId: "p1",
      cardId: card.id,
      row: "MELEE",
    })

    const stateAfter = engine.getState()

    expect(stateAfter.players.p1.hand.find(c => c.id === card.id)).toBeUndefined()
    expect(stateAfter.players.p1.board.MELEE.find(c => c.id === card.id)).toBeDefined()
    expect(stateAfter.currentPlayer).toBe("p2")
  })
})

