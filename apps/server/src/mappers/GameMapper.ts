import { GameState, ScoringService } from "@repo/game-engine";
import { GameStateDto } from "@repo/shared";

export function mapToDto(state: GameState): GameStateDto {
  return {
    round: state.round,
    currentPlayer: state.currentPlayer,
    players: Object.values(state.players).map(player => {

      const boardCards = [
        ...player.board.MELEE,
        ...player.board.RANGED,
        ...player.board.SIEGE
      ];

      return {
        id: player.id,
        passed: player.passed,

        score: ScoringService.calculatePlayerScore(player),

        hand: player.hand.map(c => ({
          id: c.id,
          definitionId: c.definitionId,
          power: ScoringService.calculateCardPower(c)
        })),

        board: boardCards.map(c => ({
          id: c.id,
          definitionId: c.definitionId,
          power: ScoringService.calculateCardPower(c)
        }))
      };
    })
  };
}