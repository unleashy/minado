import { expect, test } from "vitest";
import { Field } from "../src/field";

test("a field is rows times columns in size", () => {
  const sut = new Field(3, 4, 0);

  expect(sut.byRow).toHaveLength(sut.rows);
  expect(sut.byRow.every((row) => row.length === sut.columns)).toBe(true);
});

test("a field starts with all cells closed", () => {
  const sut = new Field(3, 4, 0);

  expect(sut.byRow.flat().every((cell) => !cell.isOpen)).toBe(true);
});
