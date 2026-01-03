import { History, Clock, CheckCircle2, XCircle, TrendingUp, Users, Sparkles, Timer, Gift, Heart } from "lucide-react";
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
import { Progress } from "@/components/ui/progress";
import AnimatedCounter from "./AnimatedCounter";
import { useState, useEffect } from "react";

interface HistoryDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

type BetStatus = "pending" | "won" | "lost";

interface BetRecord {
  id: string;
  province: string;
  city: string;
  weather: string;
  stance: "yes" | "no";
  amount: number;
  odds: number;
  date: string;
  status: BetStatus;
  // Active bet details
  yesPool?: number;
  noPool?: number;
  participants?: number;
  endDate?: string;
  // Settled bet details
  finalResult?: string;
  finalResultIcon?: string;
  totalPool?: number;
  contribution?: number;
  recipientAddress?: string;
  nftEvolved?: boolean;
}

const bets: BetRecord[] = [
  {
    id: "1",
    province: "河南",
    city: "驻马店",
    weather: "干旱",
    stance: "yes",
    amount: 100,
    odds: 2.35,
    date: "2026-01-08",
    status: "pending",
    yesPool: 12450,
    noPool: 8320,
    participants: 156,
    endDate: "2026-01-11T00:00:00",
  },
  {
    id: "2",
    province: "广东",
    city: "湛江",
    weather: "台风",
    stance: "no",
    amount: 50,
    odds: 1.85,
    date: "2026-01-05",
    status: "pending",
    yesPool: 8900,
    noPool: 11200,
    participants: 89,
    endDate: "2026-01-15T00:00:00",
  },
  {
    id: "3",
    province: "山东",
    city: "济南",
    weather: "晴天",
    stance: "yes",
    amount: 200,
    odds: 1.45,
    date: "2025-12-28",
    status: "won",
    finalResult: "晴朗",
    finalResultIcon: "☀️",
    totalPool: 18500,
    contribution: 29,
    recipientAddress: "济南市历城区农业互助社",
    nftEvolved: false,
  },
  {
    id: "4",
    province: "湖北",
    city: "武汉",
    weather: "洪涝",
    stance: "yes",
    amount: 75,
    odds: 3.20,
    date: "2025-12-20",
    status: "lost",
    finalResult: "正常降雨",
    finalResultIcon: "🌧️",
    totalPool: 24300,
    contribution: 11,
    recipientAddress: "武汉市江夏区灾后援助基金",
    nftEvolved: false,
  },
  {
    id: "5",
    province: "陕西",
    city: "西安",
    weather: "干旱",
    stance: "yes",
    amount: 150,
    odds: 2.10,
    date: "2025-12-15",
    status: "won",
    finalResult: "干旱",
    finalResultIcon: "🔴",
    totalPool: 32100,
    contribution: 48,
    recipientAddress: "西安市长安区抗旱救助站",
    nftEvolved: true,
  },
];

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

const HistoryDrawer = ({ open, onOpenChange }: HistoryDrawerProps) => {
  const pendingBets = bets.filter((b) => b.status === "pending");
  const settledBets = bets.filter((b) => b.status !== "pending");

  const totalWinnings = bets
    .filter((b) => b.status === "won")
    .reduce((sum, b) => sum + b.amount * b.odds, 0);

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
      </SheetContent>
    </Sheet>
  );
};

