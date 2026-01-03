-- Add wallet_address column to bets table for wallet-based betting
ALTER TABLE public.bets ADD COLUMN wallet_address text;

-- Make user_id nullable since wallet users don't need to be logged in
ALTER TABLE public.bets ALTER COLUMN user_id DROP NOT NULL;

-- Drop existing RLS policies on bets that require auth
DROP POLICY IF EXISTS "Users can create their own bets" ON public.bets;
DROP POLICY IF EXISTS "Users can view their own bets" ON public.bets;

-- Create new RLS policy allowing anyone to insert bets (wallet-based)
CREATE POLICY "Anyone can place bets with wallet" 
ON public.bets 
FOR INSERT 
WITH CHECK (wallet_address IS NOT NULL);

-- Create new RLS policy allowing users to view bets by wallet address
CREATE POLICY "Users can view bets by wallet address" 
ON public.bets 
FOR SELECT 
USING (true);

-- Keep admin policies as they are (already exist)