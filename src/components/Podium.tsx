import { motion } from "framer-motion";

interface Player {
  name: string;
  points: number;
}

const Podium = ({ players }: { players: Player[] }) => {
  const sorted = [...players].sort((a, b) => b.points - a.points).slice(0, 3);
  if (sorted.length === 0) return null;

  const podiumConfig = [
    { place: 2, height: "h-24", emoji: "🥈", color: "bg-silver", index: 1 },
    { place: 1, height: "h-36", emoji: "🥇", color: "bg-gold", index: 0 },
    { place: 3, height: "h-16", emoji: "🥉", color: "bg-bronze", index: 2 },
  ];

  return (
    <div className="flex items-end justify-center gap-2 mt-8 mb-4">
      {podiumConfig.map(({ place, height, emoji, color, index }) => {
        const player = sorted[index];
        if (!player) return <div key={place} className="w-24" />;
        return (
          <motion.div
            key={place}
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: index * 0.2, type: "spring" }}
            className="flex flex-col items-center"
          >
            <span className="text-3xl mb-1">{emoji}</span>
            <span className="font-bold text-sm truncate max-w-[5rem]">{player.name}</span>
            <span className="text-xs text-muted-foreground">{player.points} pts</span>
            <div className={`${height} w-24 ${color} rounded-t-lg mt-1 flex items-center justify-center`}>
              <span className="text-2xl font-bold text-foreground/70">P{place}</span>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
};

export default Podium;
