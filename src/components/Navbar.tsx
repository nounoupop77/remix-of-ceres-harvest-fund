import { Wallet, Heart, History, Sprout } from "lucide-react";
import { Button } from "@/components/ui/button";

interface NavbarProps {
  onOpenCharity: () => void;
  onOpenHistory: () => void;
}

const Navbar = ({ onOpenCharity, onOpenHistory }: NavbarProps) => {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 glass border-b border-border/50">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        {/* Logo */}
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 rounded-xl gradient-earth flex items-center justify-center shadow-soft">
            <Sprout className="w-5 h-5 text-primary-foreground" />
          </div>
          <div className="flex flex-col">
            <span className="font-serif text-xl font-semibold text-foreground">
              Ceres · 息壤
            </span>
            <span className="text-[10px] text-muted-foreground -mt-0.5">
              Gamble for Greed, Pay for Need
            </span>
          </div>
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={onOpenCharity}
            className="hidden sm:flex gap-2 text-muted-foreground hover:text-foreground hover:bg-secondary"
          >
            <Heart className="w-4 h-4" />
            <span>公益资金池</span>
          </Button>

          <Button
            variant="ghost"
            size="sm"
            onClick={onOpenHistory}
            className="hidden sm:flex gap-2 text-muted-foreground hover:text-foreground hover:bg-secondary"
          >
            <History className="w-4 h-4" />
            <span>我的博弈</span>
          </Button>

          {/* Mobile icons */}
          <Button
            variant="ghost"
            size="icon"
            onClick={onOpenCharity}
            className="sm:hidden text-muted-foreground hover:text-foreground"
          >
            <Heart className="w-4 h-4" />
          </Button>

          <Button
            variant="ghost"
            size="icon"
            onClick={onOpenHistory}
            className="sm:hidden text-muted-foreground hover:text-foreground"
          >
            <History className="w-4 h-4" />
          </Button>

          <Button
            variant="wallet"
            size="sm"
            className="gap-2"
          >
            <Wallet className="w-4 h-4" />
            <span className="hidden sm:inline">连接钱包</span>
          </Button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
