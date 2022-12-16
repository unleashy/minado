import { expect, test, vi } from "vitest";
import { Field } from "../src/field";
import { Game } from "../src/game";

test("opening a cell for the first time emits a start event", () => {
  const game = new Game(new Field(2, 2, 0));
  const startSpy = vi.fn();
  game.on("start", startSpy);

  game.openCell({ x: 0, y: 0 });

  expect(startSpy).toHaveBeenCalledOnce();
  expect(startSpy).toHaveBeenCalledWith();
});

test("opening a cell emits an open event", () => {
  const game = new Game(new Field(2, 2, 0));
  const openSpy = vi.fn();
  game.on("open", openSpy);

  game.openCell({ x: 1, y: 1 });

  expect(openSpy).toHaveBeenCalledOnce();
  expect(openSpy).toHaveBeenCalledWith({ x: 1, y: 1 });
});
