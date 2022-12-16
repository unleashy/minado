import { type MouseEvent, useEffect, useState } from "react";
import { type Game } from "./game";

export function App({ game }: { game: Game }) {
  const [status, setStatus] = useState("Loading...");
  useEffect(() => {
    setStatus("Waiting for first click");
  }, []);

  const [startTime, setStartTime] = useState<DOMHighResTimeStamp | undefined>();
  useEffect(() => {
    if (startTime === undefined) return;

    const updateTimer = () => {
      const deltaTime = performance.now() - startTime;
      const deltaMins = Math.floor(deltaTime / 60_000);
      const deltaSecs = Math.floor((deltaTime - deltaMins * 60_000) / 1000);

      const time =
        deltaMins.toString().padStart(1, "0") +
        "m" +
        deltaSecs.toString().padStart(2, "0") +
        "s";

      setStatus(`${time} – 0 / ${game.numMines} mines flagged`);
    };

    updateTimer();
    const id = setInterval(updateTimer, 1000);
    return () => {
      clearInterval(id);
    };
  }, [startTime, game.numMines]);

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
          <span id="status-line">{status}</span>
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
