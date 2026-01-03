import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Sun, CloudRain, Flame, Waves, Wind, Sprout, TrendingUp, Loader2, Snowflake, Thermometer, CloudLightning } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import AnimatedCounter from "./AnimatedCounter";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import type { TrendingMarket } from "./TrendingMarkets";

interface BettingModalProps {
  market: TrendingMarket | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onBetConfirm?: (amount: number) => void;
}

type WeatherOption = {
  value: string;
  label: string;
  icon: React.ReactNode;
  bgColor: string;
};

const quickAmounts = [10, 50, 100, 500];

const weatherOptions: WeatherOption[] = [
  { value: "sunny", label: "晴天", icon: <Sun className="w-4 h-4" />, bgColor: "bg-yellow-500/20 hover:bg-yellow-500/30 border-yellow-500/50" },
  { value: "rain", label: "小雨", icon: <CloudRain className="w-4 h-4" />, bgColor: "bg-blue-500/20 hover:bg-blue-500/30 border-blue-500/50" },
  { value: "drought", label: "干旱", icon: <Flame className="w-4 h-4" />, bgColor: "bg-orange-500/20 hover:bg-orange-500/30 border-orange-500/50" },
  { value: "flood", label: "洪涝", icon: <Waves className="w-4 h-4" />, bgColor: "bg-teal-500/20 hover:bg-teal-500/30 border-teal-500/50" },
  { value: "typhoon", label: "台风", icon: <Wind className="w-4 h-4" />, bgColor: "bg-purple-500/20 hover:bg-purple-500/30 border-purple-500/50" },
  { value: "frost", label: "霜冻", icon: <Snowflake className="w-4 h-4" />, bgColor: "bg-cyan-500/20 hover:bg-cyan-500/30 border-cyan-500/50" },
  { value: "heatwave", label: "高温", icon: <Thermometer className="w-4 h-4" />, bgColor: "bg-red-500/20 hover:bg-red-500/30 border-red-500/50" },
  { value: "storm", label: "暴风雨", icon: <CloudLightning className="w-4 h-4" />, bgColor: "bg-slate-500/20 hover:bg-slate-500/30 border-slate-500/50" },
];

const weatherLabels: Record<string, string> = {
  sunny: "晴天",
  rain: "小雨",
  drought: "干旱",
  flood: "洪涝",
  typhoon: "台风",
  frost: "霜冻",
  heatwave: "高温",
  storm: "暴风雨",
};

const weatherIcons: Record<string, React.ReactNode> = {
  sunny: <Sun className="w-4 h-4" />,
  rain: <CloudRain className="w-4 h-4" />,
  drought: <Flame className="w-4 h-4" />,
  flood: <Waves className="w-4 h-4" />,
  typhoon: <Wind className="w-4 h-4" />,
  frost: <Snowflake className="w-4 h-4" />,
  heatwave: <Thermometer className="w-4 h-4" />,
  storm: <CloudLightning className="w-4 h-4" />,
};

