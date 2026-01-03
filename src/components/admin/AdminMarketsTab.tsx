import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Plus,
  Pencil,
  Trash2,
  CheckCircle,
  XCircle,
  Loader2,
  MapPin,
  Maximize2,
  X,
} from "lucide-react";
import chinaFarmlandMap from "@/assets/china-farmland-map.png";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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

interface Market {
  id: string;
  title: string;
  description: string | null;
  city: string;
  province: string;
  weather_condition: string;
  start_date: string;
  end_date: string;
  status: string;
  result: string | null;
  yes_pool: number;
  no_pool: number;
  charity_contribution: number;
  created_at: string;
  position_top: string | null;
  position_left: string | null;
  crop: string | null;
}

const AdminMarketsTab = () => {
  const [markets, setMarkets] = useState<Market[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingMarket, setEditingMarket] = useState<Market | null>(null);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    city: "",
    province: "",
    end_date: "",
    position_top: "",
    position_left: "",
    crop: "",
  });
  const [isMapDialogOpen, setIsMapDialogOpen] = useState(false);
  const { toast } = useToast();

  const fetchMarkets = async () => {
    const { data, error } = await supabase
      .from("markets")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      toast({
        title: "获取失败",
        description: error.message,
        variant: "destructive",
      });
    } else {
      setMarkets(data || []);
    }
    setIsLoading(false);
  };

  useEffect(() => {
    fetchMarkets();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const payload = {
      title: formData.title,
      description: formData.description || null,
      city: formData.city,
      province: formData.province,
      weather_condition: "pending", // 用户下注时选择天气
      end_date: formData.end_date,
      position_top: formData.position_top || null,
      position_left: formData.position_left || null,
      crop: formData.crop || null,
    };

    if (editingMarket) {
      const { error } = await supabase
        .from("markets")
        .update(payload)
        .eq("id", editingMarket.id);

      if (error) {
        toast({ title: "更新失败", description: error.message, variant: "destructive" });
      } else {
        toast({ title: "更新成功" });
        fetchMarkets();
      }
    } else {
      const { error } = await supabase.from("markets").insert(payload);

      if (error) {
        toast({ title: "创建失败", description: error.message, variant: "destructive" });
      } else {
        toast({ title: "创建成功" });
        fetchMarkets();
      }
    }

    setIsDialogOpen(false);
    setEditingMarket(null);
    setFormData({
      title: "",
      description: "",
      city: "",
      province: "",
      end_date: "",
      position_top: "",
      position_left: "",
      crop: "",
    });
  };

  const handleEdit = (market: Market) => {
    setEditingMarket(market);
    setFormData({
      title: market.title,
      description: market.description || "",
      city: market.city,
      province: market.province,
      end_date: market.end_date.split("T")[0],
      position_top: market.position_top || "",
      position_left: market.position_left || "",
      crop: market.crop || "",
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("确定删除此市场？")) return;

    const { error } = await supabase.from("markets").delete().eq("id", id);

    if (error) {
      toast({ title: "删除失败", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "删除成功" });
      fetchMarkets();
    }
  };

  const handleSettle = async (marketId: string, result: "yes" | "no") => {
    const { error } = await supabase
      .from("markets")
      .update({ status: "settled", result })
      .eq("id", marketId);

    if (error) {
      toast({ title: "结算失败", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "结算成功" });
      fetchMarkets();
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return <Badge variant="default" className="bg-accent">进行中</Badge>;
      case "settled":
        return <Badge variant="secondary">已结算</Badge>;
      case "cancelled":
        return <Badge variant="destructive">已取消</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  const weatherConditions = [
    { value: "sunny", label: "晴天" },
    { value: "rain", label: "小雨" },
    { value: "drought", label: "干旱" },
    { value: "flood", label: "洪涝" },
    { value: "typhoon", label: "台风" },
    { value: "frost", label: "霜冻" },
    { value: "heatwave", label: "高温" },
    { value: "storm", label: "暴风雨" },
  ];

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
        <h2 className="text-xl font-semibold text-foreground">博弈市场管理</h2>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button
              variant="wallet"
              size="sm"
              className="gap-2"
              onClick={() => {
                setEditingMarket(null);
                setFormData({
                  title: "",
                  description: "",
                  city: "",
                  province: "",
                  end_date: "",
                  position_top: "",
                  position_left: "",
                  crop: "",
                });
              }}
            >
              <Plus className="w-4 h-4" />
              创建市场
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingMarket ? "编辑市场" : "创建新市场"}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">标题</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) =>
                    setFormData({ ...formData, title: e.target.value })
                  }
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">描述</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="province">省份</Label>
                  <Input
                    id="province"
                    value={formData.province}
                    onChange={(e) =>
                      setFormData({ ...formData, province: e.target.value })
                    }
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="city">城市</Label>
                  <Input
                    id="city"
                    value={formData.city}
                    onChange={(e) =>
                      setFormData({ ...formData, city: e.target.value })
                    }
                    required
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="crop">主要作物</Label>
                <Input
                  id="crop"
                  placeholder="如：水稻、小麦、玉米"
                  value={formData.crop}
                  onChange={(e) =>
                    setFormData({ ...formData, crop: e.target.value })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="end_date">结束日期</Label>
                <Input
                  id="end_date"
                  type="date"
                  value={formData.end_date}
                  onChange={(e) =>
                    setFormData({ ...formData, end_date: e.target.value })
                  }
                  required
                />
              </div>
              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <MapPin className="w-4 h-4" />
                  地图坐标
                </Label>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-sm flex-1">
                    {formData.position_top && formData.position_left 
                      ? `Top: ${formData.position_top}, Left: ${formData.position_left}`
                      : "未选择"}
                  </span>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="gap-2"
                    onClick={() => setIsMapDialogOpen(true)}
                  >
                    <Maximize2 className="w-4 h-4" />
                    打开大地图
                  </Button>
                  {formData.position_top && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => setFormData({ ...formData, position_top: "", position_left: "" })}
                    >
                      清除
                    </Button>
                  )}
                </div>
              </div>
              <Button type="submit" variant="wallet" className="w-full">
                {editingMarket ? "保存修改" : "创建"}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="bg-card/50 rounded-xl border border-border overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>标题</TableHead>
              <TableHead>地区</TableHead>
              <TableHead>天气</TableHead>
              <TableHead>资金池</TableHead>
              <TableHead>状态</TableHead>
              <TableHead>操作</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {markets.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                  暂无市场数据
                </TableCell>
              </TableRow>
            ) : (
              markets.map((market) => (
                <TableRow key={market.id}>
                  <TableCell className="font-medium">{market.title}</TableCell>
                  <TableCell>
                    {market.province} · {market.city}
                  </TableCell>
                  <TableCell>{market.weather_condition}</TableCell>
                  <TableCell>
                    <div className="text-xs">
                      <span className="text-accent">YES: ${market.yes_pool}</span>
                      <br />
                      <span className="text-destructive">NO: ${market.no_pool}</span>
                    </div>
                  </TableCell>
                  <TableCell>{getStatusBadge(market.status)}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      {market.status === "active" && (
                        <>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleSettle(market.id, "yes")}
                            title="结算 YES"
                          >
                            <CheckCircle className="w-4 h-4 text-accent" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleSettle(market.id, "no")}
                            title="结算 NO"
                          >
                            <XCircle className="w-4 h-4 text-destructive" />
                          </Button>
                        </>
                      )}
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleEdit(market)}
                      >
                        <Pencil className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDelete(market.id)}
                      >
                        <Trash2 className="w-4 h-4 text-destructive" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
      {/* Full Screen Map Dialog */}
      <Dialog open={isMapDialogOpen} onOpenChange={setIsMapDialogOpen}>
        <DialogContent className="max-w-[95vw] w-[95vw] h-[90vh] p-0">
          <div className="relative w-full h-full flex flex-col">
            <div className="flex items-center justify-between p-4 border-b border-border bg-background">
              <div className="flex items-center gap-3">
                <MapPin className="w-5 h-5 text-primary" />
                <span className="font-semibold">选择地图坐标</span>
                <span className="text-sm text-muted-foreground">
                  点击地图上的位置来设置市场坐标
                </span>
              </div>
              <div className="flex items-center gap-2">
                {formData.position_top && formData.position_left && (
                  <span className="text-sm font-mono bg-muted px-3 py-1 rounded">
                    Top: {formData.position_top}, Left: {formData.position_left}
                  </span>
                )}
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setIsMapDialogOpen(false)}
                >
                  <X className="w-5 h-5" />
                </Button>
              </div>
            </div>
            <div 
              className="flex-1 relative cursor-crosshair bg-muted/30 overflow-hidden flex justify-center items-center"
            >
              <div 
                className="relative w-full max-w-[65rem] aspect-[4/3]"
                onClick={(e) => {
                  const rect = e.currentTarget.getBoundingClientRect();
                  const x = ((e.clientX - rect.left) / rect.width) * 100;
                  const y = ((e.clientY - rect.top) / rect.height) * 100;
                  setFormData({
                    ...formData,
                    position_top: `${y.toFixed(2)}%`,
                    position_left: `${x.toFixed(2)}%`,
                  });
                }}
              >
                <img
                  src={chinaFarmlandMap}
                  alt="China Map"
                  className="w-full h-full object-contain scale-[1.3] origin-center"
                  style={{ filter: "brightness(0.96) sepia(0.05)" }}
                  draggable={false}
                />
                {formData.position_top && formData.position_left && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute w-7 h-7 bg-primary rounded-full border-2 border-background shadow-lg flex items-center justify-center"
                    style={{
                      top: formData.position_top,
                      left: formData.position_left,
                      transform: "translate(-50%, -50%)",
                    }}
                  >
                    <MapPin className="w-4 h-4 text-primary-foreground" />
                  </motion.div>
                )}
              </div>
            </div>
            <div className="p-4 border-t border-border bg-background flex justify-end gap-2">
              <Button variant="outline" onClick={() => setIsMapDialogOpen(false)}>
                取消
              </Button>
              <Button 
                variant="wallet" 
                onClick={() => setIsMapDialogOpen(false)}
                disabled={!formData.position_top || !formData.position_left}
              >
                确认位置
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminMarketsTab;
