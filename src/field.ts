import produce, { type Draft } from "immer";
import { type Dimensions, type Position } from "./measures";
import { type Cell } from "./cell";
import { type Random } from "./random";

export type Field = {
  field: Cell[][];
  dimensions: Dimensions;
  numMines: number;
};

export function genEmptyField({ rows, columns }: Dimensions): Field {
  return {
    field: Array.from({ length: rows }).map(() =>
      Array.from({ length: columns }).map(() => ({
        isOpen: false,
        hasMine: false,
        hasFlag: false
      }))
    ),
    dimensions: { rows, columns },
    numMines: 0
  };
}

export function genField(
  { dimensions, numMines }: { dimensions: Dimensions; numMines: number },
  safeCell: Position,
  random: Random
): Field {
  if (numMines < 0) {
    throw new RangeError(`numMines must be greater than or equal to 0`);
  } else if (dimensions.rows * dimensions.columns <= numMines) {
    throw new RangeError(
      `can't have ${numMines} mines, because ` +
        `a ${dimensions.rows}x${dimensions.columns} field only has space ` +
        `for ${dimensions.rows * dimensions.columns - 1} mines`
    );
  }

  // 1. Create a field
  const field = buildFieldArray(dimensions);

  // 2. Randomly cover the field with mines, up to numMines
  const mustBeSafe = (pos: Position) =>
    pos.x === safeCell.x && pos.y === safeCell.y;
  const hasMine = (pos: Position) => at(field, pos).hasMine;

  let minesPlaced = 0;
  while (minesPlaced < numMines) {
    const minePos: Position = {
      x: random.between(0, dimensions.rows),
      y: random.between(0, dimensions.columns)
    };
    if (mustBeSafe(minePos) || hasMine(minePos)) {
      continue;
    }

    at(field, minePos).hasMine = true;
    ++minesPlaced;
  }

  // 3. Assign each cell a number according to the mines adjacent to it
  // TODO

  // 4. Finish
  return { field, dimensions, numMines };
}

export const openCell = produce(({ field }: Draft<Field>, pos: Position) => {
  at(field, pos).isOpen = true;
});

function buildFieldArray({ rows, columns }: Dimensions): Cell[][] {
  return Array.from({ length: rows }).map(() =>
    Array.from({ length: columns }).map(() => ({
      isOpen: false,
      hasMine: false,
      hasFlag: false
    }))
  );
}

function at(field: Cell[][], pos: Position): Cell {
  return field[pos.y][pos.x];
}
