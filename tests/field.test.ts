import { expect, test } from "vitest";
import { Random } from "../src/random";
import { areAdjacent, type Dimensions, type Position } from "../src/measures";
import { genEmptyField, genField, openCell } from "../src/field";

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
    "0012M213M3",
    "000223M22M",
    "0001M32111",
    "00012M1000"
  ]);
});

test("genField keeps an 8x8 area without mines around the safe cell", () => {
  const dimensions: Dimensions = { rows: 5, columns: 5 };
  const numMines = 5;
  const safeCell: Position = { x: 1, y: 1 };
  const random = new Random();

  for (let i = 0; i < 100; ++i) {
    const field = genField({ dimensions, numMines }, safeCell, random);

    const minesPos = field.field.flatMap((row, y) =>
      row.flatMap((cell, x): Position[] => (cell.hasMine ? [{ x, y }] : []))
    );
    expect(minesPos).toSatisfy((minesPos: Position[]) =>
      minesPos.every((pos) => !areAdjacent(pos, safeCell))
    );
  }
});

test("openCell opens an unopened cell", () => {
  const field = genEmptyField({ rows: 3, columns: 3 });

  const pos: Position = { x: 1, y: 1 };
  expect(openCell(field, pos).field[pos.y][pos.x].isOpen).toBe(true);
});
