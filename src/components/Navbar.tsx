import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Heart, History, Sprout, Leaf } from "lucide-react";
import { Button } from "@/components/ui/button";
import AnimatedCounter from "@/components/AnimatedCounter";
import WalletButton from "@/components/WalletButton";

interface NavbarProps {
  onOpenCharity: () => void;
  onOpenHistory: () => void;
  charityPoolAmount?: number;
  charityButtonRef?: React.RefObject<HTMLButtonElement>;
}

const Navbar = ({
  onOpenCharity,
  onOpenHistory,
  charityPoolAmount = 0,
  charityButtonRef
}: NavbarProps) => {
  const navigate = useNavigate();

  return (
    <motion.nav
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      className="fixed top-0 left-0 right-0 z-50 glass border-b border-border/50"
    >
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        {/* Logo */}
        <div className="flex items-center gap-2">
          <motion.div
            initial={{ rotate: -180, scale: 0 }}
            animate={{ rotate: 0, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.2, type: "spring" }}
            className="w-10 h-10 rounded-xl gradient-earth flex items-center justify-center shadow-soft"
          >
            <Sprout className="w-5 h-5 text-primary-foreground" />
          </motion.div>
          <div className="flex flex-col">
            <span className="font-serif text-xl font-semibold text-foreground">
              Ceres · 息壤
            </span>
            <span className="text-[10px] text-muted-foreground -mt-0.5">
              以金融之息，养万物之壤。
            </span>
          </div>
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-2">
          {/* Admin Button */}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate("/admin-login")}
            className="hidden sm:flex text-muted-foreground hover:text-foreground hover:bg-secondary"
          >
            <Leaf className="w-4 h-4" />
          </Button>

          <Button
            ref={charityButtonRef}
            variant="ghost"
            size="sm"
            onClick={onOpenCharity}
            className="hidden sm:flex gap-2 text-muted-foreground hover:text-foreground hover:bg-secondary relative overflow-hidden"
          >
            <Heart className="w-4 h-4" />
            <span>公益资金池</span>
            {charityPoolAmount > 0 && (
              <motion.span
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="ml-1 text-xs font-semibold text-accent"
              >
                $<AnimatedCounter value={charityPoolAmount} decimals={2} />
              </motion.span>
            )}
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
            onClick={() => navigate("/admin-login")}
            className="sm:hidden text-muted-foreground hover:text-foreground"
          >
            <Leaf className="w-4 h-4" />
          </Button>

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

          <WalletButton />
        </div>
      </div>
    </motion.nav>
  );
};

export default Navbar;