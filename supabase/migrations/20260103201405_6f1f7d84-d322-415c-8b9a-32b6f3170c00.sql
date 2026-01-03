-- Add a new check constraint that allows the weather_stance format
ALTER TABLE public.bets ADD CONSTRAINT bets_position_check 
CHECK (position ~ '^(sunny|rain|drought|flood|typhoon|frost|heatwave|storm)_(yes|no)$');