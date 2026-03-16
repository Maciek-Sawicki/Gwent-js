import { GameEngine } from "../../packages/game-engine/core/GameEngine"
import { GameState } from "../../packages/game-engine/core/GameState"

function createTestState(): GameState {
  return {
    round: 1,
    status: "IN_PROGRESS",
    currentPlayer: "p1",
    players: {
      p1: {
        id: "p1",
        faction: "NORTHERN_REALMS",
        hand: [],
        deck: [],
        graveyard: [],
        board: {
          MELEE: [],
          RANGED: [],
          SIEGE: []
        },
        passed: false,
        roundsWon: 0,
        mulligansUsed: 0
      },
      p2: {
        id: "p2",
        faction: "NORTHERN_REALMS",
        hand: [],
        deck: [],
        graveyard: [],
        board: {
          MELEE: [],
          RANGED: [],
          SIEGE: []
        },
        passed: false,
        roundsWon: 0,
        mulligansUsed: 0
      }
    }
  }
}

console.log("Starting round tests")

const state1 = createTestState()
const engine1 = new GameEngine(state1)

state1.players.p2.passed = true

engine1.dispatch({
  type: "PASS",
  playerId: "p1"
})

console.log("Round after T28:", engine1.getState().round)

if (engine1.getState().round === 2) {
  console.log("T28 PASSED")
} else {
  console.log("T28 FAILED")
}

const state2 = createTestState()
state2.round = 2

const engine2 = new GameEngine(state2)

state2.players.p2.passed = true

engine2.dispatch({
  type: "PASS",
  playerId: "p1"
})

console.log("Round after T29:", engine2.getState().round)

if (engine2.getState().round === 3) {
  console.log("T29 PASSED")
} else {
  console.log("T29 FAILED")
}

console.log("Round tests finished")