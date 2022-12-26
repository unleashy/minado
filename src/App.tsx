import { useCallback, useEffect, useState } from "react";
import produce, { type Draft } from "immer";
import { type Cell, type Dimensions, type Position } from "./cell";

type Field = {
  field: Cell[][];
  dimensions: Dimensions;
};

export function App() {
  const [hasStarted, timeElapsed, startTimer] = useTimer();
  const [field, setField] = useState(() =>
    genEmptyField({ rows: 5, columns: 5 })
  );
  const onCellClick = useCallback(
    (pos: Position) => {
      if (hasStarted) {
        setField(openCell(field, pos));
      } else {
        startTimer();
        setField(genField(field.dimensions, pos));
      }
    },
    // "startTimer" has a stable identity.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [hasStarted, field]
  );

  return (
    <>
      <header>
        <h1>Minado</h1>
        <nav>
          <button type="button">New game</button>
          <button type="button">Customise game</button>
        </nav>
      </header>

      <main>
        <FieldView field={field} onClick={onCellClick} />

        <output>
          <strong className="pill-blue">STATUS</strong>
          <span>
            {hasStarted
              ? `${formatDuration(timeElapsed)} – 0 / 0 flagged`
              : "Waiting for first click"}
          </span>
        </output>

        <a href="/instructions.html">Instructions</a>
      </main>
    </>
  );
}

function genEmptyField(dimensions: Dimensions): Field {
  return {
    field: Array.from({ length: dimensions.rows }).map(() =>
      Array.from({ length: dimensions.columns }).map(() => ({
        isOpen: false,
        hasMine: false,
        hasFlag: false
      }))
    ),
    dimensions
  };
}

const openCell = produce(({ field }: Draft<Field>, pos: Position) => {
  field[pos.y][pos.x].isOpen = true;
});

function genField(dimensions: Dimensions, initialOpenCell: Position): Field {
  return openCell(genEmptyField(dimensions), initialOpenCell);
}

function formatDuration(duration: number): string {
  const deltaMins = Math.floor(duration / 60_000);
  const deltaSecs = Math.floor((duration - deltaMins * 60_000) / 1000);

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
    const id = setInterval(() => {
      if (startTime === undefined) return;
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
    }, [])
  ] as const;
}

function FieldView({
  field: {
    field,
    dimensions: { rows, columns }
  },
  onClick
}: {
  field: Field;
  onClick: (pos: Position) => void;
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
        onClick({
          x: Number(target.dataset["posX"]),
          y: Number(target.dataset["posY"])
        });
      }}
    >
      {field.map((row, y) => (
        // eslint-disable-next-line react/no-array-index-key
        <div key={y}>
          {row.map(({ isOpen }, x) => (
            <button
              // eslint-disable-next-line react/no-array-index-key
              key={y * rows + x}
              type="button"
              data-pos-x={x}
              data-pos-y={y}
              data-open={isOpen}
            >
              &nbsp;
            </button>
          ))}
        </div>
      ))}
    </div>
  );
}
