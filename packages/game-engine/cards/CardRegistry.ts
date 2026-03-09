import { CardDefinition } from "./CardDefinition";

export class CardRegistry {
  private static definitions = new Map<string, CardDefinition>();

  static register(def: CardDefinition) {
    this.definitions.set(def.id, def);
  }

  static get(id: string): CardDefinition {
    const def = this.definitions.get(id);
    if (!def) throw new Error(`Card definition ${id} not found`);
    return def;
  }

  static getAll(): CardDefinition[] {
    return Array.from(this.definitions.values());
  }
}