import produce, { type Draft } from "immer";
import { type Dimensions, type Position } from "./measures";
import { type Cell, type CellMine } from "./cell";
import { type Random } from "./random";

export type Field = {
  field: Cell[][];
  dimensions: Dimensions;
  numMines: number;
};

export function genEmptyField(dimensions: Dimensions): Field {
  return {
    field: buildFieldArray(dimensions),
    dimensions,
    numMines: 0
  };
}

export function genField(
  { dimensions, numMines }: Omit<Field, "field">,
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

  const field: Field = {
    field: buildFieldArray(dimensions),
    dimensions,
    numMines
  };
  randomlyPlaceMines(field, safeCell, random);
  setAdjacentMineCount(field);
  return field;
}

function randomlyPlaceMines(
  { field, dimensions, numMines }: Field,
  safeCell: Position,
  random: Random
) {
  const mustBeSafe = (pos: Position) =>
    pos.x === safeCell.x && pos.y === safeCell.y;
  const hasMine = (pos: Position) => getCell(field, pos).hasMine;

  let minesPlaced = 0;
  while (minesPlaced < numMines) {
    const minePos: Position = {
      x: random.between(0, dimensions.columns),
      y: random.between(0, dimensions.rows)
    };
    if (mustBeSafe(minePos) || hasMine(minePos)) {
      continue;
    }

    const mine: CellMine = {
      isOpen: false,
      hasMine: true,
      hasFlag: false
    };

    setCell(field, minePos, mine);
    ++minesPlaced;
  }
}

function setAdjacentMineCount({ field, dimensions: { rows, columns } }: Field) {
  for (let y = 0; y < rows; ++y) {
    for (let x = 0; x < columns; ++x) {
      const pos: Position = { x, y };
      const cell = getCell(field, pos);
      if (!cell.hasMine) {
        cell.adjacentMines = numAdjacentMines(field, pos);
      }
    }
  }
}

function numAdjacentMines(field: Cell[][], pos: Position): number {
  const adjacentCellPos: Position[] = [
    { x: pos.x - 1, y: pos.y - 1 },
    { x: pos.x - 1, y: pos.y },
    { x: pos.x - 1, y: pos.y + 1 },
    { x: pos.x, y: pos.y - 1 },
    { x: pos.x, y: pos.y + 1 },
    { x: pos.x + 1, y: pos.y - 1 },
    { x: pos.x + 1, y: pos.y },
    { x: pos.x + 1, y: pos.y + 1 }
  ];

  return adjacentCellPos.filter((pos) => getCell(field, pos)?.hasMine).length;
}

export const openCell = produce(({ field }: Draft<Field>, pos: Position) => {
  getCell(field, pos).isOpen = true;
});

function buildFieldArray({ rows, columns }: Dimensions): Cell[][] {
  return Array.from({ length: rows }).map(() =>
    Array.from({ length: columns }).map(() => ({
      isOpen: false,
      hasMine: false,
      hasFlag: false,
      adjacentMines: 0
    }))
  );
}

function getCell(field: Cell[][], pos: Position): Cell {
  return field[pos.y]?.[pos.x];
}

function setCell(field: Cell[][], pos: Position, cell: Cell) {
  field[pos.y][pos.x] = cell;
}
