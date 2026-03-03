import { GameState } from "@repo/game-engine";
import { GameStateDto } from "@repo/shared";

export function mapToDto(state: GameState): GameStateDto {
  return {
    round: state.round,
    currentPlayer: state.currentPlayer,
    players: Object.values(state.players).map(player => ({
      id: player.id,
      passed: player.passed,
      score: player.board.reduce((s, c) => s + c.basePower, 0),
      hand: player.hand.map(c => ({
        id: c.id,
        definitionId: c.definitionId,
        power: c.basePower
      })),
      board: player.board.map(c => ({
        id: c.id,
        definitionId: c.definitionId,
        power: c.basePower
      }))
    }))
  };
}