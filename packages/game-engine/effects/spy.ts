import { CardPlayContext } from "../cards/CardPlayContext";

export function spyEffect(ctx: CardPlayContext) {
  const { engine, playerId } = ctx;
  
  engine.drawCards(playerId, 2);
  console.log(`[SPY] Player ${playerId} played spy card and drew 2 cards`);
}