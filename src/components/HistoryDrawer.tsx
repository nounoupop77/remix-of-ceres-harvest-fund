import { useState, useEffect } from "react";
import { History, Clock, CheckCircle2, XCircle, TrendingUp, Users, Sparkles, Timer, Gift, Heart, Loader2 } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import AnimatedCounter from "./AnimatedCounter";
import { supabase } from "@/integrations/supabase/client";

interface HistoryDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  refreshTrigger?: number;
}

type BetStatus = "pending" | "won" | "lost";

interface BetRecord {
  id: string;
  market_id: string;
  position: string;
  amount: number;
  status: string;
  payout: number | null;
  created_at: string;
  markets: {
    title: string;
    city: string;
    province: string;
    weather_condition: string;
    yes_pool: number;
    no_pool: number;
    end_date: string;
    result: string | null;
    status: string;
  } | null;
}

const statusConfig: Record<
  BetStatus,
  { icon: React.ReactNode; label: string; className: string }
> = {
  pending: {
    icon: <Clock className="w-4 h-4" />,
    label: "进行中",
    className: "text-primary bg-primary/10",
  },
  won: {
    icon: <CheckCircle2 className="w-4 h-4" />,
    label: "已赢",
    className: "text-accent bg-accent/10",
  },
  lost: {
    icon: <XCircle className="w-4 h-4" />,
    label: "已输",
    className: "text-destructive bg-destructive/10",
  },
};

const HistoryDrawer = ({ open, onOpenChange, refreshTrigger }: HistoryDrawerProps) => {
  const [bets, setBets] = useState<BetRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState<any>(null);

  const fetchBets = async (currentUser: any) => {
    if (!currentUser) return;
    
    setIsLoading(true);
    const { data, error } = await supabase
      .from("bets")
      .select(`
        *,
        markets (title, city, province, weather_condition, yes_pool, no_pool, end_date, result, status)
      `)
      .eq("user_id", currentUser.id)
      .order("created_at", { ascending: false });

    if (!error && data) {
      setBets(data as unknown as BetRecord[]);
    }
    setIsLoading(false);
  };

  useEffect(() => {
    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
      
      if (!user) {
        setIsLoading(false);
        return;
      }

      if (open) {
        await fetchBets(user);
      }
    };

    checkUser();
  }, [open]);

  // Refresh bets when refreshTrigger changes
  useEffect(() => {
    if (refreshTrigger && user) {
      fetchBets(user);
    }
  }, [refreshTrigger, user]);

  const pendingBets = bets.filter((b) => b.status === "pending");
  const settledBets = bets.filter((b) => b.status !== "pending");

  const totalWinnings = bets
    .filter((b) => b.status === "won" && b.payout)
    .reduce((sum, b) => sum + (b.payout! - b.amount), 0);

  const totalLosses = bets
    .filter((b) => b.status === "lost")
    .reduce((sum, b) => sum + b.amount, 0);

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-md bg-card border-border overflow-y-auto">
        <SheetHeader className="pb-4">
          <SheetTitle className="flex items-center gap-2 font-serif text-xl">
            <History className="w-5 h-5 text-primary" />
            我的博弈
          </SheetTitle>
          <SheetDescription>查看您的进行中和已结算的博弈记录</SheetDescription>
        </SheetHeader>

        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-6 h-6 animate-spin text-primary" />
          </div>
        ) : !user ? (
          <div className="text-center py-12 text-muted-foreground">
            <History className="w-12 h-12 mx-auto mb-3 opacity-30" />
            <p>请先登录查看博弈记录</p>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Stats Summary */}
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-accent/10 rounded-xl p-4">
                <div className="flex items-center gap-2 text-accent mb-1">
                  <TrendingUp className="w-4 h-4" />
                  <span className="text-xs font-medium">总收益</span>
                </div>
                <p className="text-xl font-bold text-accent">
                  +$<AnimatedCounter value={totalWinnings} />
                </p>
              </div>
              <div className="bg-destructive/10 rounded-xl p-4">
                <div className="flex items-center gap-2 text-destructive mb-1">
                  <XCircle className="w-4 h-4" />
                  <span className="text-xs font-medium">总损失</span>
                </div>
                <p className="text-xl font-bold text-destructive">
                  -$<AnimatedCounter value={totalLosses} />
                </p>
              </div>
            </div>

            {/* Pending Bets */}
            {pendingBets.length > 0 && (
              <div>
                <h3 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
                  <Clock className="w-4 h-4 text-primary" />
                  进行中 ({pendingBets.length})
                </h3>
                <Accordion type="single" collapsible className="space-y-2">
                  {pendingBets.map((bet) => (
                    <ActiveBetCard key={bet.id} bet={bet} />
                  ))}
                </Accordion>
              </div>
            )}

            {/* Settled Bets */}
            {settledBets.length > 0 && (
              <div>
                <h3 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-muted-foreground" />
                  已结算 ({settledBets.length})
                </h3>
                <Accordion type="single" collapsible className="space-y-2">
                  {settledBets.map((bet) => (
                    <SettledBetCard key={bet.id} bet={bet} />
                  ))}
                </Accordion>
              </div>
            )}

            {bets.length === 0 && (
              <div className="text-center py-12 text-muted-foreground">
                <History className="w-12 h-12 mx-auto mb-3 opacity-30" />
                <p>暂无博弈记录</p>
                <p className="text-sm">在地图上选择一个地区开始博弈</p>
              </div>
            )}
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
};

