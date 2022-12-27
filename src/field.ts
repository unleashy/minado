import produce, { type Draft } from "immer";
import {
  adjacentPositions,
  areAdjacent,
  type Dimensions,
  type Position
} from "./measures";
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
  const mustBeSafe = (pos: Position) => areAdjacent(pos, safeCell);

  let minesPlaced = 0;
  while (minesPlaced < numMines) {
    const minePos: Position = {
      x: random.between(0, dimensions.columns),
      y: random.between(0, dimensions.rows)
    };

    if (mustBeSafe(minePos) || hasMine(field, minePos)) {
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

function setAdjacentMineCount({ field, dimensions }: Field) {
  for (let y = 0; y < dimensions.rows; ++y) {
    for (let x = 0; x < dimensions.columns; ++x) {
      const pos: Position = { x, y };
      const cell = getCell(field, pos)!;
      if (!cell.hasMine) {
        cell.adjacentMines = numAdjacentMines(field, pos, dimensions);
      }
    }
  }
}

function numAdjacentMines(
  field: Cell[][],
  pos: Position,
  dimensions: Dimensions
): number {
  return [...adjacentPositions(pos, dimensions)].filter((pos) =>
    hasMine(field, pos)
  ).length;
}

function hasMine(field: Cell[][], pos: Position): boolean {
  return getCell(field, pos)?.hasMine ?? false;
}

export const openCell = produce(
  ({ field, dimensions }: Draft<Field>, pos: Position) => {
    openCellRecursive(pos);

    function openCellRecursive(pos: Position) {
      const cell = getCell(field, pos);
      if (!cell || cell.isOpen || cell.hasMine) {
        return;
      }

      setCell(field, pos, {
        isOpen: true,
        hasMine: false,
        adjacentMines: cell.adjacentMines
      });

      for (const adjacentPos of adjacentPositions(pos, dimensions)) {
        const adjacentCell = getCell(field, adjacentPos)!;
        if (adjacentCell.hasMine) continue;

        if (hasNoAdjacentMines(adjacentCell)) {
          openCellRecursive(adjacentPos);
        } else {
          setCell(field, adjacentPos, {
            isOpen: true,
            hasMine: false,
            adjacentMines: adjacentCell.adjacentMines
          });
        }
      }
    }
  }
);

function hasNoAdjacentMines(adjacentCell: Cell): boolean {
  return !adjacentCell.hasMine && adjacentCell.adjacentMines === 0;
}

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

function getCell(field: Cell[][], pos: Position): Cell | undefined {
  return field[pos.y]?.[pos.x];
}

function setCell(field: Cell[][], pos: Position, cell: Cell) {
  field[pos.y][pos.x] = cell;
}
