import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Sun, CloudRain, Flame, Waves, Wind, Sprout, TrendingUp, Loader2, Snowflake, Thermometer, CloudLightning, Wallet, AlertTriangle, History } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import AnimatedCounter from "./AnimatedCounter";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useWallet } from "@/hooks/useWallet";
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
  frost: <Snowflake className="w-4 h-4" />,
  heatwave: <Thermometer className="w-4 h-4" />,
  storm: <CloudLightning className="w-4 h-4" />,
};

// Contract address - update this after deploying the contract
const BETTING_CONTRACT_ADDRESS = ""; // TODO: Set after contract deployment
const CHARITY_WALLET_ADDRESS = ""; // TODO: Set the charity wallet address

interface UserBetHistory {
  id: string;
  position: string;
  amount: number;
  created_at: string;
  status: string;
}

const BettingModal = ({
  market,
  open,
  onOpenChange,
  onBetConfirm
}: BettingModalProps) => {
  const [yesNoChoice, setYesNoChoice] = useState<"yes" | "no" | null>(null);
  const [amount, setAmount] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [paymentStep, setPaymentStep] = useState<"input" | "wallet" | "processing" | "complete">("input");
  const [userBets, setUserBets] = useState<UserBetHistory[]>([]);
  const [isLoadingBets, setIsLoadingBets] = useState(false);
  const { toast } = useToast();
  const wallet = useWallet();

  // Weather is determined by the market (set by admin)
  const marketWeather = market?.weather_condition || "sunny";

  // Fetch user's betting history for this market (by wallet address)
  useEffect(() => {
    const fetchUserBets = async () => {
      if (!open || !market || !wallet.address) {
        setUserBets([]);
        return;
      }

      setIsLoadingBets(true);
      const { data: bets } = await supabase
        .from("bets")
        .select("id, position, amount, created_at, status")
        .eq("market_id", market.id)
        .eq("wallet_address", wallet.address)
        .order("created_at", { ascending: false });

      setUserBets(bets || []);
      setIsLoadingBets(false);
    };

    fetchUserBets();
  }, [open, market, wallet.address]);

  // Reset state when modal opens
  useEffect(() => {
    if (open) {
      setYesNoChoice(null);
      setAmount("");
      setPaymentStep("input");
    }
  }, [open]);

  if (!market) return null;

  const numAmount = parseFloat(amount) || 0;
  const totalPool = market.yes_pool + market.no_pool;
  const yesPool = market.yes_pool;
  const noPool = market.no_pool;
  
  // User's bet stance is determined by their YES/NO choice
  const isYesBet = yesNoChoice === "yes";
  
  // Calculate dynamic odds based on current pool
  const newYesPool = isYesBet ? yesPool + numAmount : yesPool;
  const newNoPool = yesNoChoice === "no" ? noPool + numAmount : noPool;
  const newTotalPool = totalPool + numAmount;
  
  const odds = isYesBet 
    ? (newYesPool > 0 ? newTotalPool / newYesPool : 2)
    : (newNoPool > 0 ? newTotalPool / newNoPool : 2);
  
  const potentialWin = numAmount * odds;
  const yesPercent = totalPool > 0 ? Math.round((yesPool / totalPool) * 100) : 50;
  const noPercent = 100 - yesPercent;

  const endDate = new Date(market.end_date).toLocaleDateString("zh-CN");

  const handleConfirm = async () => {
    if (numAmount <= 0 || !yesNoChoice) return;

    // Check wallet connection (no login required)
    if (!wallet.isConnected || !wallet.address) {
      setPaymentStep("wallet");
      return;
    }

    // Check network
    if (!wallet.isCorrectNetwork) {
      toast({
        title: "网络错误",
        description: "请切换到 Sepolia 测试网",
        variant: "destructive",
      });
      await wallet.switchToSepolia();
      return;
    }

    // Check USDC balance
    const usdcBalance = parseFloat(wallet.usdcBalance || "0");
    if (usdcBalance < numAmount) {
      toast({
        title: "余额不足",
        description: `您的 USDC 余额为 ${usdcBalance}，不足以支付 ${numAmount} USDC`,
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    setPaymentStep("processing");

    const stance = isYesBet ? "yes" : "no";

    try {
      // Transfer USDC to charity wallet (1%)
      // For now, we transfer to a placeholder address since contract isn't deployed
      // In production, this would go through the smart contract
      
      // TODO: When contract is deployed, use:
      // const success = await wallet.approveUSDC(BETTING_CONTRACT_ADDRESS, numAmount.toString());
      // if (!success) throw new Error("USDC 授权失败");
      
      // For demo, we'll simulate the blockchain transaction
      // and just record in database
      
      // Create bet record with weather prediction
      // Position format: "weather_yesno" e.g., "sunny_yes", "rain_no"
      const positionWithWeather = `${marketWeather}_${stance}`;
      const { error: betError } = await supabase.from("bets").insert({
        wallet_address: wallet.address,
        market_id: market.id,
        position: positionWithWeather,
        amount: numAmount,
      });

      if (betError) {
        throw new Error(betError.message);
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

      setPaymentStep("complete");

      toast({
        title: "下注成功！",
        description: `已下注 $${numAmount} USDC，预测「${weatherLabels[marketWeather]}」${yesNoChoice === "yes" ? "会发生" : "不会发生"}`,
      });

      if (onBetConfirm) {
        onBetConfirm(numAmount);
      }

      setTimeout(() => {
        setAmount("");
        setIsSubmitting(false);
        setPaymentStep("input");
        onOpenChange(false);
      }, 1500);

    } catch (error: any) {
      toast({
        title: "下注失败",
        description: error.message || "交易失败，请重试",
        variant: "destructive",
      });
      setIsSubmitting(false);
      setPaymentStep("input");
    }
  };

  const handleConnectWallet = async () => {
    try {
      await wallet.connect();
      setPaymentStep("input");
    } catch (err: any) {
      toast({
        title: "连接钱包失败",
        description: err?.message || "请确认已安装并启用 MetaMask",
        variant: "destructive",
      });
    }
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
          </div>
        </DialogHeader>

        <div className="space-y-5 pt-2">
          {/* Market Title */}
          <div className="bg-muted/50 rounded-xl p-3">
            <p className="text-sm font-medium text-foreground">{market.title}</p>
          </div>

          {/* Weather Display (set by admin) */}
          <div className="flex items-center gap-3 p-3 rounded-xl bg-muted/50 border border-border">
            <div className="flex items-center gap-2 text-foreground">
              {weatherIcons[marketWeather]}
              <span className="font-medium">预测天气：{weatherLabels[marketWeather] || marketWeather}</span>
            </div>
          </div>

          {/* YES/NO Selection */}
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-2"
          >
            <label className="text-sm font-medium text-foreground mb-2 block">
              您认为 8 天后会是「{weatherLabels[marketWeather]}」吗？
            </label>
            <div className="grid grid-cols-2 gap-3">
              <motion.button
                type="button"
                onClick={() => setYesNoChoice("yes")}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className={`
                  flex items-center justify-center gap-2 py-4 px-4 rounded-xl text-base font-semibold transition-all border-2
                  ${yesNoChoice === "yes" 
                    ? "bg-accent/20 border-accent text-accent ring-2 ring-accent/20" 
                    : "bg-muted/50 border-transparent hover:bg-muted text-foreground"}
                `}
              >
                <span className="text-lg">✓</span>
                <span>是 (YES)</span>
              </motion.button>
              <motion.button
                type="button"
                onClick={() => setYesNoChoice("no")}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className={`
                  flex items-center justify-center gap-2 py-4 px-4 rounded-xl text-base font-semibold transition-all border-2
                  ${yesNoChoice === "no" 
                    ? "bg-destructive/20 border-destructive text-destructive ring-2 ring-destructive/20" 
                    : "bg-muted/50 border-transparent hover:bg-muted text-foreground"}
                `}
              >
                <span className="text-lg">✗</span>
                <span>否 (NO)</span>
              </motion.button>
            </div>
            {yesNoChoice && (
              <motion.div 
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-2 p-3 rounded-lg bg-muted/50 text-sm"
              >
                {yesNoChoice === "yes" ? (
                  <span className="text-accent">
                    ✓ 您预测 8 天后天气为「{weatherLabels[marketWeather]}」
                  </span>
                ) : (
                  <span className="text-destructive">
                    ✗ 您预测 8 天后天气不会是「{weatherLabels[marketWeather]}」
                  </span>
                )}
              </motion.div>
            )}
          </motion.div>

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

          {/* Wallet Status */}
          {wallet.isConnected && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-accent/10 rounded-xl p-3 border border-accent/30"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-accent animate-pulse" />
                  <span className="text-sm font-medium text-accent">钱包已连接</span>
                </div>
                <span className="text-sm font-mono">{wallet.shortAddress}</span>
              </div>
              <div className="flex justify-between mt-2 text-xs text-muted-foreground">
                <span>USDC 余额：</span>
                <span className="font-medium text-foreground">{wallet.usdcBalance || "0"} USDC</span>
              </div>
            </motion.div>
          )}

          {/* User Betting History for this Market */}
          {userBets.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-muted/30 rounded-xl p-4 border border-border"
            >
              <div className="flex items-center gap-2 mb-3">
                <History className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm font-medium">我在此地点的下注记录</span>
              </div>
              <div className="space-y-2 max-h-32 overflow-y-auto">
                {isLoadingBets ? (
                  <div className="flex justify-center py-2">
                    <Loader2 className="w-4 h-4 animate-spin" />
                  </div>
                ) : (
                  userBets.map((bet) => {
                    const [weather, stance] = bet.position.split("_");
                    const weatherLabel = weatherLabels[weather] || weather;
                    const stanceLabel = stance === "yes" ? "是" : "否";
                    return (
                      <div key={bet.id} className="flex justify-between items-center text-xs p-2 bg-background/50 rounded-lg">
                        <div className="flex items-center gap-2">
                          {weatherIcons[weather] || <Sun className="w-3 h-3" />}
                          <span className="text-foreground">
                            {weatherLabel} · <span className={stance === "yes" ? "text-accent" : "text-destructive"}>{stanceLabel}</span>
                          </span>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="font-medium">${bet.amount}</span>
                          <span className={`px-1.5 py-0.5 rounded text-[10px] ${
                            bet.status === 'pending' ? 'bg-yellow-500/20 text-yellow-700' :
                            bet.status === 'won' ? 'bg-accent/20 text-accent' :
                            'bg-destructive/20 text-destructive'
                          }`}>
                            {bet.status === 'pending' ? '进行中' : bet.status === 'won' ? '已赢' : '已输'}
                          </span>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
              <div className="flex justify-between mt-2 pt-2 border-t border-border text-xs text-muted-foreground">
                <span>总下注次数：{userBets.length}</span>
                <span>总金额：${userBets.reduce((sum, b) => sum + b.amount, 0)}</span>
              </div>
            </motion.div>
          )}

          {/* Network Warning */}
          {wallet.isConnected && !wallet.isCorrectNetwork && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="bg-destructive/10 rounded-xl p-3 border border-destructive/30"
            >
              <div className="flex items-center gap-2 text-destructive mb-2">
                <AlertTriangle className="w-4 h-4" />
                <span className="text-sm font-medium">请切换到 Sepolia 测试网</span>
              </div>
              <Button
                size="sm"
                variant="outline"
                className="w-full"
                onClick={() => wallet.switchToSepolia()}
              >
                切换网络
              </Button>
            </motion.div>
          )}

          {/* Confirm Button */}
          <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
            {paymentStep === "wallet" ? (
              <Button
                onClick={handleConnectWallet}
                className="w-full h-12 text-base font-semibold gap-2"
                variant="default"
              >
                <Wallet className="w-5 h-5" />
                连接 MetaMask 钱包
              </Button>
            ) : paymentStep === "processing" ? (
              <Button
                disabled
                className="w-full h-12 text-base font-semibold"
                variant="default"
              >
                <Loader2 className="w-5 h-5 animate-spin mr-2" />
                处理中...
              </Button>
            ) : paymentStep === "complete" ? (
              <Button
                disabled
                className="w-full h-12 text-base font-semibold bg-accent hover:bg-accent"
                variant="default"
              >
                ✓ 下注成功
              </Button>
            ) : (
              <Button
                onClick={handleConfirm}
                disabled={numAmount <= 0 || !yesNoChoice || isSubmitting}
                className="w-full h-12 text-base font-semibold"
                variant="default"
              >
                {!yesNoChoice ? "请选择 是/否" : (
                  wallet.isConnected ? "确认下注 (Confirm Bet)" : "连接钱包并下注"
                )}
              </Button>
            )}
          </motion.div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default BettingModal;
