import { io } from "socket.io-client";
import * as readline from "readline";

let updateCount = 0;
const gameId = process.argv[2];

if (!gameId) {
  console.log("Usage:");
  console.log("npx ts-node ClientTest.ts <gameId>");
  process.exit(1);
}

console.log("Connecting to game:", gameId);

const socket = io("http://localhost:4000");

let latestState: any = null;
let myPlayerId: string | null = null;

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function getMe() {
  if (!latestState || !myPlayerId) return null;
  return latestState.players.find((p: any) => p.id === myPlayerId);
}

function printHand() {
  const me = getMe();
  if (!me) return;

  console.log("\nYOUR HAND:");

  me.hand.forEach((card: any, i: number) => {
    console.log(
      `[${i}] ${card.name} | power:${card.power}`
    );
  });
}

function printBoard() {
  const me = getMe();
  if (!me) return;

  console.log("\nYOUR BOARD:");

  ["MELEE", "RANGED", "SIEGE"].forEach((row) => {
    const cards = me.board[row];
    console.log(
      row,
      cards.map((c: any) => `${c.name}(${c.power})`)
    );
  });
}

function printState() {
  const me = getMe();
  if (!me) return;

  const turn = latestState.currentPlayer === myPlayerId
    ? "YOUR TURN"
    : latestState.currentPlayer;

  console.log("\nSTATE");
  console.log("Round:", latestState.round);
  console.log("Turn:", turn);
  console.log("Passed:", me.passed);
}

function help() {
  console.log(`
Commands:

hand            show hand
board           show board
state           show state
play <i> <row>  play card index to row

rows:
MELEE
RANGED
SIEGE

example:
play 0 MELEE

pass
help
`);
}

socket.on("connect", () => {
  console.log("Connected:", socket.id);

  socket.emit("join_game", {
    gameId
  });
});

socket.on("state_update", (state) => {
  latestState = state;
  updateCount++;

  if (!myPlayerId) {
    const me = state.players.find((p: any) => p.socketId === socket.id);
    if (me) {
      myPlayerId = me.id;
      console.log("You are:", myPlayerId);
      help();
    }
  }

  const me = getMe();
  if (!me) return;

  const turn = state.currentPlayer === myPlayerId ? "YOUR TURN" : `Turn: ${state.currentPlayer}`;

  console.log(
    `\nUpdate #${updateCount} | hand:${me.hand.length} | ${turn}`
  );
});

socket.on("error", (err) => {
  console.log("Server error:", err);
});

socket.on("disconnect", () => {
  console.log("Disconnected");
});

rl.on("line", (input) => {
  const parts = input.trim().split(" ");
  const cmd = parts[0];

  if (cmd === "help") {
    help();
    return;
  }

  if (cmd === "hand") {
    printHand();
    return;
  }

  if (cmd === "board") {
    printBoard();
    return;
  }

  if (cmd === "state") {
    printState();
    return;
  }

  if (cmd === "pass") {
    socket.emit("pass");
    console.log("PASS");
    return;
  }

  if (cmd === "play") {
    const index = Number(parts[1]);
    const row = parts[2];

    const me = getMe();

    if (!me) {
      console.log("State not ready");
      return;
    }

    const card = me.hand[index];

    if (!card) {
      console.log("Invalid card index");
      return;
    }

    if (!["MELEE", "RANGED", "SIEGE"].includes(row)) {
      console.log("Invalid row");
      return;
    }

    console.log(`Playing ${card.name} -> ${row}`);

    socket.emit("play_card", {
      cardId: card.id,
      row
    });

    return;
  }

  console.log("Unknown command. Type 'help'");
});