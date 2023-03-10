import { expect, test } from "vitest";
import { Random } from "../src/random";
import { areAdjacent, type Dimensions, type Position } from "../src/measures";
import {
  genEmptyField,
  genField,
  isCompleted,
  openCell,
  toggleFlag
} from "../src/field";

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

test("openCell opens reachable empty cells", () => {
  const field = genField(
    { dimensions: { rows: 5, columns: 5 }, numMines: 5 },
    { x: 0, y: 0 },
    new Random(4)
  );

  const pos: Position = { x: 2, y: 3 };
  const { field: newField, mineOpened } = openCell(field, pos);

  const fieldPicture = newField.field.map((row) =>
    row.map((cell) => (cell.hasMine ? "M" : cell.isOpen ? "O" : "X")).join("")
  );
  // prettier-ignore
  expect(fieldPicture).toEqual([
    "XXXXX",
    "XXMMM",
    "XOOOO",
    "MOOOO",
    "MOOOO",
  ]);
  expect(mineOpened).toBe(false);
});

test("opening a cell with adjacent mines does not open any more cells", () => {
  const field = genField(
    { dimensions: { rows: 5, columns: 5 }, numMines: 5 },
    { x: 0, y: 0 },
    new Random(4)
  );

  const pos: Position = { x: 2, y: 2 };
  const { field: newField, mineOpened } = openCell(field, pos);

  const fieldPicture = newField.field.map((row) =>
    row.map((cell) => (cell.hasMine ? "M" : cell.isOpen ? "O" : "X")).join("")
  );
  // prettier-ignore
  expect(fieldPicture).toEqual([
    "XXXXX",
    "XXMMM",
    "XXOXX",
    "MXXXX",
    "MXXXX",
  ]);
  expect(mineOpened).toBe(false);
});

test("directly opening a cell with a mine sets mineOpened to true", () => {
  const field = genField(
    { dimensions: { rows: 5, columns: 5 }, numMines: 5 },
    { x: 0, y: 0 },
    new Random(4)
  );

  const pos: Position = { x: 0, y: 3 };
  const { mineOpened } = openCell(field, pos);

  expect(mineOpened).toBe(true);
});

// TODO:
//  Click on an:
//     - opened cell
//     - with adjacent mines > 0
//     - with adjacent flags == adjacent mines
//   = open all 8 neighbouring cells including mines

test("toggleFlag places/removes flags on closed cells", () => {
  const field = genField(
    { dimensions: { rows: 5, columns: 5 }, numMines: 5 },
    { x: 0, y: 0 },
    new Random(4)
  );

  const flaggedField = toggleFlag(field, { x: 4, y: 1 });

  const fieldPicture = flaggedField.field.map((row) =>
    row.map((cell) => (!cell.isOpen && cell.hasFlag ? "F" : "_")).join("")
  );
  // prettier-ignore
  expect(fieldPicture).toEqual([
    "_____",
    "____F",
    "_____",
    "_____",
    "_____",
  ]);

  const unflaggedField = toggleFlag(flaggedField, { x: 4, y: 1 });

  expect(field).toEqual(unflaggedField);
});

test("isCompleted returns true if all unopened cells have mines", () => {
  const { field } = openCell(
    genField(
      { dimensions: { rows: 3, columns: 3 }, numMines: 2 },
      { x: 0, y: 0 },
      new Random(4)
    ),
    { x: 0, y: 0 }
  );

  const fieldPicture = field.field.map((row) =>
    row.map((cell) => (cell.hasMine ? "M" : cell.isOpen ? "O" : "X")).join("")
  );

  // prettier-ignore
  expect(fieldPicture).toEqual([
    "OOO",
    "OOO",
    "MXM",
  ]);
  expect(isCompleted(field)).toBe(false);

  const { field: newField } = openCell(field, { x: 1, y: 2 });

  const newFieldPicture = newField.field.map((row) =>
    row.map((cell) => (cell.hasMine ? "M" : cell.isOpen ? "O" : "X")).join("")
  );
  // prettier-ignore
  expect(newFieldPicture).toEqual([
    "OOO",
    "OOO",
    "MOM",
  ]);
  expect(isCompleted(newField)).toBe(true);
});
