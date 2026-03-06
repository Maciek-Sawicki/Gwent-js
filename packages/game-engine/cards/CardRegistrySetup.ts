import { CardRegistry } from "./CardRegistry";
import { northernRealmsCards } from "./definitions/northernRealmsCards";

export function CardRegistrySetup() {
  northernRealmsCards.forEach(card => {
    CardRegistry.register(card);
  });
};


