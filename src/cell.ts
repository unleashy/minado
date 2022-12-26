export type CellEmptyClosed = {
  isOpen: false;
  hasMine: false;
  hasFlag: boolean;
  adjacentMines: number;
};

export type CellEmptyOpen = {
  isOpen: true;
  hasMine: false;
  adjacentMines: number;
};

export type CellMine = {
  isOpen: false;
  hasMine: true;
  hasFlag: boolean;
};

export type Cell = CellEmptyClosed | CellEmptyOpen | CellMine;
