import { DeckMode } from "@repo/game-engine";

export function resolveDeckModeFromEnv(env: NodeJS.ProcessEnv): DeckMode {
  if (env.DEMO === "true") return DeckMode.DEMO;
  if (env.SPY_TEST === "true") return DeckMode.SPY_TEST;
  if (env.DEMO_FIXED_HAND === "true") return DeckMode.DEMO_FIXED_HAND;

  return DeckMode.NORMAL;
}
