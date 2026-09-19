import { useEffect, useMemo, useState } from "react";
import "./projection.css";
import { DateDuJour } from "./DateDuJour";
import { Minuteur } from "./Minuteur";
import { listCreneauxDuJour } from "@/db/repositories/creneaux";
import { listRituelsDuJour } from "@/db/repositories/rituels";
import { listDevoirsDonnesLe } from "@/db/repositories/devoirs";
import { creneauxParGroupe } from "@/stores/useCahierJournal";
import type { CreneauAvecSeance, Devoir, Niveau, Rituel } from "@/types/models";

interface TableauCursifProjectionProps {
  date: string;
  onFermer: () => void;
}

function heureActuelle(): string {
  const now = new Date();
  return `${now.getHours().toString().padStart(2, "0")}:${now.getMinutes().toString().padStart(2, "0")}`;
}

function trouverCreneauActuel(
  creneaux: CreneauAvecSeance[],
  heure: string,
): CreneauAvecSeance | undefined {
  return creneaux.find((c) => c.heureDebut <= heure && heure < c.heureFin);
}

function trouverProchainCreneau(
  creneaux: CreneauAvecSeance[],
  heure: string,
): CreneauAvecSeance | undefined {
  return creneaux
    .filter((c) => c.heureDebut > heure)
    .sort((a, b) => a.heureDebut.localeCompare(b.heureDebut))[0];
}

function ColonneProjection({
  niveau,
  couleur,
  creneauxNiveau,
  heure,
  tailleRem,
}: {
  niveau: Niveau;
  couleur: string;
  creneauxNiveau: CreneauAvecSeance[];
  heure: string;
  tailleRem: number;
}) {
  const dirige = creneauxParGroupe(creneauxNiveau, [`${niveau}_DIRIGE`]);
  const autonome = creneauxParGroupe(creneauxNiveau, [`${niveau}_AUTONOME`]);

  const actuelDirige = trouverCreneauActuel(dirige, heure);
  const actuelAutonome = trouverCreneauActuel(autonome, heure);
  const prochainDirige = !actuelDirige ? trouverProchainCreneau(dirige, heure) : undefined;
  const prochainAutonome = !actuelAutonome ? trouverProchainCreneau(autonome, heure) : undefined;

  return (
    <div className="flex-1 min-w-0 rounded-xl bg-white/5 p-5 flex flex-col gap-4">
      <h2 className="text-2xl font-bold" style={{ color: couleur }}>
        {niveau === "GS" ? "Grande Section" : "CE2"}
      </h2>

      <BlocConsigne
        label="Travail guidé"
        creneau={actuelDirige}
        prochain={prochainDirige}
        tailleRem={tailleRem}
      />
      <BlocConsigne
        label="En autonomie"
        creneau={actuelAutonome}
        prochain={prochainAutonome}
        tailleRem={tailleRem}
      />
    </div>
  );
}

function BlocConsigne({
  label,
  creneau,
  prochain,
  tailleRem,
}: {
  label: string;
  creneau?: CreneauAvecSeance;
  prochain?: CreneauAvecSeance;
  tailleRem: number;
}) {
  return (
    <div className="rounded-lg bg-black/20 p-4 flex-1">
      <p className="text-xs uppercase tracking-wide text-white/50 mb-1">{label}</p>
      {creneau ? (
        <>
          <p className="texte-cursif text-white" style={{ fontSize: `${tailleRem}rem` }}>
            {creneau.seance?.titre ?? creneau.titreLibre}
          </p>
          {creneau.seance?.deroulement?.[0]?.consigne && (
            <p className="texte-cursif text-white/80 mt-2" style={{ fontSize: `${tailleRem * 0.55}rem` }}>
              {creneau.seance.deroulement[0].consigne}
            </p>
          )}
        </>
      ) : prochain ? (
        <p className="text-white/40 text-sm">
          Prochain : {prochain.heureDebut} — {prochain.seance?.titre ?? prochain.titreLibre}
        </p>
      ) : (
        <p className="text-white/30 text-sm">Rien de prévu</p>
      )}
    </div>
  );
}

