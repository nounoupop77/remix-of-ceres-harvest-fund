import { useState } from "react";
import { Wallet, ChevronDown, LogOut, Copy, ExternalLink, AlertTriangle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useWallet } from "@/hooks/useWallet";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";

const WalletButton = () => {
  const {
    isConnected,
    address,
    shortAddress,
    balance,
    usdcBalance,
    isCorrectNetwork,
    isConnecting,
    error,
    connect,
    disconnect,
    switchToSepolia,
  } = useWallet();

  const [isOpen, setIsOpen] = useState(false);

  const handleConnect = async () => {
    try {
      await connect();
    } catch (err: any) {
      toast.error(err.message || "连接钱包失败");
    }
  };

  const handleCopyAddress = () => {
    if (address) {
      navigator.clipboard.writeText(address);
      toast.success("地址已复制到剪贴板");
    }
  };

  const handleViewOnExplorer = () => {
    if (address) {
      window.open(`https://sepolia.etherscan.io/address/${address}`, "_blank");
    }
  };

  const handleDisconnect = () => {
    disconnect();
    setIsOpen(false);
    toast.success("钱包已断开连接");
  };

  const handleSwitchNetwork = async () => {
    await switchToSepolia();
    toast.success("已切换到 Sepolia 测试网");
  };

  if (!isConnected) {
    return (
      <Button
        variant="wallet"
        size="sm"
        className="gap-2"
        onClick={handleConnect}
        disabled={isConnecting}
      >
        {isConnecting ? (
          <>
            <RefreshCw className="w-4 h-4 animate-spin" />
            <span className="hidden sm:inline">连接中...</span>
          </>
        ) : (
          <>
            <Wallet className="w-4 h-4" />
            <span className="hidden sm:inline">连接钱包</span>
          </>
        )}
      </Button>
    );
  }

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button
          variant="wallet"
          size="sm"
          className="gap-2"
        >
          <AnimatePresence mode="wait">
            {!isCorrectNetwork ? (
              <motion.div
                key="warning"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0 }}
              >
                <AlertTriangle className="w-4 h-4 text-destructive" />
              </motion.div>
            ) : (
              <motion.div
                key="wallet"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0 }}
                className="w-2 h-2 rounded-full bg-accent"
              />
            )}
          </AnimatePresence>
          <span className="hidden sm:inline font-mono text-sm">{shortAddress}</span>
          <ChevronDown className="w-3 h-3" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-64 bg-card border-border">
        {/* Network Warning */}
        {!isCorrectNetwork && (
          <>
            <div className="p-3 bg-destructive/10 rounded-md mx-2 my-2">
              <div className="flex items-center gap-2 text-destructive mb-2">
                <AlertTriangle className="w-4 h-4" />
                <span className="text-sm font-medium">网络错误</span>
              </div>
              <p className="text-xs text-muted-foreground mb-2">
                请切换到 Sepolia 测试网
              </p>
              <Button
                size="sm"
                variant="outline"
                className="w-full"
                onClick={handleSwitchNetwork}
              >
                切换网络
              </Button>
            </div>
            <DropdownMenuSeparator />
          </>
        )}

        {/* Balance Display */}
        <div className="p-3 space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-xs text-muted-foreground">ETH 余额</span>
            <span className="text-sm font-medium">{balance || "0"} ETH</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-xs text-muted-foreground">USDC 余额</span>
            <span className="text-sm font-medium text-accent">{usdcBalance || "0"} USDC</span>
          </div>
        </div>

        <DropdownMenuSeparator />

        {/* Actions */}
        <DropdownMenuItem onClick={handleCopyAddress} className="gap-2 cursor-pointer">
          <Copy className="w-4 h-4" />
          复制地址
        </DropdownMenuItem>
        <DropdownMenuItem onClick={handleViewOnExplorer} className="gap-2 cursor-pointer">
          <ExternalLink className="w-4 h-4" />
          在区块浏览器查看
        </DropdownMenuItem>

        <DropdownMenuSeparator />

        <DropdownMenuItem
          onClick={handleDisconnect}
          className="gap-2 cursor-pointer text-destructive focus:text-destructive"
        >
          <LogOut className="w-4 h-4" />
          断开连接
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default WalletButton;
