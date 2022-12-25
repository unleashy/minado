import { useEffect, useState } from "react";
import { type Cell } from "./cell";
import { type Position } from "./position";

export function App() {
  const [startTime, timeElapsed, startTimer] = useTimer();

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
        <Field
          rows={5}
          columns={5}
          onClick={() => {
            startTimer();
          }}
        />

        <output>
          <strong className="pill-blue">STATUS</strong>
          <span>
            {startTime === undefined
              ? "Waiting for first click"
              : `${formatDuration(timeElapsed)} – 0 / 0 flagged`}
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
  const startTimer = () => {
    if (startTime === undefined) {
      setStartTime(performance.now());
    }
  };

  const [timeElapsed, setTimeElapsed] = useState(0);
  useEffect(() => {
    if (startTime === undefined) {
      setTimeElapsed(0);
      return;
    }

    const id = setInterval(() => {
      if (startTime === undefined) return;
      setTimeElapsed(performance.now() - startTime);
    }, 1000);
    return () => {
      clearInterval(id);
    };
  }, [startTime]);

  return [startTime, timeElapsed, startTimer] as const;
}

function Field({
  rows,
  columns,
  onClick
}: {
  rows: number;
  columns: number;
  onClick: (pos: Position) => void;
}) {
  const [field, setField] = useState<Cell[][]>(() => genField(rows, columns));
  useEffect(() => {
    setField(genField(rows, columns));
  }, [rows, columns]);

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

        const pos: Position = {
          x: Number(target.dataset["posX"]),
          y: Number(target.dataset["posY"])
        };

        onClick(pos);
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

function genField(rows: number, columns: number): Cell[][] {
  return Array.from({ length: rows }).map(() =>
    Array.from({ length: columns }).map(() => ({
      isOpen: false,
      hasMine: false,
      hasFlag: false
    }))
  );
}
