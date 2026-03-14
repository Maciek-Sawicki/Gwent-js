import { io } from "socket.io-client";

console.log("Starting socket test");

const socket1 = io("http://localhost:4000");
const socket2 = io("http://localhost:4000");

socket1.on("connect", () => {
  console.log("Player1 connected");

  socket1.emit("join_game", {
    gameId: "test_game",
    playerId: "p1"
  });
});

socket2.on("connect", () => {
  console.log("Player2 connected");

  socket2.emit("join_game", {
    gameId: "test_game",
    playerId: "p2"
  });
});

socket1.on("state_update", state => {
  console.log("P1 sees state:", state);
});

socket2.on("state_update", state => {
  console.log("P2 sees state:", state);
});

setTimeout(() => {
  socket1.emit("play_card", {
    cardId: "someCardId",
    row: "MELEE"
  });
}, 2000);