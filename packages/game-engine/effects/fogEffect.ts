import { CardPlayContext } from "../cards/CardPlayContext";
import { GameEngine } from "../core/GameEngine";

export function fogEffect(ctx: CardPlayContext) {
  const { engine, row, playerId } = ctx;

  for (const pid of Object.keys(engine.getState().players)) {
    const rowCards = engine.getRow(pid, row);
    rowCards.forEach(card => {
      const originalPower = engine.getCardPower(card);
      engine.addModifier(card.id, {
        id: `fog_aura_${row}`,
        source: "fog",
        type: "SET", 
        value: 1
      });
    });
  }
}