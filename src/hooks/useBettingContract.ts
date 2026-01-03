import { useState, useCallback } from 'react';
import { Contract, parseUnits, formatUnits } from 'ethers';
import { useWallet } from './useWallet';

// Sepolia USDC 合约地址
const USDC_ADDRESS = '0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238';

// TODO: 部署合约后更新此地址
// 部署步骤：
// 1. 前往 https://remix.ethereum.org
// 2. 創建新文件，複製 src/contracts/CeresBetting.sol 內容
// 3. 編譯器選擇 0.8.20
// 4. 部署到 Sepolia 測試網，傳入參數：
//    - _usdcToken: 0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238
//    - _charityWallet: 您的慈善錢包地址
// 5. 複製部署後的合約地址到下方
export const BETTING_CONTRACT_ADDRESS = '';

// 慈善錢包地址 (接收 1% 捐贈)
export const CHARITY_WALLET_ADDRESS = '';

// 合約 ABI
const BETTING_CONTRACT_ABI = [
  // 下注
  'function placeBet(string calldata marketId, bool isYes, uint256 amount) external',
  // 領獎
  'function claimWinnings(string calldata marketId) external',
  // 查詢市場
  'function getMarketPool(string calldata marketId) external view returns (uint256 yesPool, uint256 noPool, bool resolved, bool result)',
  // 查詢用戶投注數量
  'function getUserBetCount(string calldata marketId, address user) external view returns (uint256)',
  // 查詢用戶投注詳情
  'function getUserBetAt(string calldata marketId, address user, uint256 index) external view returns (uint256 amount, bool isYes, bool claimed)',
  // 事件
  'event BetPlaced(address indexed bettor, bytes32 indexed marketHash, string marketId, bool isYes, uint256 betAmount, uint256 charityAmount)',
  'event WinningsClaimed(address indexed bettor, bytes32 indexed marketHash, uint256 amount)',
];

// ERC20 ABI (用於 USDC 授權)
const ERC20_ABI = [
  'function approve(address spender, uint256 amount) returns (bool)',
  'function allowance(address owner, address spender) view returns (uint256)',
  'function balanceOf(address owner) view returns (uint256)',
  'function decimals() view returns (uint8)',
];

interface UseBettingContractReturn {
  // 下注流程
  placeBet: (marketId: string, isYes: boolean, amountUsdc: number) => Promise<{ success: boolean; txHash?: string; error?: string }>;
  // 領獎
  claimWinnings: (marketId: string) => Promise<{ success: boolean; txHash?: string; error?: string }>;
  // 查詢市場信息
  getMarketInfo: (marketId: string) => Promise<{ yesPool: number; noPool: number; resolved: boolean; result: boolean } | null>;
  // 檢查授權額度
  checkAllowance: (amount: number) => Promise<boolean>;
  // 授權 USDC
  approveUsdc: (amount: number) => Promise<boolean>;
  // 狀態
  isProcessing: boolean;
  currentStep: 'idle' | 'approving' | 'betting' | 'claiming' | 'complete';
  error: string | null;
}

