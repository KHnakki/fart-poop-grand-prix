import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Podium from "@/components/Podium";
import AddPlayer from "@/components/AddPlayer";
import PlayerCard from "@/components/PlayerCard";
import { Button } from "@/components/ui/button";

interface Player {
  id: string;
  name: string;
  farts: number;
  poops: number;
}

const GP_POINTS = [10, 5, 3, 1];
const POOP_BONUS = 3;

const calcPoints = (players: Player[]) => {
  const sorted = [...players].sort((a, b) => {
    const totalB = b.farts + b.poops;
    const totalA = a.farts + a.poops;
    return totalB - totalA;
  });

  return players.map((p) => {
    const rank = sorted.findIndex((s) => s.id === p.id);
    const gpPts = GP_POINTS[rank] ?? 0;
    const poopBonus = p.poops * POOP_BONUS;
    return { ...p, points: gpPts + poopBonus, rank: rank + 1 };
  });
};

const Index = () => {
  const [players, setPlayers] = useState<Player[]>([]);

  const addPlayer = (name: string) => {
    setPlayers((prev) => [
      ...prev,
      { id: crypto.randomUUID(), name, farts: 0, poops: 0 },
    ]);
  };

  const logFart = (id: string) => {
    setPlayers((prev) =>
      prev.map((p) => (p.id === id ? { ...p, farts: p.farts + 1 } : p))
    );
  };

  const logPoop = (id: string) => {
    setPlayers((prev) =>
      prev.map((p) => (p.id === id ? { ...p, poops: p.poops + 1 } : p))
    );
  };

  const resetGame = () => setPlayers((prev) => prev.map((p) => ({ ...p, farts: 0, poops: 0 })));

  const ranked = calcPoints(players).sort((a, b) => a.rank - b.rank);

  return (
    <div className="min-h-screen bg-background pb-12">
      <header className="text-center pt-8 pb-4 px-4">
        <motion.h1
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="text-4xl md:text-5xl font-bold tracking-tight"
        >
          💨 Fart Grand Prix 🏆
        </motion.h1>
        <p className="text-muted-foreground mt-2 text-lg">
          Log farts & poops. Best farter wins the podium!
        </p>
        <p className="text-sm text-muted-foreground mt-1">
          🏁 GP Points: 1st=10, 2nd=5, 3rd=3, 4th=1 &nbsp;|&nbsp; 💩 Poop bonus: +{POOP_BONUS} pts each
        </p>
      </header>

      <div className="max-w-md mx-auto px-4">
        <Podium players={ranked.map((p) => ({ name: p.name, points: p.points }))} />

        <div className="mt-6 space-y-4">
          <AddPlayer onAdd={addPlayer} />

          <AnimatePresence>
            {ranked.map((p) => (
              <PlayerCard
                key={p.id}
                name={p.name}
                farts={p.farts}
                poops={p.poops}
                points={p.points}
                rank={p.rank}
                onFart={() => logFart(p.id)}
                onPoop={() => logPoop(p.id)}
              />
            ))}
          </AnimatePresence>

          {players.length > 0 && (
            <Button variant="ghost" className="w-full text-muted-foreground" onClick={resetGame}>
              🔄 Reset Scores
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default Index;
