import type { Position } from "./position";
import type { CellWithPosition } from "./cell";
import { type Field } from "./field";

export class Game {
  private readonly eventHandlers = {
    start: [] as Array<() => void>,
    open: [] as Array<(pos: Position) => void>
  };

  constructor(readonly field: Field) {}

  on(type: "start", handler: () => void): void;
  on(type: "open", handler: (pos: Position) => void): void;
  on(
    type: "start" | "open",
    handler: (() => void) | ((pos: Position) => void)
  ): void {
    (this.eventHandlers[type] as Array<typeof handler>).push(handler);
  }

  openCell(pos: Position): void {
    for (const handler of this.eventHandlers.start) {
      handler();
    }

    for (const handler of this.eventHandlers.open) {
      handler(pos);
    }
  }

  get cellsByRow(): CellWithPosition[][] {
    return this.field.byRow;
  }

  get rows(): number {
    return this.field.rows;
  }

  get columns(): number {
    return this.field.columns;
  }

  get numMines(): number {
    return this.field.numMines;
  }
}
