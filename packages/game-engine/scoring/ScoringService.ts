import { PlayerState } from "../core/PlayerState";

export class ScoringService {
  static calculateScore(player: PlayerState): number {
    return player.board.reduce((sum, card) => sum + card.basePower, 0);
  }
}