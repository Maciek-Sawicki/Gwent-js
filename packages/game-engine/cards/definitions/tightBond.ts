import { CardRegistry } from "../CardRegistry";

CardRegistry.register({
  id: "tight_bond",
  basePower: 4,
  tags: ["bond"],

  onPlay(context) {
    const player = context.state.players[context.playerId];

    const same = player.board.filter(
      c => c.definitionId === "tight_bond"
    );

    if (same.length === 2) {
      console.log("Bond activated!");
      // później: dodamy modifier
    }
  }
});