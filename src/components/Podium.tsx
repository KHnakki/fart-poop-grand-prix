import { motion } from "framer-motion";

interface Player {
  nickname: string;
  totalPoints: number;
}

const Podium = ({ players }: { players: Player[] }) => {
  const top3 = players.slice(0, 3);
  if (top3.length === 0) return null;

  const podiumOrder = [
    { idx: 1, height: "h-20", emoji: "🥈" },
    { idx: 0, height: "h-32", emoji: "🥇" },
    { idx: 2, height: "h-14", emoji: "🥉" },
  ];

  return (
    <div className="flex items-end justify-center gap-2 my-6">
      {podiumOrder.map(({ idx, height, emoji }) => {
        const p = top3[idx];
        if (!p) return <div key={idx} className="w-24" />;
        return (
          <motion.div
            key={idx}
            initial={{ y: 40, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: idx * 0.15, type: "spring" }}
            className="flex flex-col items-center"
          >
            <span className="text-2xl">{emoji}</span>
            <span className="font-bold text-sm truncate max-w-[5rem]">{p.nickname}</span>
            <span className="text-xs text-muted-foreground">{p.totalPoints} pts</span>
            <div className={`${height} w-24 bg-accent rounded-t-lg mt-1 flex items-center justify-center`}>
              <span className="text-xl font-bold text-muted-foreground">P{idx + 1}</span>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
};

export default Podium;
