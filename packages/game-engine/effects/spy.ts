import { CardPlayContext } from "../cards/CardPlayContext";

/**
 * Efekt Spy: Gracz który zagrał kartę Spy dobiera 2 karty z talii
 * Karta Spy jest już położona na planszę przeciwnika w handlePlayCard
 */
export function spyEffect(ctx: CardPlayContext) {
  const { engine, playerId } = ctx;
  
  // Gracz który zagrał Spy dobiera 2 karty
  engine.drawCards(playerId, 2);
  console.log(`[SPY] Player ${playerId} played spy card and drew 2 cards`);
}