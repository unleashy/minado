import { type MouseEvent, useEffect, useState } from "react";
import { type Game } from "./game";

export function App({ game }: { game: Game }) {
  const [startTime, setStartTime] = useState<number | undefined>();

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

  const onFieldClick = (e: MouseEvent) => {
    const target = e.target;
    if (!(target instanceof HTMLButtonElement)) {
      return;
    }

    e.preventDefault();

    game.openCell({
      x: Number(target.dataset["posX"]),
      y: Number(target.dataset["posY"])
    });
    setStartTime(performance.now());
  };

  let status;
  if (startTime === undefined) {
    status = "Waiting for first click";
  } else {
    status = `${formatDuration(timeElapsed)} – 0 / ${game.numMines} flagged`;
  }

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
        <div
          id="field"
          style={{
            ["--field-rows" as any]: String(game.rows),
            ["--field-cols" as any]: String(game.columns)
          }}
          onClick={onFieldClick}
        >
          {...generateField(game.rows, game.columns)}
        </div>

        <output>
          <strong className="pill-blue">STATUS</strong>
          <span>{status}</span>
        </output>

        <a href="/instructions.html">Instructions</a>
      </main>
    </>
  );
}

function generateField(rows: number, columns: number): JSX.Element[] {
  const result = [];

  for (let y = 0; y < rows; ++y) {
    const row = [];

    for (let x = 0; x < columns; ++x) {
      row.push(
        <button key={x} type="button" data-pos-x={x} data-pos-y={y}>
          &nbsp;
        </button>
      );
    }

    result.push(<div key={y}>{row}</div>);
  }

  return result;
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
