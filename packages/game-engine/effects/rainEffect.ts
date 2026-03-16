import { CardPlayContext } from "../cards/CardPlayContext";

export function rainEffect(ctx: CardPlayContext) {
  const { engine, row, playerId } = ctx;

  for (const pid of Object.keys(engine.getState().players)) {
    const rowCards = engine.getRow(pid, row);
    rowCards.forEach(card => {
      engine.addModifier(card.id, {
        id: `rain_aura_${row}`,
        source: "rain",
        type: "SET",
        value: 1
      });
    });
  }
}