import {
  type ButtonHTMLAttributes,
  type MouseEvent,
  type ReactNode,
  type FormEvent,
  memo,
  useCallback,
  useEffect,
  useRef,
  useState
} from "react";
import * as Popover from "@radix-ui/react-popover";
import { Random } from "./random";
import { type Dimensions, type Position } from "./measures";
import { type Cell } from "./cell";
import {
  type Field,
  genEmptyField,
  genField,
  isCompleted,
  openCell,
  toggleFlag
} from "./field";

const MIN_SIZE = 4;
const MAX_SIZE = 32;
const MIN_MINES = 1;
const MIN_SAFE_CELLS = 9;
const MAX_MINES = MAX_SIZE * MAX_SIZE - MIN_SAFE_CELLS;

type ToState = (element: JSX.Element) => void;

export function App() {
  const [dimensions, setDimensions] = useState<Dimensions>({
    rows: 9,
    columns: 9
  });
  const [numMines, setNumMines] = useState(10);

  const [gameState, setGameState] = useState<JSX.Element | undefined>();
  const toNotStarted = (dimensions: Dimensions, numMines: number) => {
    setGameState(
      <StateNotStarted
        dimensions={dimensions}
        numMines={numMines}
        toState={setGameState}
      />
    );
  };

  if (gameState === undefined) {
    toNotStarted(dimensions, numMines);
  }

  const newGame = (e: MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    toNotStarted(dimensions, numMines);
  };

  const customise = (dimensions: Dimensions, numMines: number) => {
    setDimensions(dimensions);
    setNumMines(numMines);
    toNotStarted(dimensions, numMines);
  };

  return (
    <>
      <header>
        <h1>Minado</h1>
        <nav>
          <button type="button" onClick={newGame}>
            New game
          </button>

          <CustomiseGame onCustomisation={customise} />
        </nav>
      </header>

      <main>
        {gameState}
        <a href="/instructions.html">Instructions</a>
      </main>
    </>
  );
}

function StateNotStarted({
  dimensions,
  numMines,
  toState
}: {
  dimensions: Dimensions;
  numMines: number;
  toState: ToState;
}) {
  return (
    <>
      <FieldView
        field={genEmptyField(dimensions)}
        onOpenCell={(cellPos) => {
          toState(
            <StatePlaying
              firstPosition={cellPos}
              dimensions={dimensions}
              numMines={numMines}
              toState={toState}
            />
          );
        }}
        onFlagCell={() => {
          /* no-op */
        }}
      />

      <Status>Waiting for first click</Status>
    </>
  );
}

function StatePlaying({
  firstPosition,
  dimensions,
  numMines,
  toState
}: {
  firstPosition: Position;
  dimensions: Dimensions;
  numMines: number;
  toState: ToState;
}) {
  const [field, setField] = useState(() => {
    const { field, mineOpened } = openCell(
      genField({ dimensions, numMines }, firstPosition, new Random()),
      firstPosition
    );

    if (mineOpened) {
      throw new Error("mine opened upon field generation!");
    }

    return field;
  });

  const { current: startTime } = useRef(performance.now());
  const [elapsedTimeMs, setElapsedTimeMs] = useState(0);
  useEffect(() => {
    const id = setInterval(() => {
      setElapsedTimeMs(performance.now() - startTime);
    }, 1000);

    return () => {
      clearInterval(id);
    };
  }, [startTime]);

  const onOpenCell = useCallback(
    (cellPos: Position) => {
      const { field: newField, mineOpened } = openCell(field, cellPos);

      if (mineOpened) {
        toState(
          <StateDead
            field={newField}
            elapsedTimeMs={performance.now() - startTime}
          />
        );
      } else if (isCompleted(newField)) {
        toState(
          <StateComplete
            field={newField}
            elapsedTimeMs={performance.now() - startTime}
          />
        );
      } else {
        setField(newField);
      }
    },
    [field, startTime, toState]
  );

  const onFlagCell = useCallback((flagPos: Position) => {
    setField((f) => toggleFlag(f, flagPos));
  }, []);

  return (
    <>
      <FieldView
        field={field}
        onOpenCell={onOpenCell}
        onFlagCell={onFlagCell}
      />

      <Status>
        {formatDuration(elapsedTimeMs)} – {field.numFlags} / {field.numMines}{" "}
        flagged
      </Status>
    </>
  );
}

