export type Position = {
  x: number;
  y: number;
};

export type Dimensions = {
  rows: number;
  columns: number;
};

export function areAdjacent(a: Position, b: Position): boolean {
  // A position is adjacent to another if the absolute difference between their
  // coordinates is 0 or 1:
  //
  //    2 1 0 1 2
  //  2 N N N N N
  //  1 N A A A N
  //  0 N A x A N
  //  1 N A A A N
  //  2 N N N N N
  //
  // where x is our position, A is adjacent, and N is non-adjacent
  return Math.abs(b.x - a.x) <= 1 && Math.abs(b.y - a.y) <= 1;
}