export function TableauCursifProjection({ date, onFermer }: TableauCursifProjectionProps) {
  const [creneaux, setCreneaux] = useState<CreneauAvecSeance[]>([]);
  const [rituels, setRituels] = useState<Rituel[]>([]);
  const [devoirs, setDevoirs] = useState<Devoir[]>([]);
  const [heure, setHeure] = useState(heureActuelle());
  const [tailleRem, setTailleRem] = useState(3.5);

  useEffect(() => {
    void listCreneauxDuJour(date).then(setCreneaux);
    void listRituelsDuJour(date).then(setRituels);
    void listDevoirsDonnesLe(date).then(setDevoirs);
  }, [date]);

  useEffect(() => {
    const id = setInterval(() => setHeure(heureActuelle()), 15_000);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    void document.documentElement.requestFullscreen?.().catch(() => {
      /* plein écran refusé par l'OS/navigateur : on continue en fenêtré */
    });
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") onFermer();
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      if (document.fullscreenElement) void document.exitFullscreen().catch(() => {});
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const communs = useMemo(() => creneauxParGroupe(creneaux, ["COMMUN"]), [creneaux]);
  const rituelsTextes = rituels
    .filter((r) => typeof r.contenu.texte === "string" && r.contenu.texte)
    .map((r) => r.contenu.texte as string);

  return (
    <div className="mode-classe fixed inset-0 z-50 bg-slate-900 text-white overflow-auto">
      <div className="min-h-screen flex flex-col p-6 gap-5">
        <header className="flex items-start justify-between gap-4">
          <DateDuJour date={date} tailleRem={tailleRem * 0.7} />
          <div className="flex items-center gap-3">
            <label className="flex items-center gap-2 text-sm text-white/60">
              Taille du texte
              <input
                type="range"
                min={2}
                max={6}
                step={0.25}
                value={tailleRem}
                onChange={(e) => setTailleRem(Number(e.target.value))}
              />
            </label>
            <button
              type="button"
              onClick={onFermer}
              className="px-4 py-2 rounded-md bg-white/10 hover:bg-white/20 text-sm"
            >
              ✕ Fermer (Échap)
            </button>
          </div>
        </header>

        {rituelsTextes.length > 0 && (
          <div className="texte-cursif flex flex-wrap gap-x-8 gap-y-1 text-white/90" style={{ fontSize: `${tailleRem * 0.5}rem` }}>
            {rituelsTextes.map((t, i) => (
              <span key={i}>{t}</span>
            ))}
          </div>
        )}

        {communs.length > 0 && (
          <div className="rounded-xl bg-white/5 p-4">
            {communs.map((c) => (
              <p key={c.id} className="texte-cursif" style={{ fontSize: `${tailleRem * 0.6}rem` }}>
                {c.heureDebut} — {c.seance?.titre ?? c.titreLibre}
              </p>
            ))}
          </div>
        )}

        <div className="flex flex-col lg:flex-row gap-5 flex-1">
          <ColonneProjection
            niveau="GS"
            couleur="#fb923c"
            creneauxNiveau={creneaux}
            heure={heure}
            tailleRem={tailleRem}
          />
          <ColonneProjection
            niveau="CE2"
            couleur="#60a5fa"
            creneauxNiveau={creneaux}
            heure={heure}
            tailleRem={tailleRem}
          />
        </div>

        {devoirs.length > 0 && (
          <div className="rounded-xl bg-white/5 p-4">
            <p className="text-xs uppercase tracking-wide text-white/50 mb-2">Devoirs du jour (CE2)</p>
            <ul className="texte-cursif space-y-1" style={{ fontSize: `${tailleRem * 0.5}rem` }}>
              {devoirs.map((d) => (
                <li key={d.id}>
                  {d.discipline} — {d.consigne}
                </li>
              ))}
            </ul>
          </div>
        )}

        <footer className="flex justify-center pt-2">
          <Minuteur tailleClasseName="text-5xl" />
        </footer>
      </div>
    </div>
  );
}
