import type { Position } from "./position";

export type CellOpen = { isOpen: true; hasMine: boolean };
export type CellClosed = { isOpen: false; hasMine: boolean; hasFlag: boolean };

export type Cell = CellOpen | CellClosed;
export type CellWithPosition = Cell & { pos: Position };

export class Game {
  private readonly field: Cell[];

  constructor(
    readonly rows: number,
    readonly columns: number,
    readonly numMines: number
  ) {
    this.field = Array.from({ length: rows * columns }).map(() => ({
      isOpen: false,
      hasMine: false,
      hasFlag: false
    }));
  }

  openCell(pos: Position) {
    // TODO
  }

  get cellsByRow(): CellWithPosition[][] {
    const result = [];

    for (let y = 0; y < this.rows; ++y) {
      result.push(
        this.field
          .slice(y * this.rows, y * this.rows + this.columns)
          .map((cell, x) => ({ ...cell, pos: { x, y } }))
      );
    }

    return result;
  }
}
