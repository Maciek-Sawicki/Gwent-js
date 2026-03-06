import { CardPlayContext } from "../cards/CardPlayContext";
// import { Row } from "../../shared/types/Row";

// export function tightBondEffect(ctx: CardPlayContext) {
//   const { engine, playerId, cardInstanceId } = ctx;
//   const player = engine.getState().players[playerId];
//   const card = engine.getCard(cardInstanceId);

//   // jeśli row nie jest ustawione, nie wykonujemy efektu
//   if (!card.row) return;

//   const row: Row = card.row;

//   // szukamy kart w tym samym wierszu i tej samej grupie bondGroup
//   const sameGroupCards = player.board[row].filter(
//     c => c.bondGroup && c.bondGroup === card.bondGroup
//   );

//   // efekt działa tylko jeśli są co najmniej 2 karty w bondGroup
//   if (sameGroupCards.length > 1) {
//     sameGroupCards.forEach(c => {
//       engine.addModifier(c.id, {
//         id: `tightBond_${row}`,
//         source: "tightBond",
//         type: "MULTIPLY",
//         value: 2
//       });
//     });
//   }
// }

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

  if (sameGroupCards.length > 1) {
    sameGroupCards.forEach(c => {
      engine.addModifier(c.id, {
        id: `tightBond_${row}`,
        source: "tightBond",
        type: "MULTIPLY",
        value: 2
      });
    });
  }
}