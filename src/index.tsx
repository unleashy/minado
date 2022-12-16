import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { Field } from "./field";
import { Game } from "./game";
import { App } from "./App";

import "./style.css";

const DEFAULT_ROWS = 5;
const DEFAULT_COLS = 5;
const DEFAULT_NUM_MINES = 3;
const game = new Game(new Field(DEFAULT_ROWS, DEFAULT_COLS, DEFAULT_NUM_MINES));

createRoot(document.querySelector("#root")!).render(
  <StrictMode>
    <App game={game} />
  </StrictMode>
);
