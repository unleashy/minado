import { Game } from "./game";
import type { Position } from "./position";

import "./style.css";

type Corner = "top-left" | "top-right" | "bottom-left" | "bottom-right";

function getCorner(
  { x, y }: Position,
  rows: number,
  columns: number
): Corner | undefined {
  if (x === 0 && y === 0) {
    return "top-left";
  } else if (x === columns - 1 && y === 0) {
    return "top-right";
  } else if (x === 0 && y === rows - 1) {
    return "bottom-left";
  } else if (x === columns - 1 && y === rows - 1) {
    return "bottom-right";
  } else {
    return undefined;
  }
}

function createCellElement(pos: Position, corner?: Corner): HTMLButtonElement {
  const result = document.createElement("button");
  result.dataset["action"] = "open-cell";
  result.dataset["posX"] = String(pos.x);
  result.dataset["posY"] = String(pos.y);
  if (corner) result.dataset["corner"] = corner;
  result.innerHTML = "&nbsp;";
  return result;
}

function generateField(rows: number, columns: number): HTMLButtonElement[] {
  const result = [];

  for (let y = 0; y < rows; ++y) {
    for (let x = 0; x < columns; ++x) {
      result.push(
        createCellElement({ x, y }, getCorner({ x, y }, rows, columns))
      );
    }
  }

  return result;
}

////////////////////////////////////////////////////////////////////////////////

const DEFAULT_ROWS = 5;
const DEFAULT_COLS = 5;
const DEFAULT_NUM_MINES = 3;

const game = new Game(DEFAULT_ROWS, DEFAULT_COLS, DEFAULT_NUM_MINES);

let startTime: DOMHighResTimeStamp | undefined;

const statusLine = document.getElementById("status-line");
if (!statusLine) throw new Error("no status line");

const field = document.getElementById("field");
if (!field) throw new Error("no field");

const renderStatusLine = () => {
  if (startTime) {
    const deltaTime = performance.now() - startTime;
    const deltaMins = Math.floor(deltaTime / 60_000);
    const deltaSecs = Math.floor((deltaTime - deltaMins * 60_000) / 1000);

    const time =
      deltaMins.toString().padStart(1, "0") +
      "m" +
      deltaSecs.toString().padStart(2, "0") +
      "s";

    statusLine.innerText = `${time} – 0 / ${game.numMines} mines flagged`;
  } else {
    statusLine.innerText = `Waiting for first click`;
  }
};

const render = () => {
  // TODO
};

const initialRender = () => {
  const rootStyle = document.documentElement.style;
  rootStyle.setProperty("--field-rows", String(game.rows));
  rootStyle.setProperty("--field-cols", String(game.columns));

  field.innerHTML = "";
  field.append(...generateField(game.rows, game.columns));
  renderStatusLine();
};

document.addEventListener("click", (e) => {
  const target = e.target;
  if (!(target instanceof HTMLButtonElement)) {
    return;
  }

  const action = target.dataset["action"];
  if (action === undefined) {
    return;
  }

  e.preventDefault();

  switch (action) {
    case "open-cell": {
      game.openCell({
        x: Number(target.dataset["posX"]),
        y: Number(target.dataset["posY"])
      });

      // TODO: use an event
      startTime = performance.now();
      renderStatusLine();
      setInterval(renderStatusLine, 1000);
      render();
      break;
    }

    default: {
      throw new Error(`unknown action ${action}`);
    }
  }
});

initialRender();
