import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import Podium from "@/components/Podium";
import {
  getGameByCode, getPlayers, getEventLogs, logEvent,
  getCurrentRound, isGameOver, getLocalPlayer, calculateScores, joinGame,
} from "@/lib/gameService";

const GamePage = () => {
  const { code } = useParams<{ code: string }>();
  const navigate = useNavigate();
  const [game, setGame] = useState<any>(null);
  const [scores, setScores] = useState<any[]>([]);
  const [localPlayer, setLocalPlayer] = useState<{ id: string; nickname: string } | null>(null);
  const [currentRound, setCurrentRound] = useState(1);
  const [gameOver, setGameOver] = useState(false);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    if (!code) return;
    try {
      const g = await getGameByCode(code);
      if (!g) { toast.error("Game not found"); navigate("/"); return; }
      setGame(g);
      setCurrentRound(getCurrentRound(g));
      setGameOver(isGameOver(g));

      const lp = getLocalPlayer(g.id);
      setLocalPlayer(lp);

      const [players, events] = await Promise.all([getPlayers(g.id), getEventLogs(g.id)]);
      const scored = calculateScores(players, events, g.total_rounds);
      setScores(scored);
    } catch (e: any) {
      toast.error("Failed to load game");
    }
    setLoading(false);
  };

  useEffect(() => { loadData(); }, [code]);

  // Auto-refresh every 10s
  useEffect(() => {
    const interval = setInterval(loadData, 10000);
    return () => clearInterval(interval);
  }, [code]);

  const handleLog = async (type: "fart" | "poop") => {
    if (!game || !localPlayer) return;
    try {
      await logEvent(game.id, localPlayer.id, type, currentRound);
      toast.success(type === "fart" ? "💨 +1 point!" : "💩 +3 points!");
      loadData();
    } catch (e: any) {
      toast.error("Failed to log event");
    }
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center text-muted-foreground">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-background pb-12">
      <header className="text-center pt-6 pb-2 px-4">
        <h1 className="text-3xl font-bold">💨 Fart Grand Prix</h1>
        <div className="flex items-center justify-center gap-2 mt-2">
          <span className="bg-accent text-accent-foreground px-3 py-1 rounded-full font-bold tracking-widest text-sm">
            {code}
          </span>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => { navigator.clipboard.writeText(code || ""); toast.success("Code copied!"); }}
          >
            📋
          </Button>
        </div>
        <p className="text-sm text-muted-foreground mt-1">
          Round {currentRound} of {game?.total_rounds} {gameOver ? "• 🏁 GAME OVER" : ""}
        </p>
      </header>

      <div className="max-w-md mx-auto px-4">
        <Podium players={scores} />

        {/* Action buttons for local player */}
        {localPlayer && !gameOver && (
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="flex gap-3 mb-6"
          >
            <Button
              size="lg"
              className="flex-1 h-16 text-2xl"
              onClick={() => handleLog("fart")}
            >
              💨 Fart!
            </Button>
            <Button
              size="lg"
              variant="secondary"
              className="flex-1 h-16 text-2xl"
              onClick={() => handleLog("poop")}
            >
              💩 Poop!
            </Button>
          </motion.div>
        )}

        {/* Leaderboard */}
        <div className="space-y-2">
          <h2 className="font-bold text-lg">🏆 Leaderboard</h2>
          {scores.map((p, i) => (
            <div
              key={p.id}
              className={`bg-card rounded-xl p-3 border border-border flex items-center gap-3 ${
                localPlayer?.id === p.id ? "ring-2 ring-primary" : ""
              }`}
            >
              <span className="text-xl font-bold text-muted-foreground w-8 text-center">#{i + 1}</span>
              <div className="flex-1 min-w-0">
                <span className="font-bold truncate block">
                  {p.nickname} {localPlayer?.id === p.id ? "(you)" : ""}
                </span>
                <div className="flex gap-3 text-xs text-muted-foreground">
                  <span>💨 {p.farts}</span>
                  <span>💩 {p.poops}</span>
                  <span>Base: {p.basePoints}</span>
                  <span>GP: +{p.gpBonus}</span>
                </div>
              </div>
              <span className="font-bold text-lg">{p.totalPoints}</span>
            </div>
          ))}
        </div>

        {/* Scoring rules */}
        <div className="mt-6 bg-card rounded-xl p-4 border border-border text-sm text-muted-foreground">
          <h3 className="font-bold text-foreground mb-2">📏 Scoring Rules</h3>
          <p>💨 Fart = 1 point &nbsp;|&nbsp; 💩 Poop = 3 points</p>
          <p className="mt-1">🏁 Daily GP Bonus: 1st +10, 2nd +5, 3rd +3</p>
          <p className="mt-1">Game: {game?.total_rounds} round{game?.total_rounds > 1 ? "s" : ""} ({game?.timezone})</p>
        </div>

        <Button variant="ghost" className="w-full mt-4" onClick={() => navigate("/")}>← Home</Button>
      </div>
    </div>
  );
};

export default GamePage;