function StateComplete({
  field,
  elapsedTimeMs
}: {
  field: Field;
  elapsedTimeMs: number;
}) {
  return (
    <>
      <FieldView
        field={field}
        onOpenCell={() => {
          /* no-op */
        }}
        onFlagCell={() => {
          /* no-op */
        }}
      />

      <Status>
        <strong>✅ COMPLETE</strong> in {formatDuration(elapsedTimeMs)} –{" "}
        {field.numFlags} / {field.numMines} flagged
      </Status>
    </>
  );
}

function StateDead({
  field,
  elapsedTimeMs
}: {
  field: Field;
  elapsedTimeMs: number;
}) {
  return (
    <>
      <FieldView
        field={field}
        onOpenCell={() => {
          /* no-op */
        }}
        onFlagCell={() => {
          /* no-op */
        }}
      />

      <Status>
        <strong>💀 DEAD</strong> in {formatDuration(elapsedTimeMs)} –{" "}
        {field.numFlags} / {field.numMines} flagged
      </Status>
    </>
  );
}

const FieldView = memo(
  ({
    field: {
      field,
      dimensions: { rows, columns }
    },
    onOpenCell,
    onFlagCell
  }: {
    field: Field;
    onOpenCell: (pos: Position) => void;
    onFlagCell: (pos: Position) => void;
  }) => (
    <div
      id="field"
      style={{
        ["--field-rows" as any]: String(rows),
        ["--field-cols" as any]: String(columns)
      }}
      onClick={(e) => {
        const target = e.target;
        if (!(target instanceof HTMLButtonElement)) {
          return;
        }

        e.preventDefault();
        onOpenCell({
          x: Number(target.dataset["posX"]),
          y: Number(target.dataset["posY"])
        });
      }}
      onContextMenu={(e) => {
        const target = e.target;
        if (!(target instanceof HTMLButtonElement)) {
          return;
        }

        e.preventDefault();
        onFlagCell({
          x: Number(target.dataset["posX"]),
          y: Number(target.dataset["posY"])
        });
      }}
    >
      {field.map((row, y) => (
        // eslint-disable-next-line react/no-array-index-key
        <div key={y}>
          {row.map((cell, x) => (
            // eslint-disable-next-line react/no-array-index-key
            <CellButton key={x} cell={cell} x={x} y={y} />
          ))}
        </div>
      ))}
    </div>
  )
);

type CellButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  "data-pos-x": number;
  "data-pos-y": number;
  "data-open": boolean;
  "data-adjacency"?: number;
  "data-flagged"?: boolean;
  "data-mine"?: boolean;
};

const CellButton = memo(
  ({ cell, x, y }: { cell: Cell; x: number; y: number }) => {
    const props: CellButtonProps = {
      type: "button",
      "data-pos-x": x,
      "data-pos-y": y,
      "data-open": cell.isOpen,
      children: "\u00A0" // non-breaking space
    };

    if (cell.isOpen) {
      if (cell.hasMine) {
        props["data-mine"] = true;
        props.children = "💣";
      } else {
        props["data-adjacency"] = cell.adjacentMines;

        if (cell.adjacentMines > 0) {
          props.children = cell.adjacentMines;
        }
      }
    } else if (cell.hasFlag) {
      props["data-flagged"] = true;
      props.children = "🚩";
    }

    // eslint-disable-next-line react/button-has-type
    return <button {...props} />;
  }
);

const Status = memo(({ children }: { children: ReactNode }) => (
  <output>
    <strong className="pill-blue">STATUS</strong>
    <span>{children}</span>
  </output>
));

