import { supabase } from "@/integrations/supabase/client";

// Generate a random 6-char alphanumeric code
export const generateJoinCode = () => {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let code = "";
  for (let i = 0; i < 6; i++) {
    code += chars[Math.floor(Math.random() * chars.length)];
  }
  return code;
};

export const createGame = async (timezone: string, totalRounds: number, startDate: string) => {
  const joinCode = generateJoinCode();
  const { data, error } = await supabase
    .from("games")
    .insert({ join_code: joinCode, timezone, total_rounds: totalRounds, start_date: startDate })
    .select()
    .single();
  if (error) throw error;
  return data;
};

export const getGameByCode = async (code: string) => {
  const { data, error } = await supabase
    .from("games")
    .select("*")
    .eq("join_code", code.toUpperCase())
    .maybeSingle();
  if (error) throw error;
  return data;
};

export const joinGame = async (gameId: string, nickname: string) => {
  const { data, error } = await supabase
    .from("players")
    .insert({ game_id: gameId, nickname })
    .select()
    .single();
  if (error) throw error;
  // Store session token locally
  localStorage.setItem(`player_${gameId}`, JSON.stringify({ id: data.id, token: data.session_token, nickname }));
  return data;
};

export const getPlayers = async (gameId: string) => {
  const { data, error } = await supabase
    .from("players")
    .select("*")
    .eq("game_id", gameId);
  if (error) throw error;
  return data || [];
};

export const getEventLogs = async (gameId: string) => {
  const { data, error } = await supabase
    .from("event_logs")
    .select("*")
    .eq("game_id", gameId);
  if (error) throw error;
  return data || [];
};

export const logEvent = async (gameId: string, playerId: string, eventType: "fart" | "poop", round: number) => {
  const { error } = await supabase
    .from("event_logs")
    .insert({ game_id: gameId, player_id: playerId, event_type: eventType, round });
  if (error) throw error;
};

export const getCurrentRound = (game: { start_date: string; total_rounds: number; timezone: string }) => {
  const start = new Date(game.start_date + "T00:00:00");
  const now = new Date();
  const diffDays = Math.floor((now.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
  const currentRound = Math.min(diffDays + 1, game.total_rounds);
  return Math.max(1, currentRound);
};

export const isGameOver = (game: { start_date: string; total_rounds: number }) => {
  const start = new Date(game.start_date + "T00:00:00");
  const now = new Date();
  const diffDays = Math.floor((now.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
  return diffDays >= game.total_rounds;
};

export const getLocalPlayer = (gameId: string) => {
  const stored = localStorage.getItem(`player_${gameId}`);
  if (!stored) return null;
  return JSON.parse(stored) as { id: string; token: string; nickname: string };
};

// Calculate scores: base points (fart=1, poop=3) + GP bonus per round
export const calculateScores = (
  players: { id: string; nickname: string }[],
  events: { player_id: string; event_type: string; round: number }[],
  totalRounds: number
) => {
  const GP_BONUS = [10, 5, 3];

  const playerScores = players.map((p) => {
    const playerEvents = events.filter((e) => e.player_id === p.id);
    const basePoints = playerEvents.reduce((sum, e) => sum + (e.event_type === "poop" ? 3 : 1), 0);
    
    let gpBonus = 0;
    // Calculate GP bonus per completed round
    for (let r = 1; r <= totalRounds; r++) {
      const roundEvents = events.filter((e) => e.round === r);
      if (roundEvents.length === 0) continue;
      
      // Rank players by base points in this round
      const roundScores = players.map((pl) => {
        const plEvents = roundEvents.filter((e) => e.player_id === pl.id);
        return {
          id: pl.id,
          score: plEvents.reduce((s, e) => s + (e.event_type === "poop" ? 3 : 1), 0),
        };
      }).sort((a, b) => b.score - a.score);

      const myRank = roundScores.findIndex((s) => s.id === p.id);
      if (myRank >= 0 && myRank < GP_BONUS.length && roundScores[myRank].score > 0) {
        gpBonus += GP_BONUS[myRank];
      }
    }

    return {
      ...p,
      basePoints,
      gpBonus,
      totalPoints: basePoints + gpBonus,
      farts: playerEvents.filter((e) => e.event_type === "fart").length,
      poops: playerEvents.filter((e) => e.event_type === "poop").length,
    };
  });

  return playerScores.sort((a, b) => b.totalPoints - a.totalPoints);
};
