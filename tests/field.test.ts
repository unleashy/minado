import { expect, test } from "vitest";
import { type Dimensions, type Position } from "../src/measures";
import { type Cell } from "../src/cell";
import { genEmptyField, genField, openCell } from "../src/field";
import { Random } from "../src/random";

test("genEmptyField generates an empty field", () => {
  const dimensions: Dimensions = { rows: 2, columns: 2 };
  const field = genEmptyField(dimensions);

  const fieldPicture = field.field.map((row) =>
    row.map((cell) => (cell.hasMine ? "X" : cell.isOpen ? "X" : " ")).join("")
  );
  // prettier-ignore
  expect(fieldPicture).toEqual([
    "  ",
    "  "
  ]);
});

test("genField generates a field with randomly placed mines", () => {
  const dimensions: Dimensions = { rows: 5, columns: 10 };
  const numMines = 8;
  const safeCell: Position = { x: 2, y: 2 };
  const random = new Random(1);

  const field = genField({ dimensions, numMines }, safeCell, random);

  const fieldPicture = field.field.map((row) =>
    row
      .map((cell) => (cell.hasMine ? "M" : cell.adjacentMines.toString()))
      .join("")
  );
  expect(fieldPicture).toEqual([
    "001M2102M2",
    "0023M213M3",
    "001M33M22M",
    "0012M21111",
    "0001110000"
  ]);
});

test("openCell opens an unopened cell", () => {
  const field = genEmptyField({ rows: 3, columns: 3 });

  const pos: Position = { x: 1, y: 1 };
  expect(openCell(field, pos).field[pos.y][pos.x].isOpen).toBe(true);
});
