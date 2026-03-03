import { CardInstanceId } from "../types/ids";

export interface PlayCardCommand {
  type: "PLAY_CARD";
  cardInstanceId: CardInstanceId;
}

export interface PassCommand {
  type: "PASS";
}

export type ClientCommand =
  | PlayCardCommand
  | PassCommand;