// Active Bet Card Component
const ActiveBetCard = ({ bet }: { bet: BetRecord }) => {
  const status = statusConfig[bet.status as BetStatus] || statusConfig.pending;
  const [countdown, setCountdown] = useState({ days: 0, hours: 0 });
  
  const yesPool = bet.markets?.yes_pool || 0;
  const noPool = bet.markets?.no_pool || 0;
  const totalPool = yesPool + noPool;
  const odds = bet.position === "yes" 
    ? (yesPool > 0 ? totalPool / yesPool : 2)
    : (noPool > 0 ? totalPool / noPool : 2);

  useEffect(() => {
    if (!bet.markets?.end_date) return;
    
    const calculateCountdown = () => {
      const end = new Date(bet.markets!.end_date).getTime();
      const now = new Date().getTime();
      const diff = end - now;
      
      if (diff > 0) {
        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        setCountdown({ days, hours });
      }
    };
    
    calculateCountdown();
    const interval = setInterval(calculateCountdown, 60000);
    return () => clearInterval(interval);
  }, [bet.markets?.end_date]);

  return (
    <AccordionItem value={bet.id} className="border-0">
      <AccordionTrigger className="p-3 bg-muted/50 rounded-xl hover:bg-muted transition-colors hover:no-underline data-[state=open]:rounded-b-none">
        <div className="flex items-start justify-between w-full pr-2">
          <div className="text-left">
            <p className="font-medium text-foreground">
              {bet.markets?.city} ({bet.markets?.province}) · {bet.markets?.weather_condition}
            </p>
            <p className="text-xs text-muted-foreground">{new Date(bet.created_at).toLocaleDateString("zh-CN")}</p>
          </div>
          <div className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${status.className}`}>
            {status.icon}
            {status.label}
          </div>
        </div>
      </AccordionTrigger>
      <AccordionContent className="bg-muted/30 rounded-b-xl px-3 pb-3 pt-0">
        <div className="space-y-4 pt-3 border-t border-border/50">
          {/* Real-time Pool */}
          <div>
            <p className="text-xs text-muted-foreground mb-2">实时资金池 (USDC)</p>
            <div className="grid grid-cols-2 gap-2 mb-2">
              <div className="bg-accent/10 rounded-lg p-2 text-center">
                <p className="text-xs text-accent mb-1">YES 侧</p>
                <p className="font-bold text-accent">
                  $<AnimatedCounter value={yesPool} />
                </p>
              </div>
              <div className="bg-destructive/10 rounded-lg p-2 text-center">
                <p className="text-xs text-destructive mb-1">NO 侧</p>
                <p className="font-bold text-destructive">
                  $<AnimatedCounter value={noPool} />
                </p>
              </div>
            </div>
          </div>

          {/* NFT Status */}
          <div className="flex items-center gap-2 text-sm">
            <Sparkles className="w-4 h-4 text-primary" />
            <span className="text-muted-foreground">NFT 状态：</span>
            <span className="text-primary font-medium">🌱 守望者种子：孕育中</span>
          </div>

          {/* Countdown */}
          <div className="flex items-center gap-2 bg-muted rounded-lg p-2">
            <Timer className="w-4 h-4 text-primary" />
            <span className="text-sm text-muted-foreground">
              距离开奖还有 
              <span className="font-bold text-foreground ml-1">
                {countdown.days} 天 {countdown.hours} 小时
              </span>
            </span>
          </div>

          {/* My Bet Info */}
          <div className="flex items-center justify-between text-sm pt-2 border-t border-border/50">
            <div className="flex items-center gap-3">
              <span className={`px-2 py-0.5 rounded text-xs font-semibold ${
                bet.position === "yes" ? "bg-accent/20 text-accent" : "bg-destructive/20 text-destructive"
              }`}>
                {bet.position.toUpperCase()}
              </span>
              <span className="text-muted-foreground">
                ${bet.amount} @ {odds.toFixed(2)}x
              </span>
            </div>
            <span className="font-semibold text-foreground">
              ~$<AnimatedCounter value={Math.round(bet.amount * odds)} />
            </span>
          </div>
        </div>
      </AccordionContent>
    </AccordionItem>
  );
};

// Settled Bet Card Component
const SettledBetCard = ({ bet }: { bet: BetRecord }) => {
  const status = statusConfig[bet.status as BetStatus] || statusConfig.pending;
  const isWon = bet.status === "won";
  const profitLoss = isWon && bet.payout ? bet.payout - bet.amount : -bet.amount;
  
  const totalPool = (bet.markets?.yes_pool || 0) + (bet.markets?.no_pool || 0);
  const contribution = Math.round(bet.amount * 0.01);

  return (
    <AccordionItem value={bet.id} className="border-0">
      <AccordionTrigger className="p-3 bg-muted/50 rounded-xl hover:bg-muted transition-colors hover:no-underline data-[state=open]:rounded-b-none">
        <div className="flex items-start justify-between w-full pr-2">
          <div className="text-left">
            <p className="font-medium text-foreground">
              {bet.markets?.city} ({bet.markets?.province}) · {bet.markets?.weather_condition}
            </p>
            <p className="text-xs text-muted-foreground">{new Date(bet.created_at).toLocaleDateString("zh-CN")}</p>
          </div>
          <div className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${status.className}`}>
            {status.icon}
            {status.label}
          </div>
        </div>
      </AccordionTrigger>
      <AccordionContent className="bg-muted/30 rounded-b-xl px-3 pb-3 pt-0">
        <div className="space-y-4 pt-3 border-t border-border/50">
          {/* Final Result */}
          <div className="bg-card rounded-lg p-3 text-center border border-border/50">
            <p className="text-xs text-muted-foreground mb-1">博弈结果</p>
            <p className="text-2xl font-bold">
              {bet.markets?.result === "yes" ? "✅ YES" : bet.markets?.result === "no" ? "❌ NO" : "-"}
            </p>
          </div>

          {/* Final Fund Distribution */}
          <div>
            <p className="text-xs text-muted-foreground mb-2">最终资金分配</p>
            <div className="grid grid-cols-2 gap-2">
              <div className="bg-muted rounded-lg p-2 text-center">
                <p className="text-xs text-muted-foreground mb-1">奖金池总额</p>
                <p className="font-bold text-foreground">
                  $<AnimatedCounter value={totalPool} />
                </p>
              </div>
              <div className={`rounded-lg p-2 text-center ${isWon ? 'bg-accent/10' : 'bg-destructive/10'}`}>
                <p className={`text-xs mb-1 ${isWon ? 'text-accent' : 'text-destructive'}`}>您的盈亏</p>
                <p className={`font-bold ${isWon ? 'text-accent' : 'text-destructive'}`}>
                  {isWon ? '+' : ''}{profitLoss.toFixed(0)} USDC
                </p>
              </div>
            </div>
          </div>

          {/* Social Impact */}
          <div className="bg-primary/5 rounded-lg p-3 border border-primary/20">
            <div className="flex items-center gap-2 text-primary mb-2">
              <Heart className="w-4 h-4" />
              <span className="text-xs font-semibold">确定性贡献 (Social Impact)</span>
            </div>
            <p className="text-sm font-medium text-foreground mb-1">
              此单已为该地灾后救助贡献了 
              <span className="font-bold text-primary"> ${contribution} USDC</span>
            </p>
          </div>

          {/* NFT Evolution Status */}
          <div className="flex items-center gap-2 text-sm">
            <Sparkles className="w-4 h-4 text-primary" />
            <span className="text-muted-foreground">NFT 状态：</span>
            {isWon ? (
              <span className="text-accent font-medium">🌻 息壤勋章：已点亮</span>
            ) : (
              <span className="text-muted-foreground font-medium">🌱 守望者种子：待进化</span>
            )}
          </div>

          {/* My Bet Info */}
          <div className="flex items-center justify-between text-sm pt-2 border-t border-border/50">
            <div className="flex items-center gap-3">
              <span className={`px-2 py-0.5 rounded text-xs font-semibold ${
                bet.position === "yes" ? "bg-accent/20 text-accent" : "bg-destructive/20 text-destructive"
              }`}>
                {bet.position.toUpperCase()}
              </span>
              <span className="text-muted-foreground">
                ${bet.amount}
              </span>
            </div>
            <span className={`font-semibold ${isWon ? 'text-accent' : 'text-destructive'}`}>
              {isWon ? `+$${bet.payout?.toFixed(0) || 0}` : `-$${bet.amount}`}
            </span>
          </div>

          {/* Claim Button (only for won bets) */}
          {isWon && (
            <Button className="w-full bg-accent hover:bg-accent/90 text-accent-foreground font-medium">
              <Gift className="w-4 h-4 mr-2" />
              提取奖金并同步勋章
            </Button>
          )}
        </div>
      </AccordionContent>
    </AccordionItem>
  );
};

export default HistoryDrawer;
