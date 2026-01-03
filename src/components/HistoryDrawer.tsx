import { History, Clock, CheckCircle2, XCircle, TrendingUp } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";

interface HistoryDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

type BetStatus = "pending" | "won" | "lost";

interface BetRecord {
  id: string;
  province: string;
  weather: string;
  stance: "yes" | "no";
  amount: number;
  odds: number;
  date: string;
  status: BetStatus;
}

const bets: BetRecord[] = [
  {
    id: "1",
    province: "河南",
    weather: "干旱",
    stance: "yes",
    amount: 100,
    odds: 2.35,
    date: "2026-01-08",
    status: "pending",
  },
  {
    id: "2",
    province: "浙江",
    weather: "台风",
    stance: "no",
    amount: 50,
    odds: 1.85,
    date: "2026-01-05",
    status: "pending",
  },
  {
    id: "3",
    province: "山东",
    weather: "晴天",
    stance: "yes",
    amount: 200,
    odds: 1.45,
    date: "2025-12-28",
    status: "won",
  },
  {
    id: "4",
    province: "湖北",
    weather: "洪涝",
    stance: "yes",
    amount: 75,
    odds: 3.20,
    date: "2025-12-20",
    status: "lost",
  },
  {
    id: "5",
    province: "陕西",
    weather: "干旱",
    stance: "yes",
    amount: 150,
    odds: 2.10,
    date: "2025-12-15",
    status: "won",
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
                +${totalWinnings.toFixed(0)}
              </p>
            </div>
            <div className="bg-destructive/10 rounded-xl p-4">
              <div className="flex items-center gap-2 text-destructive mb-1">
                <XCircle className="w-4 h-4" />
                <span className="text-xs font-medium">总损失</span>
              </div>
              <p className="text-xl font-bold text-destructive">
                -${totalLosses.toFixed(0)}
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
              <div className="space-y-2">
                {pendingBets.map((bet) => (
                  <BetCard key={bet.id} bet={bet} />
                ))}
              </div>
            </div>
          )}

          {/* Settled Bets */}
          {settledBets.length > 0 && (
            <div>
              <h3 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-muted-foreground" />
                已结算 ({settledBets.length})
              </h3>
              <div className="space-y-2">
                {settledBets.map((bet) => (
                  <BetCard key={bet.id} bet={bet} />
                ))}
              </div>
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

const BetCard = ({ bet }: { bet: BetRecord }) => {
  const status = statusConfig[bet.status];

  return (
    <div className="p-3 bg-muted/50 rounded-xl hover:bg-muted transition-colors">
      <div className="flex items-start justify-between mb-2">
        <div>
          <p className="font-medium text-foreground">
            {bet.province} · {bet.weather}
          </p>
          <p className="text-xs text-muted-foreground">{bet.date}</p>
        </div>
        <div
          className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${status.className}`}
        >
          {status.icon}
          {status.label}
        </div>
      </div>
      <div className="flex items-center justify-between text-sm">
        <div className="flex items-center gap-3">
          <span
            className={`px-2 py-0.5 rounded text-xs font-semibold ${
              bet.stance === "yes"
                ? "bg-accent/20 text-accent"
                : "bg-destructive/20 text-destructive"
            }`}
          >
            {bet.stance.toUpperCase()}
          </span>
          <span className="text-muted-foreground">
            ${bet.amount} @ {bet.odds}x
          </span>
        </div>
        <span
          className={`font-semibold ${
            bet.status === "won"
              ? "text-accent"
              : bet.status === "lost"
              ? "text-destructive"
              : "text-foreground"
          }`}
        >
          {bet.status === "won"
            ? `+$${(bet.amount * bet.odds).toFixed(0)}`
            : bet.status === "lost"
            ? `-$${bet.amount}`
            : `~$${(bet.amount * bet.odds).toFixed(0)}`}
        </span>
      </div>
    </div>
  );
};

export default HistoryDrawer;