export const useBettingContract = (): UseBettingContractReturn => {
  const wallet = useWallet();
  const [isProcessing, setIsProcessing] = useState(false);
  const [currentStep, setCurrentStep] = useState<'idle' | 'approving' | 'betting' | 'claiming' | 'complete'>('idle');
  const [error, setError] = useState<string | null>(null);

  // 獲取 USDC 合約實例
  const getUsdcContract = useCallback(async () => {
    const signer = await wallet.getSigner();
    if (!signer) throw new Error('無法獲取簽名者');
    return new Contract(USDC_ADDRESS, ERC20_ABI, signer);
  }, [wallet]);

  // 獲取博弈合約實例
  const getBettingContract = useCallback(async () => {
    if (!BETTING_CONTRACT_ADDRESS) {
      throw new Error('博弈合約尚未部署，請先部署合約並更新地址');
    }
    const signer = await wallet.getSigner();
    if (!signer) throw new Error('無法獲取簽名者');
    return new Contract(BETTING_CONTRACT_ADDRESS, BETTING_CONTRACT_ABI, signer);
  }, [wallet]);

  // 檢查 USDC 授權額度
  const checkAllowance = useCallback(async (amountUsdc: number): Promise<boolean> => {
    try {
      if (!BETTING_CONTRACT_ADDRESS) return false;
      
      const usdcContract = await getUsdcContract();
      const decimals = await usdcContract.decimals();
      const allowance = await usdcContract.allowance(wallet.address, BETTING_CONTRACT_ADDRESS);
      const requiredAmount = parseUnits(amountUsdc.toString(), decimals);
      
      return allowance >= requiredAmount;
    } catch (err) {
      console.error('檢查授權失敗:', err);
      return false;
    }
  }, [wallet.address, getUsdcContract]);

  // 授權 USDC
  const approveUsdc = useCallback(async (amountUsdc: number): Promise<boolean> => {
    try {
      if (!BETTING_CONTRACT_ADDRESS) {
        throw new Error('合約地址未設置');
      }

      setCurrentStep('approving');
      const usdcContract = await getUsdcContract();
      const decimals = await usdcContract.decimals();
      const amountWei = parseUnits(amountUsdc.toString(), decimals);
      
      // 授權足夠大的額度，避免頻繁授權
      const approveAmount = amountWei * BigInt(100); // 授權 100 倍金額
      
      const tx = await usdcContract.approve(BETTING_CONTRACT_ADDRESS, approveAmount);
      await tx.wait();
      
      return true;
    } catch (err: any) {
      console.error('授權失敗:', err);
      setError(err.message || '授權失敗');
      return false;
    }
  }, [getUsdcContract]);

  // 下注
  const placeBet = useCallback(async (
    marketId: string,
    isYes: boolean,
    amountUsdc: number
  ): Promise<{ success: boolean; txHash?: string; error?: string }> => {
    setIsProcessing(true);
    setError(null);

    try {
      // 檢查錢包連接
      if (!wallet.isConnected || !wallet.address) {
        throw new Error('請先連接錢包');
      }

      // 檢查網絡
      if (!wallet.isCorrectNetwork) {
        throw new Error('請切換到 Sepolia 測試網');
      }

      // 檢查合約地址
      if (!BETTING_CONTRACT_ADDRESS) {
        throw new Error('博弈合約尚未部署。請在 Remix 中部署 CeresBetting.sol 合約，然後更新 BETTING_CONTRACT_ADDRESS');
      }

      // 檢查餘額
      const usdcBalance = parseFloat(wallet.usdcBalance || '0');
      if (usdcBalance < amountUsdc) {
        throw new Error(`USDC 餘額不足。當前: ${usdcBalance}，需要: ${amountUsdc}`);
      }

      // 檢查授權
      const hasAllowance = await checkAllowance(amountUsdc);
      if (!hasAllowance) {
        setCurrentStep('approving');
        const approved = await approveUsdc(amountUsdc);
        if (!approved) {
          throw new Error('USDC 授權失敗');
        }
      }

      // 下注
      setCurrentStep('betting');
      const bettingContract = await getBettingContract();
      const usdcContract = await getUsdcContract();
      const decimals = await usdcContract.decimals();
      const amountWei = parseUnits(amountUsdc.toString(), decimals);

      const tx = await bettingContract.placeBet(marketId, isYes, amountWei);
      const receipt = await tx.wait();

      setCurrentStep('complete');
      setIsProcessing(false);

      return {
        success: true,
        txHash: receipt.hash,
      };
    } catch (err: any) {
      console.error('下注失敗:', err);
      const errorMessage = err.message || '下注失敗';
      setError(errorMessage);
      setIsProcessing(false);
      setCurrentStep('idle');

      return {
        success: false,
        error: errorMessage,
      };
    }
  }, [wallet, checkAllowance, approveUsdc, getBettingContract, getUsdcContract]);

  // 領獎
  const claimWinnings = useCallback(async (
    marketId: string
  ): Promise<{ success: boolean; txHash?: string; error?: string }> => {
    setIsProcessing(true);
    setError(null);
    setCurrentStep('claiming');

    try {
      if (!wallet.isConnected) {
        throw new Error('請先連接錢包');
      }

      if (!BETTING_CONTRACT_ADDRESS) {
        throw new Error('合約地址未設置');
      }

      const bettingContract = await getBettingContract();
      const tx = await bettingContract.claimWinnings(marketId);
      const receipt = await tx.wait();

      setCurrentStep('complete');
      setIsProcessing(false);

      return {
        success: true,
        txHash: receipt.hash,
      };
    } catch (err: any) {
      console.error('領獎失敗:', err);
      const errorMessage = err.message || '領獎失敗';
      setError(errorMessage);
      setIsProcessing(false);
      setCurrentStep('idle');

      return {
        success: false,
        error: errorMessage,
      };
    }
  }, [wallet, getBettingContract]);

  // 查詢市場信息
  const getMarketInfo = useCallback(async (marketId: string) => {
    try {
      if (!BETTING_CONTRACT_ADDRESS) return null;

      const bettingContract = await getBettingContract();
      const [yesPool, noPool, resolved, result] = await bettingContract.getMarketPool(marketId);

      return {
        yesPool: parseFloat(formatUnits(yesPool, 6)),
        noPool: parseFloat(formatUnits(noPool, 6)),
        resolved,
        result,
      };
    } catch (err) {
      console.error('查詢市場失敗:', err);
      return null;
    }
  }, [getBettingContract]);

  return {
    placeBet,
    claimWinnings,
    getMarketInfo,
    checkAllowance,
    approveUsdc,
    isProcessing,
    currentStep,
    error,
  };
};
