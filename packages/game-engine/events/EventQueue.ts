import { GameEvent } from "./GameEvent";

export class EventQueue {
  private queue: GameEvent[] = [];

  push(event: GameEvent) {
    this.queue.push(event);
  }

  process(handler: (event: GameEvent) => void) {
    while (this.queue.length > 0) {
      const event = this.queue.shift()!;
      handler(event);
    }
  }
}