
-- Games table
CREATE TABLE public.games (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  join_code TEXT NOT NULL UNIQUE,
  timezone TEXT NOT NULL DEFAULT 'UTC',
  total_rounds INTEGER NOT NULL DEFAULT 1,
  start_date DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE INDEX idx_games_join_code ON public.games (join_code);

-- Players table
CREATE TABLE public.players (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  game_id UUID NOT NULL REFERENCES public.games(id) ON DELETE CASCADE,
  nickname TEXT NOT NULL,
  session_token UUID NOT NULL DEFAULT gen_random_uuid(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(game_id, nickname)
);

-- Event logs (farts and poops combined)
CREATE TABLE public.event_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  game_id UUID NOT NULL REFERENCES public.games(id) ON DELETE CASCADE,
  player_id UUID NOT NULL REFERENCES public.players(id) ON DELETE CASCADE,
  event_type TEXT NOT NULL CHECK (event_type IN ('fart', 'poop')),
  round INTEGER NOT NULL DEFAULT 1,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE INDEX idx_event_logs_game_round ON public.event_logs (game_id, round);

-- Disable RLS since no auth (access controlled by join code at app level)
ALTER TABLE public.games ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.players ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.event_logs ENABLE ROW LEVEL SECURITY;

-- Allow anonymous access (anon role)
CREATE POLICY "Anyone can create games" ON public.games FOR INSERT TO anon WITH CHECK (true);
CREATE POLICY "Anyone can read games by join code" ON public.games FOR SELECT TO anon USING (true);

CREATE POLICY "Anyone can join games" ON public.players FOR INSERT TO anon WITH CHECK (true);
CREATE POLICY "Anyone can read players" ON public.players FOR SELECT TO anon USING (true);

CREATE POLICY "Anyone can log events" ON public.event_logs FOR INSERT TO anon WITH CHECK (true);
CREATE POLICY "Anyone can read events" ON public.event_logs FOR SELECT TO anon USING (true);
