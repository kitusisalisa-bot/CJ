import { useState } from "react";
import { CahierJournalDoubleNiveau } from "@/components/cahier-journal/CahierJournalDoubleNiveau";
import { TableauCursifProjection } from "@/components/projection/TableauCursifProjection";

export default function App() {
  const [modeClasseDate, setModeClasseDate] = useState<string | null>(null);

  if (modeClasseDate) {
    return (
      <TableauCursifProjection date={modeClasseDate} onFermer={() => setModeClasseDate(null)} />
    );
  }

  return <CahierJournalDoubleNiveau onOuvrirModeClasse={setModeClasseDate} />;
}
