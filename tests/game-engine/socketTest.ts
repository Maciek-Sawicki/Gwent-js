import { io } from "socket.io-client"

console.log("Starting socket sync test (T30)")

const SERVER_URL = "http://localhost:4000"
const GAME_ID = "test-game"

const p1 = io(SERVER_URL)
const p2 = io(SERVER_URL)

let p1Ready = false
let p2Ready = false
let testStarted = false

p1.on("connect", () => {
  console.log("Player1 connected")
  p1.emit("join_game", { gameId: GAME_ID })
})

p2.on("connect", () => {
  console.log("Player2 connected")
  p2.emit("join_game", { gameId: GAME_ID })
})

p1.on("you_are_player", (data) => {
  console.log("P1 assigned:", data.playerId)
  p1Ready = true
  tryStart()
})

p2.on("you_are_player", (data) => {
  console.log("P2 assigned:", data.playerId)
  p2Ready = true
  tryStart()
})

function tryStart() {
  if (!p1Ready || !p2Ready || testStarted) return
  testStarted = true

  console.log("Both players joined")

  p2.on("state_update", (state) => {
    console.log("P2 received state_update")

    if (state.players) {
      console.log("T30 PASSED - state synced between players")
    } else {
      console.log("T30 FAILED")
    }

    cleanup()
  })

  console.log("P1 plays card")

  p1.emit("play_card", {
    cardId: "test-card",
    row: "MELEE"
  })
}

function cleanup() {
  p1.disconnect()
  p2.disconnect()
  console.log("Socket test finished")
}