function formatDuration(durationMs: number): string {
  const deltaMins = Math.floor(durationMs / 60_000);
  const deltaSecs = Math.floor((durationMs - deltaMins * 60_000) / 1000);

  return (
    deltaMins.toString().padStart(1, "0") +
    "m" +
    deltaSecs.toString().padStart(2, "0") +
    "s"
  );
}

function CustomiseGame({
  onCustomisation
}: {
  onCustomisation: (dimensions: Dimensions, numMines: number) => void;
}) {
  const [open, setOpen] = useState(false);

  const [rows, setRows] = useState("9");
  const [columns, setColumns] = useState("9");
  const [numMines, setNumMines] = useState("10");

  const onSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    let dimensions: Dimensions;
    let numMinesValidated: number;
    try {
      dimensions = {
        rows: validateRows(rows),
        columns: validateColumns(columns)
      };

      numMinesValidated = validateNumMines(
        numMines,
        dimensions.rows * dimensions.columns
      );
    } catch (error: unknown) {
      if (!(error instanceof Error)) {
        throw error;
      }

      // eslint-disable-next-line no-alert
      alert(`There was a problem: ${error.message}`);
      return;
    }

    setOpen(false);
    onCustomisation(dimensions, numMinesValidated);
  };

  return (
    <Popover.Root open={open} onOpenChange={setOpen}>
      <Popover.Trigger>Customise game</Popover.Trigger>
      <Popover.Content className="popover">
        <Popover.Arrow className="popover-arrow" />
        <div className="flex-0.25rem">
          <h2>Field settings</h2>
          <form noValidate onSubmit={onSubmit}>
            <div>
              <label htmlFor="rows">Rows</label>
              <input
                type="number"
                id="rows"
                className="width:6ch"
                value={rows}
                min={MIN_SIZE}
                max={MAX_SIZE}
                onChange={(e) => {
                  setRows(e.target.value);
                }}
              />
            </div>

            <div>
              <label htmlFor="columns">Columns</label>
              <input
                type="number"
                id="columns"
                className="width:6ch"
                value={columns}
                min={MIN_SIZE}
                max={MAX_SIZE}
                onChange={(e) => {
                  setColumns(e.target.value);
                }}
              />
            </div>

            <div>
              <label htmlFor="mines">Mines</label>
              <input
                type="number"
                id="mines"
                className="width:6ch"
                value={numMines}
                min={MIN_MINES}
                max={MAX_MINES}
                onChange={(e) => {
                  setNumMines(e.target.value);
                }}
              />
            </div>

            <div className="margin-top:0.5rem">
              <button type="submit" className="button-light">
                Apply and restart
              </button>
            </div>
          </form>
        </div>
      </Popover.Content>
    </Popover.Root>
  );
}

function validateRows(rows: string): number {
  if (!/^\d+$/.test(rows)) {
    throw new Error("Enter a number for the amount of rows");
  }

  const result = Number(rows);

  if (result < MIN_SIZE || MAX_SIZE < result) {
    throw new Error(
      `Enter a number between ${MIN_SIZE} and ${MAX_SIZE} for the amount of rows`
    );
  }

  return result;
}

function validateColumns(columns: string): number {
  if (!/^\d+$/.test(columns)) {
    throw new Error("Enter a number for the amount of columns");
  }

  const result = Number(columns);

  if (result < MIN_SIZE || MAX_SIZE < result) {
    throw new Error(
      `Enter a number between ${MIN_SIZE} and ${MAX_SIZE} for the amount of columns`
    );
  }

  return result;
}

function validateNumMines(numMines: string, numCells: number): number {
  if (!/^\d+$/.test(numMines)) {
    throw new Error("Enter a number for the amount of mines");
  }

  const result = Number(numMines);

  if (result < MIN_MINES || numCells - MIN_SAFE_CELLS < result) {
    throw new Error(
      `Enter a number between ${MIN_MINES} and ${
        numCells - MIN_SAFE_CELLS
      } for the amount of mines`
    );
  }

  return result;
}
