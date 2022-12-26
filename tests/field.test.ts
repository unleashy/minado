import { expect, test } from "vitest";
import { type Dimensions, type Position } from "../src/measures";
import { type Cell } from "../src/cell";
import { genEmptyField, genField, openCell } from "../src/field";
import { Random } from "../src/random";

test("genEmptyField generates an empty field", () => {
  const dimensions: Dimensions = { rows: 2, columns: 2 };
  const field = genEmptyField(dimensions);

  expect(field).toMatchInlineSnapshot(`
    {
      "dimensions": {
        "columns": 2,
        "rows": 2,
      },
      "field": [
        [
          {
            "hasFlag": false,
            "hasMine": false,
            "isOpen": false,
          },
          {
            "hasFlag": false,
            "hasMine": false,
            "isOpen": false,
          },
        ],
        [
          {
            "hasFlag": false,
            "hasMine": false,
            "isOpen": false,
          },
          {
            "hasFlag": false,
            "hasMine": false,
            "isOpen": false,
          },
        ],
      ],
      "numMines": 0,
    }
  `);
});

test("genField generates a field with randomly placed mines", () => {
  const dimensions: Dimensions = { rows: 5, columns: 5 };
  const numMines = 5;
  const safeCell: Position = { x: 2, y: 2 };
  const random = new Random(0);
  const field = genField({ dimensions, numMines }, safeCell, random);

  expect(field).toMatchInlineSnapshot(`
    {
      "dimensions": {
        "columns": 5,
        "rows": 5,
      },
      "field": [
        [
          {
            "hasFlag": false,
            "hasMine": false,
            "isOpen": false,
          },
          {
            "hasFlag": false,
            "hasMine": false,
            "isOpen": false,
          },
          {
            "hasFlag": false,
            "hasMine": false,
            "isOpen": false,
          },
          {
            "hasFlag": false,
            "hasMine": false,
            "isOpen": false,
          },
          {
            "hasFlag": false,
            "hasMine": true,
            "isOpen": false,
          },
        ],
        [
          {
            "hasFlag": false,
            "hasMine": false,
            "isOpen": false,
          },
          {
            "hasFlag": false,
            "hasMine": false,
            "isOpen": false,
          },
          {
            "hasFlag": false,
            "hasMine": false,
            "isOpen": false,
          },
          {
            "hasFlag": false,
            "hasMine": false,
            "isOpen": false,
          },
          {
            "hasFlag": false,
            "hasMine": false,
            "isOpen": false,
          },
        ],
        [
          {
            "hasFlag": false,
            "hasMine": false,
            "isOpen": false,
          },
          {
            "hasFlag": false,
            "hasMine": true,
            "isOpen": false,
          },
          {
            "hasFlag": false,
            "hasMine": false,
            "isOpen": false,
          },
          {
            "hasFlag": false,
            "hasMine": true,
            "isOpen": false,
          },
          {
            "hasFlag": false,
            "hasMine": true,
            "isOpen": false,
          },
        ],
        [
          {
            "hasFlag": false,
            "hasMine": false,
            "isOpen": false,
          },
          {
            "hasFlag": false,
            "hasMine": false,
            "isOpen": false,
          },
          {
            "hasFlag": false,
            "hasMine": false,
            "isOpen": false,
          },
          {
            "hasFlag": false,
            "hasMine": true,
            "isOpen": false,
          },
          {
            "hasFlag": false,
            "hasMine": false,
            "isOpen": false,
          },
        ],
        [
          {
            "hasFlag": false,
            "hasMine": false,
            "isOpen": false,
          },
          {
            "hasFlag": false,
            "hasMine": false,
            "isOpen": false,
          },
          {
            "hasFlag": false,
            "hasMine": false,
            "isOpen": false,
          },
          {
            "hasFlag": false,
            "hasMine": false,
            "isOpen": false,
          },
          {
            "hasFlag": false,
            "hasMine": false,
            "isOpen": false,
          },
        ],
      ],
      "numMines": 5,
    }
  `);
});

test("openCell opens an unopened cell", () => {
  const field = genEmptyField({ rows: 3, columns: 3 });

  const pos: Position = { x: 1, y: 1 };
  expect(openCell(field, pos).field[pos.y][pos.x].isOpen).toBe(true);
});
