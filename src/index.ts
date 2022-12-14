import "./style.css";

type Position = {
  x: number;
  y: number;
};

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

document.documentElement.style.setProperty(
  "--field-rows",
  String(DEFAULT_ROWS)
);
document.documentElement.style.setProperty(
  "--field-cols",
  String(DEFAULT_COLS)
);

const statusLine = document.getElementById("status-line");
if (!statusLine) throw new Error("no status line");

const field = document.getElementById("field");
if (!field) throw new Error("no field");

field.append(...generateField(DEFAULT_ROWS, DEFAULT_COLS));
statusLine.innerText = "Waiting for first click";
