import type { Position } from "./position";

export class Game {
  constructor(
    readonly rows: number,
    readonly columns: number,
    readonly numMines: number
  ) {}

  openCell(pos: Position) {}
}
