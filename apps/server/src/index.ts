import express from "express";
import http from "http";
import { Server } from "socket.io";

import { gameManager } from "./managers/GameManager";
import { mapToDto } from "./mappers/GameMapper";

import { GameState } from "@repo/game-engine";
import { CardRegistrySetup } from "@repo/game-engine/cards/CardRegistrySetup";

CardRegistrySetup();

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "*",
  },
});

function createInitialState(): GameState {
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
        graveyard: []
      },
      p2: {
        id: "p2",
        hand: [],
        board: { MELEE: [], RANGED: [], SIEGE: [] },
        passed: false,
        roundsWon: 0,
        faction: "NORTHERN_REALMS",
        graveyard: []
      }
    }
  };
}

function broadcastState(gameId: string) {
  const engine = gameManager.getGame(gameId);
  if (!engine) return;

  io.to(gameId).emit(
    "state_update",
    mapToDto(engine.getState())
  );
}

app.get("/health", (_req, res) => {
  res.json({ status: "ok", time: new Date().toISOString() });
});

io.on("connection", socket => {
  console.log("client connected", socket.id);

  socket.on("join_game", ({ gameId, playerId }) => {

    let engine = gameManager.getGame(gameId);

    // tworzymy grę jeśli nie istnieje
    if (!engine) {
      console.log("Creating game:", gameId);
      engine = gameManager.createGame(
        gameId,
        createInitialState()
      );
    }

    socket.data.playerId = playerId;
    socket.data.gameId = gameId;

    socket.join(gameId);

    socket.emit(
      "state_update",
      mapToDto(engine.getState())
    );
  });

  socket.on("play_card", ({ cardId, row }) => {

    const gameId = socket.data.gameId;
    const playerId = socket.data.playerId;

    const engine = gameManager.getGame(gameId);
    if (!engine) return;

    try {
      engine.dispatch({
        type: "PLAY_CARD",
        playerId,
        cardId,
        row
      });

      broadcastState(gameId);

    } catch (err) {
      socket.emit("error", String(err));
    }
  });

  socket.on("pass", () => {

    const gameId = socket.data.gameId;
    const playerId = socket.data.playerId;

    const engine = gameManager.getGame(gameId);
    if (!engine) return;

    engine.dispatch({
      type: "PASS",
      playerId
    });

    broadcastState(gameId);
  });

  socket.on("disconnect", () => {
    console.log("client disconnected", socket.id);
  });

});

const port = process.env.PORT
  ? Number(process.env.PORT)
  : 4000;

server.listen(port, () => {
  console.log(`Server listening on http://localhost:${port}`);
});