import { useEffect, useRef, useState } from "react";

function formatDuree(secondes: number): string {
  const m = Math.floor(Math.abs(secondes) / 60);
  const s = Math.abs(secondes) % 60;
  return `${secondes < 0 ? "-" : ""}${m}:${s.toString().padStart(2, "0")}`;
}

interface MinuteurProps {
  tailleClasseName?: string;
}

export function Minuteur({ tailleClasseName = "text-6xl" }: MinuteurProps) {
  const [dureeInitiale, setDureeInitiale] = useState(5 * 60);
  const [secondesRestantes, setSecondesRestantes] = useState(5 * 60);
  const [enMarche, setEnMarche] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (enMarche) {
      intervalRef.current = setInterval(() => {
        setSecondesRestantes((s) => s - 1);
      }, 1000);
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [enMarche]);

  const termine = secondesRestantes <= 0;

  return (
    <div className="flex flex-col items-center gap-2">
      <div
        className={`font-sans font-bold tabular-nums ${tailleClasseName} ${
          termine && enMarche ? "text-red-500 animate-pulse" : "text-slate-100"
        }`}
      >
        {formatDuree(secondesRestantes)}
      </div>
      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => setEnMarche((v) => !v)}
          className="px-3 py-1.5 rounded-md bg-white/10 hover:bg-white/20 text-white text-sm"
        >
          {enMarche ? "Pause" : "Démarrer"}
        </button>
        <button
          type="button"
          onClick={() => {
            setEnMarche(false);
            setSecondesRestantes(dureeInitiale);
          }}
          className="px-3 py-1.5 rounded-md bg-white/10 hover:bg-white/20 text-white text-sm"
        >
          Réinitialiser
        </button>
        {[1, 3, 5, 10, 15].map((min) => (
          <button
            key={min}
            type="button"
            onClick={() => {
              setEnMarche(false);
              setDureeInitiale(min * 60);
              setSecondesRestantes(min * 60);
            }}
            className="px-2 py-1.5 rounded-md bg-white/5 hover:bg-white/20 text-white text-xs"
          >
            {min}min
          </button>
        ))}
      </div>
    </div>
  );
}
