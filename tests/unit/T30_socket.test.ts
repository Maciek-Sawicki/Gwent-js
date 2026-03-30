import { describe, test, expect, vi, beforeEach } from "vitest";
import { io, Socket } from "socket.io-client";

describe("Socket GameEngine - unit test", () => {
  let mockSocket1: Socket;
  let mockSocket2: Socket;

  vi.mock("socket.io-client", () => {
    const emitMock = vi.fn();
    const onMock = vi.fn();

    return {
      io: vi.fn(() => ({
        emit: emitMock,
        on: onMock,
      })),
    };
  });

  beforeEach(() => {
    mockSocket1 = io("http://localhost:4000") as unknown as Socket;
    mockSocket2 = io("http://localhost:4000") as unknown as Socket;
  });

  test("Players connect and join game", () => {
    expect(io).toHaveBeenCalledTimes(2);

    expect(typeof mockSocket1.emit).toBe("function");
    expect(typeof mockSocket2.emit).toBe("function");

    mockSocket1.emit("join_game", { gameId: "test_game", playerId: "p1" });
    mockSocket2.emit("join_game", { gameId: "test_game", playerId: "p2" });

    expect(mockSocket1.emit).toHaveBeenCalledWith("join_game", { gameId: "test_game", playerId: "p1" });
    expect(mockSocket2.emit).toHaveBeenCalledWith("join_game", { gameId: "test_game", playerId: "p2" });
  });

  test("Player1 plays a card", () => {
    mockSocket1.emit("play_card", { cardId: "someCardId", row: "MELEE" });

    expect(mockSocket1.emit).toHaveBeenCalledWith("play_card", { cardId: "someCardId", row: "MELEE" });
  });

  test("Players listen to state_update", () => {
    const callback1 = vi.fn();
    const callback2 = vi.fn();

    mockSocket1.on("state_update", callback1);
    mockSocket2.on("state_update", callback2);

    expect(mockSocket1.on).toHaveBeenCalledWith("state_update", callback1);
    expect(mockSocket2.on).toHaveBeenCalledWith("state_update", callback2);
  });
});