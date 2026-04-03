import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { createGame, getGameByCode, joinGame } from "@/lib/gameService";
import { toast } from "sonner";

const TIMEZONES = [
  "UTC", "America/New_York", "America/Chicago", "America/Denver", "America/Los_Angeles",
  "Europe/London", "Europe/Berlin", "Europe/Helsinki", "Asia/Tokyo", "Asia/Shanghai",
  "Australia/Sydney",
];

const Index = () => {
  const navigate = useNavigate();
  const [mode, setMode] = useState<"home" | "create" | "join">("home");
  const [joinCode, setJoinCode] = useState("");
  const [nickname, setNickname] = useState("");
  const [timezone, setTimezone] = useState(Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC");
  const [rounds, setRounds] = useState("1");
  const [loading, setLoading] = useState(false);

  const handleCreate = async () => {
    if (!nickname.trim()) { toast.error("Enter your nickname!"); return; }
    setLoading(true);
    try {
      const game = await createGame(timezone, parseInt(rounds), new Date().toISOString().split("T")[0]);
      await joinGame(game.id, nickname.trim());
      navigate(`/game/${game.join_code}`);
    } catch (e: any) {
      toast.error(e.message || "Failed to create game");
    }
    setLoading(false);
  };

  const handleJoin = async () => {
    if (!joinCode.trim() || !nickname.trim()) { toast.error("Enter code and nickname!"); return; }
    setLoading(true);
    try {
      const game = await getGameByCode(joinCode.trim());
      if (!game) { toast.error("Game not found!"); setLoading(false); return; }
      await joinGame(game.id, nickname.trim());
      navigate(`/game/${game.join_code}`);
    } catch (e: any) {
      if (e.message?.includes("duplicate")) toast.error("Nickname already taken in this game!");
      else toast.error(e.message || "Failed to join");
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center px-4">
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="text-center mb-8"
      >
        <h1 className="text-5xl font-bold mb-2">💨 Fart Grand Prix 🏆</h1>
        <p className="text-muted-foreground text-lg">The ultimate family gas competition</p>
      </motion.div>

      {mode === "home" && (
        <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="space-y-4 w-full max-w-xs">
          <Button size="lg" className="w-full text-lg h-14" onClick={() => setMode("create")}>🏁 Create Game</Button>
          <Button size="lg" variant="secondary" className="w-full text-lg h-14" onClick={() => setMode("join")}>🎟️ Join Game</Button>
        </motion.div>
      )}

      {mode === "create" && (
        <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="space-y-4 w-full max-w-xs">
          <Input placeholder="Your nickname" value={nickname} onChange={(e) => setNickname(e.target.value)} className="h-12 text-lg" />
          <Select value={timezone} onValueChange={setTimezone}>
            <SelectTrigger className="h-12"><SelectValue /></SelectTrigger>
            <SelectContent>
              {TIMEZONES.map((tz) => <SelectItem key={tz} value={tz}>{tz.replace("_", " ")}</SelectItem>)}
            </SelectContent>
          </Select>
          <Select value={rounds} onValueChange={setRounds}>
            <SelectTrigger className="h-12"><SelectValue /></SelectTrigger>
            <SelectContent>
              {[1, 2, 3, 5, 7].map((r) => <SelectItem key={r} value={String(r)}>{r} {r === 1 ? "Round (1 day)" : `Rounds (${r} days)`}</SelectItem>)}
            </SelectContent>
          </Select>
          <Button size="lg" className="w-full h-14 text-lg" onClick={handleCreate} disabled={loading}>
            {loading ? "Creating..." : "🚀 Start Game"}
          </Button>
          <Button variant="ghost" className="w-full" onClick={() => setMode("home")}>← Back</Button>
        </motion.div>
      )}

      {mode === "join" && (
        <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="space-y-4 w-full max-w-xs">
          <Input placeholder="Your nickname" value={nickname} onChange={(e) => setNickname(e.target.value)} className="h-12 text-lg" />
          <Input
            placeholder="Game code (e.g. ABC123)"
            value={joinCode}
            onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
            maxLength={6}
            className="h-12 text-lg text-center tracking-widest font-bold"
          />
          <Button size="lg" className="w-full h-14 text-lg" onClick={handleJoin} disabled={loading}>
            {loading ? "Joining..." : "🎟️ Join Game"}
          </Button>
          <Button variant="ghost" className="w-full" onClick={() => setMode("home")}>← Back</Button>
        </motion.div>
      )}
    </div>
  );
};

export default Index;
