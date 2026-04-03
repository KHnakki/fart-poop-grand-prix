import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";

interface Props {
  name: string;
  farts: number;
  poops: number;
  points: number;
  rank: number;
  onFart: () => void;
  onPoop: () => void;
}

const gpPoints = [10, 5, 3, 1];

const PlayerCard = ({ name, farts, poops, points, rank, onFart, onPoop }: Props) => {
  return (
    <motion.div
      layout
      className="bg-card rounded-xl p-4 border border-border flex items-center gap-3"
    >
      <div className="text-2xl font-bold text-muted-foreground w-8 text-center">
        #{rank}
      </div>
      <div className="flex-1 min-w-0">
        <h3 className="font-bold text-lg truncate">{name}</h3>
        <div className="flex gap-3 text-sm text-muted-foreground">
          <span>💨 {farts}</span>
          <span>💩 {poops}</span>
          <span className="font-semibold text-accent-foreground">{points} pts</span>
        </div>
      </div>
      <div className="flex gap-2">
        <Button
          size="lg"
          variant="outline"
          onClick={onFart}
          className="text-2xl h-12 w-12 p-0"
        >
          💨
        </Button>
        <Button
          size="lg"
          variant="outline"
          onClick={onPoop}
          className="text-2xl h-12 w-12 p-0 border-poop/30 hover:bg-poop/10"
        >
          💩
        </Button>
      </div>
    </motion.div>
  );
};

export default PlayerCard;
