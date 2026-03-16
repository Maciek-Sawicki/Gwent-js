import { CardPlayContext } from "../cards/CardPlayContext";

export function frostEffect(ctx: CardPlayContext) {
  const { engine, row, playerId } = ctx;

  for (const pid of Object.keys(engine.getState().players)) {
    const rowCards = engine.getRow(pid, row);
    rowCards.forEach(card => {
      engine.addModifier(card.id, {
        id: `frost_aura_${row}`,
        source: "frost",
        type: "SET",
        value: 1
      });
    });
  }
}