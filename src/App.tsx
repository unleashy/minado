import {
  type ButtonHTMLAttributes,
  memo,
  type MouseEvent,
  type ReactNode,
  useCallback,
  useEffect,
  useRef,
  useState
} from "react";
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

/*
Game states:
  1 NOT_STARTED
    Field: empty dummy
    Timer: not present
    Flag/mine count: not present
    ∴ Status: “Waiting for first click”

  2 PLAYING
    Field: generated
    Timer: present, running
    Flag/mine count: present
    ∴ Status: “{timer} - {flags} / {mines} flagged”

  3 COMPLETED
    Field: generated, disabled
    Timer: present, stopped
    Flag/mine count: present
    ∴ Status: “COMPLETED in {timer} - {flags} / {mines} flagged”

  4 DEAD
    Field: generated, disabled
    Timer: present, stopped
    Flag/mine count: present
    ∴ Status: “DEAD in {timer} - {flags} / {mines} flagged”
*/

type ToState = (element: JSX.Element) => void;

export function App() {
  const [gameState, setGameState] = useState<JSX.Element | undefined>();
  if (gameState === undefined) {
    setGameState(<StateNotStarted toState={setGameState} />);
  }

  const newGame = (e: MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    setGameState(<StateNotStarted toState={setGameState} />);
  };

  return (
    <>
      <header>
        <h1>Minado</h1>
        <nav>
          <button type="button" onClick={newGame}>
            New game
          </button>
          <button type="button">Customise game</button>
        </nav>
      </header>

      <main>
        {gameState}
        <a href="/instructions.html">Instructions</a>
      </main>
    </>
  );
}

function StateNotStarted({ toState }: { toState: ToState }) {
  const field = genEmptyField({ rows: 9, columns: 9 });

  return (
    <FieldAndStatus
      status="Waiting for first click"
      field={field}
      onOpenCell={(cellPos) => {
        toState(
          <StatePlaying
            firstPosition={cellPos}
            dimensions={field.dimensions}
            numMines={10}
            toState={toState}
          />
        );
      }}
      onFlagCell={() => {
        /* no-op */
      }}
    />
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
  const [field, setField] = useState(() =>
    openCell(
      genField({ dimensions, numMines }, firstPosition, new Random()),
      firstPosition
    )
  );

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
      const newField = openCell(field, cellPos);
      if (isCompleted(newField)) {
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
    <FieldAndStatus
      status={
        `${formatDuration(elapsedTimeMs)} – ` +
        `${field.numFlags} / ${field.numMines} flagged`
      }
      field={field}
      onOpenCell={onOpenCell}
      onFlagCell={onFlagCell}
    />
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
    <FieldAndStatus
      status={
        <>
          <strong>✅ COMPLETE</strong> in {formatDuration(elapsedTimeMs)} –{" "}
          {field.numFlags} / {field.numMines} flagged
        </>
      }
      field={field}
      onOpenCell={() => {
        /* no-op */
      }}
      onFlagCell={() => {
        /* no-op */
      }}
    />
  );
}

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

type FieldViewProps = {
  field: Field;
  onOpenCell: (pos: Position) => void;
  onFlagCell: (pos: Position) => void;
};

function FieldAndStatus({
  status,
  field,
  onOpenCell,
  onFlagCell
}: FieldViewProps & { status: ReactNode }) {
  return (
    <>
      <FieldView
        field={field}
        onOpenCell={onOpenCell}
        onFlagCell={onFlagCell}
      />

      <output>
        <strong className="pill-blue">STATUS</strong>
        <span>{status}</span>
      </output>
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
  }: FieldViewProps) => (
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
