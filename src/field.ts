import type { Cell, CellWithPosition } from "./cell";

export class Field {
  private readonly cells: Cell[];

  constructor(
    readonly rows: number,
    readonly columns: number,
    readonly numMines: number
  ) {
    this.cells = Array.from({ length: rows * columns }).map(() => ({
      isOpen: false,
      hasMine: false,
      hasFlag: false
    }));
  }

  get byRow(): CellWithPosition[][] {
    const result = [];

    for (let y = 0; y < this.rows; ++y) {
      result.push(
        this.cells
          .slice(y * this.rows, y * this.rows + this.columns)
          .map((cell, x) => ({ ...cell, pos: { x, y } }))
      );
    }

    return result;
  }
}
