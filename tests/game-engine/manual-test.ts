import { GameEngine } from "../../packages/game-engine/core/GameEngine";
import { GameState } from "../../packages/game-engine/core/GameState";
import { CardRegistry } from "../../packages/game-engine/cards/CardRegistry";
import { ScoringService } from "../../packages/game-engine/scoring/ScoringService";
import { Modifier } from "../../packages/game-engine/scoring/Modifier";

// 1️⃣ Rejestracja testowych kart

// 1. Soldier – zwykła karta 5 mocy
CardRegistry.register({
  id: "soldier",
  basePower: 5
});

// 2. Tight Bond – podwaja moc identycznych kart
CardRegistry.register({
  id: "tightBond",
  basePower: 3,
  onPlay: ({ engine, cardInstanceId, playerId }) => {
    const player = engine.getState().players[playerId];
    const sameCards = player.board.filter(c => c.definitionId === "tightBond");
    if (sameCards.length > 1) {
      sameCards.forEach(c => {
        engine.addModifier(c.id, {
          id: "tightBondModifier",
          source: "tightBond",
          type: "MULTIPLY",
          value: 2
        } as Modifier);
      });
    }
  }
});

// 3. Boost Card – dodaje 3 do mocy
CardRegistry.register({
  id: "boostCard",
  basePower: 4,
  onPlay: ({ engine, cardInstanceId }) => {
    engine.addModifier(cardInstanceId, {
      id: "boost",
      source: "boostCard",
      type: "ADD",
      value: 3
    } as Modifier);
  }
});

// 4. Medic – przykładowy efekt (przywraca kartę ze stosu kart odrzuconych, tutaj tylko log)
CardRegistry.register({
  id: "medic",
  basePower: 1,
  onPlay: ({ playerId }) => {
    console.log(`Medic effect: player ${playerId} can resurrect a card`);
  }
});

// 5. Scorch – niszczy najsilniejszą kartę przeciwnika
CardRegistry.register({
  id: "scorch",
  basePower: 0,
  onPlay: ({ engine, playerId }) => {
    const opponentId = playerId === "p1" ? "p2" : "p1";
    const opponent = engine.getState().players[opponentId];
    const maxPower = Math.max(...opponent.board.map(c => ScoringService.calculateCardPower(c)));
    opponent.board = opponent.board.filter(c => ScoringService.calculateCardPower(c) < maxPower);
    console.log(`Scorch played by ${playerId}, destroyed opponent's strongest cards`);
  }
});

// 2️⃣ Tworzymy początkowy stan gry
const initialState: GameState = {
  round: 1,
  status: "IN_PROGRESS",
  currentPlayer: "p1",
  players: {
    p1: { id: "p1", hand: [], board: [], passed: false, roundsWon: 0 },
    p2: { id: "p2", hand: [], board: [], passed: false, roundsWon: 0 }
  }
};

// 3️⃣ Tworzymy silnik
const engine = new GameEngine(initialState);

// 4️⃣ Dodajemy karty do ręki
engine.getState().players.p1.hand.push(
  engine.createCardInstance("soldier"),
  engine.createCardInstance("tightBond"),
  engine.createCardInstance("tightBond")
);
engine.getState().players.p2.hand.push(
  engine.createCardInstance("boostCard"),
  engine.createCardInstance("scorch")
);

// 5️⃣ Sprawdzamy score przed zagraniem
console.log("Before play p1:", engine.getScore("p1"));
console.log("Before play p2:", engine.getScore("p2"));

// 6️⃣ Zagrywamy karty
engine.dispatch({ type: "PLAY_CARD", playerId: "p1", cardId: engine.getState().players.p1.hand[0].id }); // Soldier
engine.dispatch({ type: "PLAY_CARD", playerId: "p2", cardId: engine.getState().players.p2.hand[0].id }); // BoostCard
engine.dispatch({ type: "PLAY_CARD", playerId: "p1", cardId: engine.getState().players.p1.hand[0].id }); // TightBond
engine.dispatch({ type: "PLAY_CARD", playerId: "p2", cardId: engine.getState().players.p2.hand[0].id }); // Scorch
engine.dispatch({ type: "PLAY_CARD", playerId: "p1", cardId: engine.getState().players.p1.hand[0].id }); // TightBond 2

// 7️⃣ Score po zagraniu
console.log("After play p1:", engine.getScore("p1"));
console.log("After play p2:", engine.getScore("p2"));

// 8️⃣ Wyświetlamy plansze
console.log("Board p1:", engine.getState().players.p1.board.map(c => ({ id: c.id, def: c.definitionId })));
console.log("Board p2:", engine.getState().players.p2.board.map(c => ({ id: c.id, def: c.definitionId })));