// Active Bet Card Component
const ActiveBetCard = ({ bet }: { bet: BetRecord }) => {
  const status = statusConfig[bet.status];
  const [countdown, setCountdown] = useState({ days: 0, hours: 0 });
  
  const yesPool = bet.yesPool || 0;
  const noPool = bet.noPool || 0;
  const totalPool = yesPool + noPool;
  const yesPercentage = totalPool > 0 ? (yesPool / totalPool) * 100 : 50;
  
  const estimatedContribution = Math.round(bet.amount * 0.15);

  useEffect(() => {
    if (!bet.endDate) return;
    
    const calculateCountdown = () => {
      const end = new Date(bet.endDate!).getTime();
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
  }, [bet.endDate]);

  return (
    <AccordionItem value={bet.id} className="border-0">
      <AccordionTrigger className="p-3 bg-muted/50 rounded-xl hover:bg-muted transition-colors hover:no-underline data-[state=open]:rounded-b-none">
        <div className="flex items-start justify-between w-full pr-2">
          <div className="text-left">
            <p className="font-medium text-foreground">
              {bet.city} ({bet.province}) · {bet.weather}
            </p>
            <p className="text-xs text-muted-foreground">{bet.date}</p>
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
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Users className="w-3 h-3" />
              <span>已有 {bet.participants} 位守望者加入</span>
            </div>
          </div>

          {/* Odds Bar */}
          <div>
            <p className="text-xs text-muted-foreground mb-2">实时赔率比例</p>
            <div className="relative h-3 bg-muted rounded-full overflow-hidden">
              <div 
                className="absolute left-0 top-0 h-full bg-accent transition-all duration-500"
                style={{ width: `${yesPercentage}%` }}
              />
              <div 
                className="absolute right-0 top-0 h-full bg-destructive transition-all duration-500"
                style={{ width: `${100 - yesPercentage}%` }}
              />
            </div>
            <div className="flex justify-between text-xs mt-1">
              <span className="text-accent">{yesPercentage.toFixed(1)}% YES</span>
              <span className="text-destructive">{(100 - yesPercentage).toFixed(1)}% NO</span>
            </div>
          </div>

          {/* My Contribution Estimate */}
          <div className="bg-primary/5 rounded-lg p-3">
            <div className="flex items-center gap-2 text-primary mb-1">
              <Heart className="w-4 h-4" />
              <span className="text-xs font-medium">我的预估贡献</span>
            </div>
            <p className="text-sm text-foreground">
              若博弈成功，您将为<span className="font-semibold text-primary">{bet.city}</span>贡献约 
              <span className="font-bold text-primary"> ${estimatedContribution} USDC</span> 公益金
            </p>
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
                bet.stance === "yes" ? "bg-accent/20 text-accent" : "bg-destructive/20 text-destructive"
              }`}>
                {bet.stance.toUpperCase()}
              </span>
              <span className="text-muted-foreground">
                ${bet.amount} @ {bet.odds}x
              </span>
            </div>
            <span className="font-semibold text-foreground">
              ~$<AnimatedCounter value={Math.round(bet.amount * bet.odds)} />
            </span>
          </div>
        </div>
      </AccordionContent>
    </AccordionItem>
  );
};

// Settled Bet Card Component
const SettledBetCard = ({ bet }: { bet: BetRecord }) => {
  const status = statusConfig[bet.status];
  const isWon = bet.status === "won";
  const profitLoss = isWon ? bet.amount * bet.odds - bet.amount : -bet.amount;

  return (
    <AccordionItem value={bet.id} className="border-0">
      <AccordionTrigger className="p-3 bg-muted/50 rounded-xl hover:bg-muted transition-colors hover:no-underline data-[state=open]:rounded-b-none">
        <div className="flex items-start justify-between w-full pr-2">
          <div className="text-left">
            <p className="font-medium text-foreground">
              {bet.city} ({bet.province}) · {bet.weather}
            </p>
            <p className="text-xs text-muted-foreground">{bet.date}</p>
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
              {bet.finalResultIcon} {bet.finalResult}
            </p>
          </div>

          {/* Final Fund Distribution */}
          <div>
            <p className="text-xs text-muted-foreground mb-2">最终资金分配</p>
            <div className="grid grid-cols-2 gap-2">
              <div className="bg-muted rounded-lg p-2 text-center">
                <p className="text-xs text-muted-foreground mb-1">奖金池总额</p>
                <p className="font-bold text-foreground">
                  $<AnimatedCounter value={bet.totalPool || 0} />
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
              <span className="font-bold text-primary"> ${bet.contribution} USDC</span>
            </p>
            <p className="text-xs text-muted-foreground">
              这笔资金已拨付至 <span className="text-foreground">{bet.recipientAddress}</span> 白名单地址
            </p>
          </div>

          {/* NFT Evolution Status */}
          <div className="flex items-center gap-2 text-sm">
            <Sparkles className="w-4 h-4 text-primary" />
            <span className="text-muted-foreground">NFT 状态：</span>
            {bet.nftEvolved ? (
              <span className="text-accent font-medium">🌻 息壤勋章：已点亮</span>
            ) : (
              <span className="text-muted-foreground font-medium">🌱 守望者种子：待进化</span>
            )}
          </div>

          {/* My Bet Info */}
          <div className="flex items-center justify-between text-sm pt-2 border-t border-border/50">
            <div className="flex items-center gap-3">
              <span className={`px-2 py-0.5 rounded text-xs font-semibold ${
                bet.stance === "yes" ? "bg-accent/20 text-accent" : "bg-destructive/20 text-destructive"
              }`}>
                {bet.stance.toUpperCase()}
              </span>
              <span className="text-muted-foreground">
                ${bet.amount} @ {bet.odds}x
              </span>
            </div>
            <span className={`font-semibold ${isWon ? 'text-accent' : 'text-destructive'}`}>
              {isWon ? `+$${(bet.amount * bet.odds).toFixed(0)}` : `-$${bet.amount}`}
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
