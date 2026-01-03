import { useState, useEffect } from "react";
import { Heart, Users, MapPin, Coins, Loader2 } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import AnimatedCounter from "./AnimatedCounter";
import { supabase } from "@/integrations/supabase/client";

interface CharityDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface CharityRecord {
  id: string;
  amount: number;
  recipient_name: string | null;
  status: string;
  distributed_at: string | null;
  created_at: string;
}

const CharityDrawer = ({ open, onOpenChange }: CharityDrawerProps) => {
  const [records, setRecords] = useState<CharityRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [totalPool, setTotalPool] = useState(0);
  const [totalDistributed, setTotalDistributed] = useState(0);

  useEffect(() => {
    const fetchRecords = async () => {
      const { data, error } = await supabase
        .from("charity_pool")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(10);

      if (!error && data) {
        setRecords(data);
        
        // Calculate totals
        const pending = data.filter(r => r.status === "pending").reduce((sum, r) => sum + r.amount, 0);
        const distributed = data.filter(r => r.status === "distributed").reduce((sum, r) => sum + r.amount, 0);
        setTotalPool(pending + distributed);
        setTotalDistributed(distributed);
      }
      setIsLoading(false);
    };

    if (open) {
      fetchRecords();
    }
  }, [open]);

  const distributedRecords = records.filter(r => r.status === "distributed" && r.recipient_name);

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-md bg-card border-border overflow-y-auto">
        <SheetHeader className="pb-4">
          <SheetTitle className="flex items-center gap-2 font-serif text-xl">
            <Heart className="w-5 h-5 text-primary" />
            公益资金池
          </SheetTitle>
          <SheetDescription>
            博弈手续费的 1% 自动注入此资金池，用于农业灾害救助
          </SheetDescription>
        </SheetHeader>

        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-6 h-6 animate-spin text-primary" />
          </div>
        ) : (
          <div className="space-y-6">
            {/* Total Pool */}
            <div className="gradient-earth rounded-2xl p-6 text-center shadow-medium">
              <div className="flex items-center justify-center gap-2 text-primary-foreground/80 mb-2">
                <Coins className="w-5 h-5" />
                <span className="text-sm font-medium">资金池总额</span>
              </div>
              <p className="text-4xl font-serif font-bold text-primary-foreground">
                $<AnimatedCounter value={totalPool} decimals={2} />
              </p>
              <p className="text-sm text-primary-foreground/70 mt-1">
                ≈ ¥{(totalPool * 7.2).toFixed(0)} CNY
              </p>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-secondary/50 rounded-xl p-4 text-center">
                <Coins className="w-5 h-5 mx-auto mb-1 text-secondary-foreground" />
                <p className="text-2xl font-bold text-foreground">
                  $<AnimatedCounter value={totalDistributed} decimals={0} />
                </p>
                <p className="text-xs text-muted-foreground">已发放</p>
              </div>
              <div className="bg-secondary/50 rounded-xl p-4 text-center">
                <MapPin className="w-5 h-5 mx-auto mb-1 text-secondary-foreground" />
                <p className="text-2xl font-bold text-foreground">{distributedRecords.length}</p>
                <p className="text-xs text-muted-foreground">受助节点</p>
              </div>
            </div>

            {/* Recipients List */}
            <div>
              <h3 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
                <span>受助节点名单</span>
                <span className="text-xs font-normal text-muted-foreground">
                  (已拨付)
                </span>
              </h3>
              {distributedRecords.length > 0 ? (
                <div className="space-y-2">
                  {distributedRecords.map((record) => (
                    <div
                      key={record.id}
                      className="flex items-center justify-between p-3 bg-muted/50 rounded-xl hover:bg-muted transition-colors"
                    >
                      <div>
                        <p className="text-sm font-medium text-foreground">
                          {record.recipient_name}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {record.distributed_at 
                            ? new Date(record.distributed_at).toLocaleDateString("zh-CN")
                            : new Date(record.created_at).toLocaleDateString("zh-CN")}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-semibold text-accent">
                          +${record.amount.toFixed(0)}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          ¥{(record.amount * 7.2).toFixed(0)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <Heart className="w-12 h-12 mx-auto mb-3 opacity-30" />
                  <p>暂无已发放记录</p>
                  <p className="text-sm">资金池正在积累中</p>
                </div>
              )}
            </div>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
};

export default CharityDrawer;
