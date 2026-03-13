// 1️⃣ Rejestracja wszystkich kart – wystarczy import, efekt uboczny to dodanie do CardRegistry
import "./effects/tightBond";
// dodaj inne frakcje, np. Nilfgaard
import "./cards/definitions/nilfgaardCards";
import "./cards/definitions/northernRealmsCards";

// 2️⃣ Eksport publicznych modułów silnika
export * from "./core/GameEngine";
export * from "./core/GameState";
export * from "./core/PlayerState";
export * from "./core/CardInstance";

// karty i rejestracja
export * from "./cards/CardRegistry";
export * from "./cards/CardDefinition";

// scoring / modyfikatory
export * from "./scoring/ScoringService";
export * from "./scoring/Modifier";