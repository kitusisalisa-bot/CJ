import { format } from "date-fns";
import { fr } from "date-fns/locale";

interface DateDuJourProps {
  date: string;
  tailleRem: number;
}

export function DateDuJour({ date, tailleRem }: DateDuJourProps) {
  const texte = format(new Date(`${date}T00:00:00`), "EEEE d MMMM yyyy", { locale: fr });
  return (
    <p
      className="texte-cursif text-white capitalize"
      style={{ fontSize: `${tailleRem}rem` }}
    >
      {texte}
    </p>
  );
}
