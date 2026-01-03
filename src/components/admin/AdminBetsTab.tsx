import { useState, useEffect } from "react";
import { Loader2 } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface Bet {
  id: string;
  user_id: string;
  market_id: string;
  position: string;
  amount: number;
  status: string;
  payout: number | null;
  created_at: string;
  markets: {
    title: string;
    city: string;
  } | null;
  profiles: {
    email: string | null;
  } | null;
}

const AdminBetsTab = () => {
  const [bets, setBets] = useState<Bet[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const fetchBets = async () => {
      const { data, error } = await supabase
        .from("bets")
        .select(`
          *,
          markets (title, city),
          profiles!bets_user_id_fkey (email)
        `)
        .order("created_at", { ascending: false });

      if (error) {
        toast({
          title: "获取失败",
          description: error.message,
          variant: "destructive",
        });
      } else {
        setBets((data as unknown as Bet[]) || []);
      }
      setIsLoading(false);
    };

    fetchBets();
  }, [toast]);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return <Badge variant="outline">进行中</Badge>;
      case "won":
        return <Badge className="bg-accent text-accent-foreground">获胜</Badge>;
      case "lost":
        return <Badge variant="destructive">失败</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  const getPositionBadge = (position: string) => {
    return position === "yes" ? (
      <Badge variant="outline" className="border-accent text-accent">
        YES
      </Badge>
    ) : (
      <Badge variant="outline" className="border-destructive text-destructive">
        NO
      </Badge>
    );
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-foreground">用户博弈记录</h2>
        <p className="text-sm text-muted-foreground">共 {bets.length} 条记录</p>
      </div>

      <div className="bg-card/50 rounded-xl border border-border overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>用户</TableHead>
              <TableHead>市场</TableHead>
              <TableHead>持仓</TableHead>
              <TableHead>金额</TableHead>
              <TableHead>状态</TableHead>
              <TableHead>盈亏</TableHead>
              <TableHead>时间</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {bets.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={7}
                  className="text-center py-8 text-muted-foreground"
                >
                  暂无博弈记录
                </TableCell>
              </TableRow>
            ) : (
              bets.map((bet) => (
                <TableRow key={bet.id}>
                  <TableCell className="font-mono text-xs">
                    {bet.profiles?.email || bet.user_id.slice(0, 8) + "..."}
                  </TableCell>
                  <TableCell>
                    <div>
                      <p className="font-medium text-sm">
                        {bet.markets?.title || "未知市场"}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {bet.markets?.city}
                      </p>
                    </div>
                  </TableCell>
                  <TableCell>{getPositionBadge(bet.position)}</TableCell>
                  <TableCell className="font-semibold">
                    ${bet.amount}
                  </TableCell>
                  <TableCell>{getStatusBadge(bet.status)}</TableCell>
                  <TableCell>
                    {bet.payout !== null ? (
                      <span
                        className={
                          bet.payout > bet.amount
                            ? "text-accent font-semibold"
                            : "text-destructive font-semibold"
                        }
                      >
                        {bet.payout > bet.amount ? "+" : ""}
                        ${(bet.payout - bet.amount).toFixed(2)}
                      </span>
                    ) : (
                      <span className="text-muted-foreground">-</span>
                    )}
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground">
                    {new Date(bet.created_at).toLocaleDateString("zh-CN")}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default AdminBetsTab;
