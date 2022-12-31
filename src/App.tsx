import {
  type ButtonHTMLAttributes,
  type MouseEvent,
  useCallback,
  useEffect,
  useState
} from "react";
import { Random } from "./random";
import { type Position } from "./measures";
import { type Cell } from "./cell";
import {
  type Field,
  toggleFlag,
  genEmptyField,
  genField,
  openCell
} from "./field";

export function App() {
  const [hasStarted, timeElapsedMs, startTimer, resetTimer] = useTimer();
  const [field, setField] = useState(() =>
    genEmptyField({ rows: 9, columns: 9 })
  );

  const newGame = (e: MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();

    setField(genEmptyField({ rows: 9, columns: 9 }));
    resetTimer();
  };

  const onOpenCell = useCallback(
    (cellPos: Position) => {
      if (!hasStarted) {
        startTimer();
        setField((f) =>
          genField(
            { dimensions: f.dimensions, numMines: 10 },
            cellPos,
            new Random()
          )
        );
      }

      setField((f) => openCell(f, cellPos));
    },
    [hasStarted, startTimer]
  );

  const onFlagCell = useCallback(
    (cellPos: Position) => {
      if (hasStarted) {
        setField((f) => toggleFlag(f, cellPos));
      }
    },
    [hasStarted]
  );

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
        <FieldView
          field={field}
          onOpenCell={onOpenCell}
          onFlagCell={onFlagCell}
        />

        <output>
          <strong className="pill-blue">STATUS</strong>
          <span>
            {hasStarted
              ? `${formatDuration(timeElapsedMs)} – ` +
                `${field.numFlags} / ${field.numMines} flagged`
              : "Waiting for first click"}
          </span>
        </output>

        <a href="/instructions.html">Instructions</a>
      </main>
    </>
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

function useTimer() {
  const [startTime, setStartTime] = useState<number | undefined>();
  const [timeElapsed, setTimeElapsed] = useState(0);
  useEffect(() => {
    if (startTime === undefined) {
      setTimeElapsed(0);
      return;
    }

    const id = setInterval(() => {
      setTimeElapsed(performance.now() - startTime);
    }, 1000);

    return () => {
      clearInterval(id);
    };
  }, [startTime]);

  return [
    startTime !== undefined,
    timeElapsed,
    useCallback(() => {
      setStartTime(performance.now());
    }, []),
    useCallback(() => {
      // eslint-disable-next-line unicorn/no-useless-undefined
      setStartTime(undefined);
    }, [])
  ] as const;
}

function FieldView({
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
}) {
  return (
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
            <CellButton key={y * rows + x} cell={cell} x={x} y={y} />
          ))}
        </div>
      ))}
    </div>
  );
}

type CellButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  "data-pos-x": number;
  "data-pos-y": number;
  "data-open": boolean;
  "data-adjacency"?: number;
  "data-flagged"?: boolean;
};

function CellButton({ cell, x, y }: { cell: Cell; x: number; y: number }) {
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
