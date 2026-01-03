import { Heart, AlertTriangle, Users, MapPin, Coins } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

interface CharityDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const recipients = [
  { name: "河南周口·张庄村合作社", amount: 45000, date: "2025-12-28" },
  { name: "山东德州·绿洲救援队", amount: 32000, date: "2025-12-25" },
  { name: "陕西渭南·旱区互助会", amount: 28000, date: "2025-12-20" },
  { name: "浙江温州·台风应急队", amount: 56000, date: "2025-12-15" },
  { name: "湖北荆州·防汛指挥部", amount: 41000, date: "2025-12-10" },
];

const CharityDrawer = ({ open, onOpenChange }: CharityDrawerProps) => {
  const { toast } = useToast();

  const handleSimulateDisaster = () => {
    toast({
      title: "⚠️ 灾难模拟触发",
      description: "已向河南周口·张庄村合作社拨付 ¥45,000 救灾资金",
      duration: 5000,
    });
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-md bg-card border-border overflow-y-auto">
        <SheetHeader className="pb-4">
          <SheetTitle className="flex items-center gap-2 font-serif text-xl">
            <Heart className="w-5 h-5 text-primary" />
            公益资金池
          </SheetTitle>
          <SheetDescription>
            博弈手续费的 2% 自动注入此资金池，用于农业灾害救助
          </SheetDescription>
        </SheetHeader>

        <div className="space-y-6">
          {/* Total Pool */}
          <div className="gradient-earth rounded-2xl p-6 text-center shadow-medium">
            <div className="flex items-center justify-center gap-2 text-primary-foreground/80 mb-2">
              <Coins className="w-5 h-5" />
              <span className="text-sm font-medium">资金池总额</span>
            </div>
            <p className="text-4xl font-serif font-bold text-primary-foreground">
              $2,847,560
            </p>
            <p className="text-sm text-primary-foreground/70 mt-1">
              ≈ ¥20,502,432 CNY
            </p>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-secondary/50 rounded-xl p-4 text-center">
              <Users className="w-5 h-5 mx-auto mb-1 text-secondary-foreground" />
              <p className="text-2xl font-bold text-foreground">1,247</p>
              <p className="text-xs text-muted-foreground">受助农户</p>
            </div>
            <div className="bg-secondary/50 rounded-xl p-4 text-center">
              <MapPin className="w-5 h-5 mx-auto mb-1 text-secondary-foreground" />
              <p className="text-2xl font-bold text-foreground">89</p>
              <p className="text-xs text-muted-foreground">覆盖地区</p>
            </div>
          </div>

          {/* Recipients List */}
          <div>
            <h3 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
              <span>受助节点名单</span>
              <span className="text-xs font-normal text-muted-foreground">
                (近期拨付)
              </span>
            </h3>
            <div className="space-y-2">
              {recipients.map((recipient, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-3 bg-muted/50 rounded-xl hover:bg-muted transition-colors"
                >
                  <div>
                    <p className="text-sm font-medium text-foreground">
                      {recipient.name}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {recipient.date}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold text-accent">
                      +${(recipient.amount / 7.2).toFixed(0)}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      ¥{recipient.amount.toLocaleString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* God Mode Button */}
          <div className="pt-4 border-t border-border">
            <p className="text-xs text-muted-foreground text-center mb-3">
              演示模式：模拟灾害发生并触发资金赔付
            </p>
            <Button
              variant="destructive"
              className="w-full h-12 text-base font-semibold gap-2"
              onClick={handleSimulateDisaster}
            >
              <AlertTriangle className="w-5 h-5" />
              ⚠️ 模拟灾难触发
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default CharityDrawer;
