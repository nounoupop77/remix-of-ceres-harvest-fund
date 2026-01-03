import { useState, useEffect } from "react";
import { Plus, Loader2, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
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

interface CharityRecord {
  id: string;
  market_id: string | null;
  amount: number;
  recipient_name: string | null;
  recipient_address: string | null;
  status: string;
  distributed_at: string | null;
  created_at: string;
  markets: {
    title: string;
    city: string;
  } | null;
}

const AdminCharityTab = () => {
  const [records, setRecords] = useState<CharityRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    amount: "",
    recipient_name: "",
    recipient_address: "",
  });
  const { toast } = useToast();

  const fetchRecords = async () => {
    const { data, error } = await supabase
      .from("charity_pool")
      .select(`
        *,
        markets (title, city)
      `)
      .order("created_at", { ascending: false });

    if (error) {
      toast({
        title: "获取失败",
        description: error.message,
        variant: "destructive",
      });
    } else {
      setRecords((data as unknown as CharityRecord[]) || []);
    }
    setIsLoading(false);
  };

  useEffect(() => {
    fetchRecords();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const { error } = await supabase.from("charity_pool").insert({
      amount: parseFloat(formData.amount),
      recipient_name: formData.recipient_name || null,
      recipient_address: formData.recipient_address || null,
    });

    if (error) {
      toast({ title: "创建失败", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "创建成功" });
      fetchRecords();
    }

    setIsDialogOpen(false);
    setFormData({ amount: "", recipient_name: "", recipient_address: "" });
  };

  const handleDistribute = async (id: string) => {
    const { error } = await supabase
      .from("charity_pool")
      .update({
        status: "distributed",
        distributed_at: new Date().toISOString(),
      })
      .eq("id", id);

    if (error) {
      toast({ title: "操作失败", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "已标记为已发放" });
      fetchRecords();
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return <Badge variant="outline">待发放</Badge>;
      case "distributed":
        return <Badge className="bg-accent text-accent-foreground">已发放</Badge>;
      case "cancelled":
        return <Badge variant="destructive">已取消</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  const totalPending = records
    .filter((r) => r.status === "pending")
    .reduce((sum, r) => sum + r.amount, 0);

  const totalDistributed = records
    .filter((r) => r.status === "distributed")
    .reduce((sum, r) => sum + r.amount, 0);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Stats */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-card/50 rounded-xl border border-border p-4">
          <p className="text-sm text-muted-foreground">待发放总额</p>
          <p className="text-2xl font-bold text-foreground">
            ${totalPending.toFixed(2)}
          </p>
        </div>
        <div className="bg-card/50 rounded-xl border border-border p-4">
          <p className="text-sm text-muted-foreground">已发放总额</p>
          <p className="text-2xl font-bold text-accent">
            ${totalDistributed.toFixed(2)}
          </p>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-foreground">公益资金记录</h2>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button variant="wallet" size="sm" className="gap-2">
              <Plus className="w-4 h-4" />
              添加记录
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>添加公益资金记录</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="amount">金额 (USDC)</Label>
                <Input
                  id="amount"
                  type="number"
                  step="0.01"
                  value={formData.amount}
                  onChange={(e) =>
                    setFormData({ ...formData, amount: e.target.value })
                  }
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="recipient_name">接收方名称</Label>
                <Input
                  id="recipient_name"
                  value={formData.recipient_name}
                  onChange={(e) =>
                    setFormData({ ...formData, recipient_name: e.target.value })
                  }
                  placeholder="例如：河南省周口市某村委会"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="recipient_address">接收方地址</Label>
                <Input
                  id="recipient_address"
                  value={formData.recipient_address}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      recipient_address: e.target.value,
                    })
                  }
                  placeholder="0x..."
                />
              </div>
              <Button type="submit" variant="wallet" className="w-full">
                创建
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="bg-card/50 rounded-xl border border-border overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>金额</TableHead>
              <TableHead>关联市场</TableHead>
              <TableHead>接收方</TableHead>
              <TableHead>状态</TableHead>
              <TableHead>发放时间</TableHead>
              <TableHead>操作</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {records.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={6}
                  className="text-center py-8 text-muted-foreground"
                >
                  暂无公益资金记录
                </TableCell>
              </TableRow>
            ) : (
              records.map((record) => (
                <TableRow key={record.id}>
                  <TableCell className="font-bold text-primary">
                    ${record.amount}
                  </TableCell>
                  <TableCell>
                    {record.markets ? (
                      <div>
                        <p className="text-sm">{record.markets.title}</p>
                        <p className="text-xs text-muted-foreground">
                          {record.markets.city}
                        </p>
                      </div>
                    ) : (
                      <span className="text-muted-foreground">-</span>
                    )}
                  </TableCell>
                  <TableCell>
                    {record.recipient_name ? (
                      <div>
                        <p className="text-sm">{record.recipient_name}</p>
                        <p className="text-xs text-muted-foreground font-mono">
                          {record.recipient_address?.slice(0, 10)}...
                        </p>
                      </div>
                    ) : (
                      <span className="text-muted-foreground">未指定</span>
                    )}
                  </TableCell>
                  <TableCell>{getStatusBadge(record.status)}</TableCell>
                  <TableCell className="text-xs text-muted-foreground">
                    {record.distributed_at
                      ? new Date(record.distributed_at).toLocaleDateString(
                          "zh-CN"
                        )
                      : "-"}
                  </TableCell>
                  <TableCell>
                    {record.status === "pending" && (
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDistribute(record.id)}
                        title="标记为已发放"
                      >
                        <CheckCircle className="w-4 h-4 text-accent" />
                      </Button>
                    )}
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

export default AdminCharityTab;
