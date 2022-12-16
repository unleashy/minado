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
          {game.cellsByRow.map((row, i) => (
            // eslint-disable-next-line react/no-array-index-key
            <div key={i}>
              {row.map(({ pos }) => (
                <button
                  key={pos.x}
                  type="button"
                  data-pos-x={pos.x}
                  data-pos-y={pos.y}
                >
                  &nbsp;
                </button>
              ))}
            </div>
          ))}
        </div>

        <output>
          <strong className="pill-blue">STATUS</strong>
          <span>
            {startTime === undefined
              ? "Waiting for first click"
              : `${formatDuration(timeElapsed)} – 0 / ${game.numMines} flagged`}
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
