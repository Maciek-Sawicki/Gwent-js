import { io, Socket } from "socket.io-client";

async function wait(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function runTest() {
  console.log("Starting automated socket test");

  const socket1: Socket = io("http://localhost:4000");
  const socket2: Socket = io("http://localhost:4000");

  let stateP1: any = null;
  let stateP2: any = null;
  const stateReceived = { p1: false, p2: false };

  socket1.on("connect", () => {
    console.log("[Socket1] Player1 connected", socket1.id);
    socket1.emit("join_game", { gameId: "test_game", playerId: "p1" });
  });

  socket2.on("connect", () => {
    console.log("[Socket2] Player2 connected", socket2.id);
    socket2.emit("join_game", { gameId: "test_game", playerId: "p2" });
  });

  socket1.on("state_update", state => {
    if (!Array.isArray(state.players)) state.players = Object.values(state.players);
    stateP1 = state;
    stateReceived.p1 = true;
    console.log("[p1] Received state update");
  });

  socket2.on("state_update", state => {
    if (!Array.isArray(state.players)) state.players = Object.values(state.players);
    stateP2 = state;
    stateReceived.p2 = true;
    console.log("[p2] Received state update");
  });

  console.log("Waiting for both states...");

  await new Promise<void>((resolve, reject) => {
    const timeout = setTimeout(() => reject(new Error("Initial states not received")), 5000);
    const interval = setInterval(() => {
      if (stateReceived.p1 && stateReceived.p2) {
        clearTimeout(timeout);
        clearInterval(interval);
        console.log("[Check] Both states received");
        resolve();
      }
    }, 50);
  });

  const playerP1 = stateP1.players.find((p: any) => p.id === "p1");

  playerP1.hand = playerP1.hand.map((c: any) => ({ ...c, row: c.row || "MELEE" }));

  console.log("[Player1] Hand before play:", playerP1.hand.map((c:any) => ({id:c.id, name:c.name, row:c.row, power:c.power})));

  const cardToPlay = { ...playerP1.hand[0] }; 
  console.log("[Player1] Card to play:", cardToPlay);

  console.log("[Player1] Emitting play_card...");
  socket1.emit("play_card", { cardId: cardToPlay.id, row: cardToPlay.row });

  const waitForCardPlayed = async (cardId: string) => {
    return new Promise<void>((resolve, reject) => {
      const start = Date.now();

      const handler = (state: any) => {
        if (!Array.isArray(state.players)) state.players = Object.values(state.players);
        const player1 = state.players.find((p: any) => p.id === "p1");
        const player2 = state.players.find((p: any) => p.id === "p2");

        const cardRemovedFromHand = !player1.hand.find((c: any) => c.id === cardId);
        const cardOnBoardP1 = player1.board.MELEE.find((c: any) => c.id === cardId);
        const cardOnBoardP2 = player2.board.MELEE.find((c: any) => c.id === cardId);

        if (cardRemovedFromHand && cardOnBoardP1 && cardOnBoardP2) {
          console.log("[Success] Card played and visible on both boards ✅");
          socket1.off("state_update", handler);
          socket2.off("state_update", handler);
          resolve();
        } else if (Date.now() - start > 5000) {
          socket1.off("state_update", handler);
          socket2.off("state_update", handler);
          reject(new Error("State not updated after play_card"));
        }
      };

      socket1.on("state_update", handler);
      socket2.on("state_update", handler);
    });
  };

  console.log("[p1] Waiting for card", cardToPlay.id, "to appear on board...");
  await waitForCardPlayed(cardToPlay.id);

  const updatedP1 = stateP1.players.find((p:any)=>p.id==="p1");
  const updatedP2 = stateP2.players.find((p:any)=>p.id==="p1");

  console.log("[Player1] Card in hand after play:", updatedP1.hand.find((c:any)=>c.id===cardToPlay.id));
  console.log("[Player1] Card on board:", updatedP1.board.MELEE.find((c:any)=>c.id===cardToPlay.id));
  console.log("[Player2] Sees card on board:", updatedP2.board.MELEE.find((c:any)=>c.id===cardToPlay.id));

  if (!updatedP2.board.MELEE.find((c:any)=>c.id===cardToPlay.id)) {
    throw new Error("P2 should see the card on board");
  }

  console.log("Automated socket test passed");

  socket1.disconnect();
  socket2.disconnect();
}

runTest().catch(err => {
  console.error("Test failed", err);
  process.exit(1);
});