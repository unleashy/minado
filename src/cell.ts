export type Position = {
  x: number;
  y: number;
};

export type Dimensions = {
  rows: number;
  columns: number;
};

export type CellOpen = { isOpen: true; hasMine: boolean };
export type CellClosed = { isOpen: false; hasMine: boolean; hasFlag: boolean };

export type Cell = CellOpen | CellClosed;