const BettingModal = ({
  market,
  open,
  onOpenChange,
  onBetConfirm
}: BettingModalProps) => {
  const [selectedWeather, setSelectedWeather] = useState<string>("");
  const [amount, setAmount] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  // Reset selected weather when modal opens
  useEffect(() => {
    if (open) {
      setSelectedWeather("");
      setAmount("");
    }
  }, [open]);

  if (!market) return null;

  const numAmount = parseFloat(amount) || 0;
  const totalPool = market.yes_pool + market.no_pool;
  const yesPool = market.yes_pool;
  const noPool = market.no_pool;
  
  // User is betting YES if they select the same weather as the market condition
  const isYesBet = selectedWeather === market.weather_condition;
  
  // Calculate dynamic odds based on current pool
  const newYesPool = isYesBet ? yesPool + numAmount : yesPool;
  const newNoPool = !isYesBet && selectedWeather ? noPool + numAmount : noPool;
  const newTotalPool = totalPool + numAmount;
  
  const odds = isYesBet 
    ? (newYesPool > 0 ? newTotalPool / newYesPool : 2)
    : (newNoPool > 0 ? newTotalPool / newNoPool : 2);
  
  const potentialWin = numAmount * odds;
  const yesPercent = totalPool > 0 ? Math.round((yesPool / totalPool) * 100) : 50;
  const noPercent = 100 - yesPercent;

  const weather = market.weather_condition;
  const endDate = new Date(market.end_date).toLocaleDateString("zh-CN");

  const handleConfirm = async () => {
    if (numAmount <= 0 || !selectedWeather) return;

    setIsSubmitting(true);

    const stance = isYesBet ? "yes" : "no";

    // Check if user is logged in
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      toast({
        title: "请先登录",
        description: "您需要登录后才能下注",
        variant: "destructive",
      });
      setIsSubmitting(false);
      return;
    }

    // Create bet record
    const { error: betError } = await supabase.from("bets").insert({
      user_id: user.id,
      market_id: market.id,
      position: stance,
      amount: numAmount,
    });

    if (betError) {
      toast({
        title: "下注失败",
        description: betError.message,
        variant: "destructive",
      });
      setIsSubmitting(false);
      return;
    }

    // Update market pool
    const poolUpdate = stance === "yes" 
      ? { yes_pool: yesPool + numAmount }
      : { no_pool: noPool + numAmount };
    
    await supabase.from("markets").update(poolUpdate).eq("id", market.id);

    // Add to charity pool (1% of bet)
    const charityAmount = numAmount * 0.01;
    await supabase.from("charity_pool").insert({
      amount: charityAmount,
      market_id: market.id,
    });

    // Update market charity contribution
    await supabase.from("markets").update({
      charity_contribution: market.yes_pool + market.no_pool + numAmount
    }).eq("id", market.id);

    toast({
      title: "下注成功！",
      description: `已下注 $${numAmount} USDC，预测天气为「${weatherLabels[selectedWeather]}」`,
    });

    if (onBetConfirm) {
      onBetConfirm(numAmount);
    }

    setAmount("");
    setIsSubmitting(false);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto bg-card border-border shadow-medium">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3 text-xl">
            <span className="font-serif">{market.city}</span>
            <span className="text-sm font-normal text-muted-foreground px-2 py-0.5 bg-muted rounded-full">
              {market.province}
            </span>
          </DialogTitle>
          <div className="flex items-center gap-3 text-sm text-muted-foreground">
            <span>结束日期：<span className="font-medium text-foreground">{endDate}</span></span>
            <span className="text-muted-foreground">•</span>
            <span className="flex items-center gap-1">
              预测条件：
              <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-xs font-medium bg-primary/10 text-primary`}>
                {weatherIcons[weather]}
                {weatherLabels[weather] || weather}
              </span>
            </span>
          </div>
        </DialogHeader>

        <div className="space-y-5 pt-2">
          {/* Market Title */}
          <div className="bg-muted/50 rounded-xl p-3">
            <p className="text-sm font-medium text-foreground">{market.title}</p>
          </div>

          {/* Weather Selection */}
          <div>
            <label className="text-sm font-medium text-foreground mb-2 block">
              选择您预测的天气条件
            </label>
            <div className="grid grid-cols-4 gap-2">
              {weatherOptions.map((weather) => (
                <motion.button
                  key={weather.value}
                  type="button"
                  onClick={() => setSelectedWeather(weather.value)}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className={`
                    flex flex-col items-center gap-1 py-3 px-2 rounded-xl text-sm transition-all border-2
                    ${selectedWeather === weather.value 
                      ? `${weather.bgColor} border-current ring-2 ring-primary/20` 
                      : "bg-muted/50 border-transparent hover:bg-muted"}
                  `}
                >
                  {weather.icon}
                  <span className="text-xs font-medium">{weather.label}</span>
                </motion.button>
              ))}
            </div>
            {selectedWeather && (
              <motion.div 
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-2 text-sm"
              >
                {isYesBet ? (
                  <span className="text-accent">
                    ✓ 您预测天气为「{weatherLabels[selectedWeather]}」（与市场条件一致 = YES）
                  </span>
                ) : (
                  <span className="text-destructive">
                    ✗ 您预测天气为「{weatherLabels[selectedWeather]}」（与市场条件不同 = NO）
                  </span>
                )}
              </motion.div>
            )}
          </div>

          {/* Amount Input */}
          <div>
            <label className="text-sm font-medium text-foreground mb-2 block">
              下注金额 (USDC)
            </label>
            <Input
              type="number"
              placeholder="输入金额..."
              value={amount}
              onChange={e => setAmount(e.target.value)}
              className="h-12 text-lg bg-background border-border"
            />
            <div className="flex gap-2 mt-2">
              {quickAmounts.map(amt => (
                <motion.button
                  key={amt}
                  onClick={() => setAmount(amt.toString())}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="flex-1 py-1.5 text-sm font-medium rounded-lg bg-muted hover:bg-secondary transition-colors"
                >
                  ${amt}
                </motion.button>
              ))}
            </div>
          </div>

          {/* Market Preview Card */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-muted/50 rounded-xl p-4 border border-border"
          >
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-accent" />
                <span className="text-sm font-medium">市场预览</span>
              </div>
              <div className="text-right">
                <p className="text-xs text-muted-foreground">总奖池</p>
                <p className="text-sm font-semibold text-foreground">
                  <AnimatedCounter value={totalPool} prefix="$" suffix=" USDC" />
                </p>
              </div>
            </div>

            {/* Pool Distribution Bar */}
            <div className="mb-3">
              <div className="flex justify-between text-xs mb-1">
                <span className="text-accent">YES {yesPercent}%</span>
                <span className="text-destructive">NO {noPercent}%</span>
              </div>
              <div className="h-2 rounded-full overflow-hidden flex bg-background">
                <motion.div
                  className="bg-accent"
                  initial={{ width: 0 }}
                  animate={{ width: `${yesPercent}%` }}
                  transition={{ duration: 0.8, ease: "easeOut" }}
                />
                <motion.div
                  className="bg-destructive"
                  initial={{ width: 0 }}
                  animate={{ width: `${noPercent}%` }}
                  transition={{ duration: 0.8, ease: "easeOut", delay: 0.1 }}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <p className="text-muted-foreground text-xs">预计赔率</p>
                <p className="font-semibold text-foreground">{odds.toFixed(2)}x</p>
              </div>
              <div>
                <p className="text-muted-foreground text-xs">潜在收益</p>
                <p className="font-semibold text-accent">
                  <AnimatedCounter value={potentialWin} prefix="+$" decimals={2} />
                </p>
              </div>
            </div>

            {/* Charity Note */}
            <div className="mt-3 pt-3 border-t border-border flex items-center gap-2">
              <Sprout className="w-4 h-4 text-accent" />
              <span className="text-xs text-accent font-medium">🌱 1% 下注金额将捐赠给助农资金池</span>
            </div>
          </motion.div>

          {/* Confirm Button */}
          <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
            <Button
              onClick={handleConfirm}
              disabled={numAmount <= 0 || !selectedWeather || isSubmitting}
              className="w-full h-12 text-base font-semibold"
              variant="default"
            >
              {isSubmitting ? (
                <Loader2 className="w-5 h-5 animate-spin mr-2" />
              ) : null}
              {!selectedWeather ? "请先选择天气预测" : "确认下注 (Confirm Bet)"}
            </Button>
          </motion.div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default BettingModal;
