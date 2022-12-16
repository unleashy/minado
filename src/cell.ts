import type { Position } from "./position";

export type CellOpen = { isOpen: true; hasMine: boolean };
export type CellClosed = { isOpen: false; hasMine: boolean; hasFlag: boolean };

export type Cell = CellOpen | CellClosed;
export type CellWithPosition = Cell & { pos: Position };
