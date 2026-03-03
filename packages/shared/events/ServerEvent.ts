import { GameStateDto } from "../dto/GameStateDto";

export interface GameStateUpdatedEvent {
  type: "GAME_STATE_UPDATED";
  state: GameStateDto;
}

export interface GameFinishedEvent {
  type: "GAME_FINISHED";
  winnerId: string;
}

export type ServerEvent =
  | GameStateUpdatedEvent
  | GameFinishedEvent;