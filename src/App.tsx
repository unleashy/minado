import { useCallback, useEffect, useState } from "react";
import { Random } from "./random";
import { type Position } from "./measures";
import { type Field, genEmptyField, genField, openCell } from "./field";

export function App() {
  const [hasStarted, timeElapsed, startTimer] = useTimer();
  const [field, setField] = useState(() =>
    genEmptyField({ rows: 5, columns: 5 })
  );
  const onCellClick = useCallback(
    (cellPos: Position) => {
      if (hasStarted) {
        setField(openCell(field, cellPos));
      } else {
        startTimer();
        setField(
          openCell(
            genField(
              { dimensions: field.dimensions, numMines: 5 },
              cellPos,
              new Random()
            ),
            cellPos
          )
        );
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
              ? `${formatDuration(timeElapsed)} – 0 / ${field.numMines} flagged`
              : "Waiting for first click"}
          </span>
        </output>

        <a href="/instructions.html">Instructions</a>
      </main>
    </>
  );
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
          {row.map(({ isOpen, hasMine }, x) => (
            <button
              // eslint-disable-next-line react/no-array-index-key
              key={y * rows + x}
              type="button"
              data-pos-x={x}
              data-pos-y={y}
              data-open={isOpen}
            >
              {hasMine ? "M" : "\u00A0"}
            </button>
          ))}
        </div>
      ))}
    </div>
  );
}
