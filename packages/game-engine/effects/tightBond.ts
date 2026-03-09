import { CardPlayContext } from "../cards/CardPlayContext";
import { CardRegistry } from "../cards/CardRegistry";

export function tightBondEffect(ctx: CardPlayContext) {
  const { engine, playerId, cardInstanceId } = ctx;

  const player = engine.getState().players[playerId];
  const card = engine.getCard(cardInstanceId);

  if (!card.row) return;

  const row = card.row;
  const definition = CardRegistry.get(card.definitionId);

  if (!definition.bondGroup) return;

  const sameGroupCards = player.board[row].filter(c => {
    const def = CardRegistry.get(c.definitionId);
    return def.bondGroup === definition.bondGroup;
  });

  const count = sameGroupCards.length;

  if (count <= 1) return;

  sameGroupCards.forEach(c => {
  engine.removeModifiersBySource(c.id, "tightBond")

  engine.addModifier(c.id, {
    id: `tightBond_${row}`,
    source: "tightBond",
    type: "MULTIPLY",
    value: count
  })
})
}