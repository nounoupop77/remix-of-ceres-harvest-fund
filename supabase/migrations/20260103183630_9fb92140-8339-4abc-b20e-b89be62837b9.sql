-- Add position and crop fields to markets table for map display
ALTER TABLE public.markets 
ADD COLUMN position_top text,
ADD COLUMN position_left text,
ADD COLUMN crop text;