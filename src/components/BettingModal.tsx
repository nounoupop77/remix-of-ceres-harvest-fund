import { useState } from "react";
import { Sun, CloudRain, Flame, Waves, Wind, Sprout, TrendingUp } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Province, WeatherType } from "./ChinaMap";
interface BettingModalProps {
  province: Province | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}
const weatherOptions: {
  type: WeatherType;
  icon: React.ReactNode;
  label: string;
}[] = [{
  type: "sunny",
  icon: <Sun className="w-5 h-5" />,
  label: "晴天"
}, {
  type: "rain",
  icon: <CloudRain className="w-5 h-5" />,
  label: "小雨"
}, {
  type: "drought",
  icon: <Flame className="w-5 h-5" />,
  label: "干旱"
}, {
  type: "flood",
  icon: <Waves className="w-5 h-5" />,
  label: "洪涝"
}, {
  type: "typhoon",
  icon: <Wind className="w-5 h-5" />,
  label: "台风"
}];
const quickAmounts = [10, 50, 100, 500];
const BettingModal = ({
  province,
  open,
  onOpenChange
}: BettingModalProps) => {
  const [selectedWeather, setSelectedWeather] = useState<WeatherType>("drought");
  const [stance, setStance] = useState<"yes" | "no">("yes");
  const [amount, setAmount] = useState("");
  if (!province) return null;
  const numAmount = parseFloat(amount) || 0;
  const odds = stance === "yes" ? 2.35 : 1.85;
  const potentialWin = numAmount * odds;
  const yesPool = 65;
  const noPool = 35;
  const handleConfirm = () => {
    // Simulate bet confirmation
    onOpenChange(false);
  };
  return <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md bg-card border-border shadow-medium">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3 text-xl">
            <span className="font-serif">{province.name}</span>
            <span className="text-sm font-normal text-muted-foreground px-2 py-0.5 bg-muted rounded-full">
              {province.crop}
            </span>
          </DialogTitle>
          <p className="text-sm text-muted-foreground">
            目标日期：<span className="font-medium text-foreground">2026年1月11日</span>
          </p>
        </DialogHeader>

        <div className="space-y-5 pt-2">
          {/* Weather Selection */}
          <div>
            <label className="text-sm font-medium text-foreground mb-2 block">
              选择天气预测
            </label>
            <div className="grid grid-cols-5 gap-2">
              {weatherOptions.map(option => <button key={option.type} onClick={() => setSelectedWeather(option.type)} className={`
                    flex flex-col items-center gap-1 p-2.5 rounded-xl border-2 transition-all
                    ${selectedWeather === option.type ? "border-primary bg-primary/10 shadow-soft" : "border-border hover:border-primary/50 hover:bg-muted/50"}
                  `}>
                  <div className={`
                    p-1.5 rounded-lg
                    ${option.type === "sunny" ? "bg-weather-sunny/30" : option.type === "rain" ? "bg-weather-rain/30" : option.type === "drought" ? "bg-weather-drought/30" : option.type === "flood" ? "bg-weather-flood/30" : "bg-weather-typhoon/30"}
                  `}>
                    {option.icon}
                  </div>
                  <span className="text-[10px] font-medium">{option.label}</span>
                </button>)}
            </div>
          </div>

          {/* Stance Toggle */}
          <div>
            <label className="text-sm font-medium text-foreground mb-2 block">
              您的立场
            </label>
            <div className="flex gap-2">
              <button onClick={() => setStance("yes")} className={`
                  flex-1 py-3 rounded-xl font-semibold text-sm transition-all
                  ${stance === "yes" ? "bg-accent text-accent-foreground shadow-soft" : "bg-muted text-muted-foreground hover:bg-accent/20"}
                `}>
                ✓ YES - 会发生
              </button>
              <button onClick={() => setStance("no")} className={`
                  flex-1 py-3 rounded-xl font-semibold text-sm transition-all
                  ${stance === "no" ? "bg-destructive text-destructive-foreground shadow-soft" : "bg-muted text-muted-foreground hover:bg-destructive/20"}
                `}>
                ✗ NO - 不会发生
              </button>
            </div>
          </div>

          {/* Amount Input */}
          <div>
            <label className="text-sm font-medium text-foreground mb-2 block">
              下注金额 (USDC)
            </label>
            <Input type="number" placeholder="输入金额..." value={amount} onChange={e => setAmount(e.target.value)} className="h-12 text-lg bg-background border-border" />
            <div className="flex gap-2 mt-2">
              {quickAmounts.map(amt => <button key={amt} onClick={() => setAmount(amt.toString())} className="flex-1 py-1.5 text-sm font-medium rounded-lg bg-muted hover:bg-secondary transition-colors">
                  ${amt}
                </button>)}
            </div>
          </div>

          {/* Market Preview Card */}
          <div className="bg-muted/50 rounded-xl p-4 border border-border">
            <div className="flex items-center gap-2 mb-3">
              <TrendingUp className="w-4 h-4 text-accent" />
              <span className="text-sm font-medium">市场预览</span>
            </div>

            {/* Pool Distribution Bar */}
            <div className="mb-3">
              <div className="flex justify-between text-xs mb-1">
                <span className="text-accent">YES {yesPool}%</span>
                <span className="text-destructive">NO {noPool}%</span>
              </div>
              <div className="h-2 rounded-full overflow-hidden flex bg-background">
                <div className="bg-accent transition-all" style={{
                width: `${yesPool}%`
              }} />
                <div className="bg-destructive transition-all" style={{
                width: `${noPool}%`
              }} />
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
                  +${potentialWin.toFixed(2)}
                </p>
              </div>
            </div>

            {/* Charity Note */}
            <div className="mt-3 pt-3 border-t border-border flex items-center gap-2">
              <Sprout className="w-4 h-4 text-accent" />
              <span className="text-xs text-accent font-medium">🌱 1% 手续费将捐赠给助农资金池</span>
            </div>
          </div>

          {/* Confirm Button */}
          <Button onClick={handleConfirm} disabled={numAmount <= 0} className="w-full h-12 text-base font-semibold" variant="default">
            确认下注 (Confirm Bet)
          </Button>
        </div>
      </DialogContent>
    </Dialog>;
};
export default BettingModal;