import { CardPlayContext } from "../cards/CardPlayContext";
import { CardRegistry } from "../cards/CardRegistry";

export function moraleBoostEffect(ctx: CardPlayContext) {
  const { engine, playerId, cardInstanceId } = ctx;
  const card = engine.getCard(cardInstanceId);

  if (!card.row) return;
  const row = card.row;
  const player = engine.getState().players[playerId];

  const rowCards = player.board[row];
  rowCards.forEach(c => {
    if (c.id !== cardInstanceId) {
      engine.addModifier(c.id, {
        id: `moraleBoost_${row}`,
        source: "moraleBoost",
        type: "ADD",
        value: 1
      });
    }
  });
}