import { useState } from "react";
import { motion } from "framer-motion";
import { Sun, CloudRain, Flame, Waves, Wind, Sprout, TrendingUp, Loader2 } from "lucide-react";
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

const quickAmounts = [10, 50, 100, 500];

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
  frost: <CloudRain className="w-4 h-4" />,
  heatwave: <Sun className="w-4 h-4" />,
  storm: <CloudRain className="w-4 h-4" />,
};

const BettingModal = ({
  market,
  open,
  onOpenChange,
  onBetConfirm
}: BettingModalProps) => {
  const [stance, setStance] = useState<"yes" | "no">("yes");
  const [amount, setAmount] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  if (!market) return null;

  const numAmount = parseFloat(amount) || 0;
  const totalPool = market.yes_pool + market.no_pool;
  const yesPool = market.yes_pool;
  const noPool = market.no_pool;
  
  // Calculate dynamic odds based on current pool
  const newYesPool = stance === "yes" ? yesPool + numAmount : yesPool;
  const newNoPool = stance === "no" ? noPool + numAmount : noPool;
  const newTotalPool = totalPool + numAmount;
  
  const odds = stance === "yes" 
    ? (newYesPool > 0 ? newTotalPool / newYesPool : 2)
    : (newNoPool > 0 ? newTotalPool / newNoPool : 2);
  
  const potentialWin = numAmount * odds;
  const yesPercent = totalPool > 0 ? Math.round((yesPool / totalPool) * 100) : 50;
  const noPercent = 100 - yesPercent;

  const weather = market.weather_condition;
  const endDate = new Date(market.end_date).toLocaleDateString("zh-CN");

  const handleConfirm = async () => {
    if (numAmount <= 0) return;

    setIsSubmitting(true);

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
      description: `已下注 $${numAmount} USDC 于 ${stance.toUpperCase()} 侧`,
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
      <DialogContent className="sm:max-w-md bg-card border-border shadow-medium">
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

          {/* Stance Toggle */}
          <div>
            <label className="text-sm font-medium text-foreground mb-2 block">
              您的立场
            </label>
            <div className="flex gap-2">
              <motion.button
                onClick={() => setStance("yes")}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className={`
                  flex-1 py-3 rounded-xl font-semibold text-sm transition-all
                  ${stance === "yes" ? "bg-accent text-accent-foreground shadow-soft" : "bg-muted text-muted-foreground hover:bg-accent/20"}
                `}
              >
                ✓ YES - 会发生
              </motion.button>
              <motion.button
                onClick={() => setStance("no")}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className={`
                  flex-1 py-3 rounded-xl font-semibold text-sm transition-all
                  ${stance === "no" ? "bg-destructive text-destructive-foreground shadow-soft" : "bg-muted text-muted-foreground hover:bg-destructive/20"}
                `}
              >
                ✗ NO - 不会发生
              </motion.button>
            </div>
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
              disabled={numAmount <= 0 || isSubmitting}
              className="w-full h-12 text-base font-semibold"
              variant="default"
            >
              {isSubmitting ? (
                <Loader2 className="w-5 h-5 animate-spin mr-2" />
              ) : null}
              确认下注 (Confirm Bet)
            </Button>
          </motion.div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default BettingModal;
