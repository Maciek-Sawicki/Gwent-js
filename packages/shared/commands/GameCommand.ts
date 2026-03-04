export interface PlayCardCommand {
  type: "PLAY_CARD";
  playerId: string;
  cardId: string;
}

export interface PassCommand {
  type: "PASS";
  playerId: string;
}

export type GameCommand =
  | PlayCardCommand
  | PassCommand;