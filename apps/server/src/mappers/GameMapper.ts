import {
  GameState,
  ScoringService,
  CardRegistry,
  CardInstance,
} from "@repo/game-engine";
import { GameStateDto } from "@repo/shared";

export function mapToDto(state: GameState): GameStateDto {
  function mapCard(c: CardInstance) {
    const def = CardRegistry.get(c.definitionId);
    return {
      id: c.id,
      definitionId: c.definitionId,
      name: def.name,
      image: def.image,
      handImage: def.handImage, // Obrazek dla ręki (z paskami)
      power: ScoringService.calculateCardPower(c),
      row: c.row,
      allowedRows: def.allowedRows
    };
  }

return {
  round: state.round,
  currentPlayer: state.currentPlayer,
  status: state.status,
  players: Object.values(state.players).map(player => ({
    id: player.id,
    socketId: player.socketId,
    passed: player.passed,
    score: ScoringService.calculatePlayerScore(player),
    roundsWon: player.roundsWon,
    hand: player.hand.map(c => {
      const def = CardRegistry.get(c.definitionId);
      return {
        id: c.id,
        definitionId: c.definitionId,
        name: def.name,
        image: def.image,
        handImage: def.handImage, // Obrazek dla ręki (z paskami)
        power: ScoringService.calculateCardPower(c),
        row: c.row,
        allowedRows: def.allowedRows
      };
    }),
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