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

export type CellMineClosed = {
  isOpen: false;
  hasMine: true;
  hasFlag: boolean;
};

export type CellMineOpen = {
  isOpen: true;
  hasMine: true;
};

export type Cell =
  | CellEmptyClosed
  | CellEmptyOpen
  | CellMineClosed
  | CellMineOpen;
