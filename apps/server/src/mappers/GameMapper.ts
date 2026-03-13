import { GameState, ScoringService } from "@repo/game-engine";
import { GameStateDto } from "@repo/shared";
import { CardRegistry } from "@repo/game-engine/cards/CardRegistry";
import { CardInstance } from "@repo/game-engine/core/CardInstance";

export function mapToDto(state: GameState): GameStateDto {
  function mapCard(c: CardInstance) {
    const def = CardRegistry.get(c.definitionId);
    return {
      id: c.id,
      definitionId: c.definitionId,
      name: def.name,
      image: def.image,
      power: ScoringService.calculateCardPower(c),
      row: c.row
    };
  }

return {
  round: state.round,
  currentPlayer: state.currentPlayer,
  players: Object.values(state.players).map(player => ({
    id: player.id,
    passed: player.passed,
    score: ScoringService.calculatePlayerScore(player),
    hand: player.hand.map(c => ({
      id: c.id,
      definitionId: c.definitionId,
      name: CardRegistry.get(c.definitionId).name,
      image: CardRegistry.get(c.definitionId).image,
      power: ScoringService.calculateCardPower(c),
      row: c.row
    })),
    board: {
      MELEE: player.board.MELEE.map(c => ({
        id: c.id,
        definitionId: c.definitionId,
        name: CardRegistry.get(c.definitionId).name,
        image: CardRegistry.get(c.definitionId).image,
        power: ScoringService.calculateCardPower(c),
        row: c.row
      })),
      RANGED: player.board.RANGED.map(c => ({
        id: c.id,
        definitionId: c.definitionId,
        name: CardRegistry.get(c.definitionId).name,
        image: CardRegistry.get(c.definitionId).image,
        power: ScoringService.calculateCardPower(c),
        row: c.row
      })),
      SIEGE: player.board.SIEGE.map(c => ({
        id: c.id,
        definitionId: c.definitionId,
        name: CardRegistry.get(c.definitionId).name,
        image: CardRegistry.get(c.definitionId).image,
        power: ScoringService.calculateCardPower(c),
        row: c.row
      }))
    }
  }))
};
}