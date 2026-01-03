-- First, drop the old constraint
ALTER TABLE public.bets DROP CONSTRAINT IF EXISTS bets_position_check;