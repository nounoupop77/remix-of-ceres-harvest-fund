import { useState, useCallback, useEffect } from 'react';
import { BrowserProvider, JsonRpcSigner, Contract, parseUnits, formatUnits } from 'ethers';

// Sepolia USDC contract address (official Circle USDC on Sepolia)
const USDC_ADDRESS = '0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238';

// Sepolia chain ID
const SEPOLIA_CHAIN_ID = '0xaa36a7'; // 11155111 in hex

// ERC20 ABI for USDC
const ERC20_ABI = [
  'function balanceOf(address owner) view returns (uint256)',
  'function decimals() view returns (uint8)',
  'function symbol() view returns (string)',
  'function transfer(address to, uint256 amount) returns (bool)',
  'function approve(address spender, uint256 amount) returns (bool)',
  'function allowance(address owner, address spender) view returns (uint256)',
];

// Simple betting contract ABI (to be deployed)
export const BETTING_CONTRACT_ABI = [
  'function placeBet(string marketId, bool isYes, uint256 amount) payable',
  'function claimWinnings(string marketId)',
  'function getMarketPool(string marketId) view returns (uint256 yesPool, uint256 noPool)',
  'event BetPlaced(address indexed bettor, string marketId, bool isYes, uint256 amount)',
  'event WinningsClaimed(address indexed bettor, string marketId, uint256 amount)',
];

interface WalletState {
  isConnected: boolean;
  address: string | null;
  shortAddress: string | null;
  balance: string | null;
  usdcBalance: string | null;
  chainId: string | null;
  isCorrectNetwork: boolean;
  isConnecting: boolean;
  error: string | null;
}

interface UseWalletReturn extends WalletState {
  connect: () => Promise<void>;
  disconnect: () => void;
  switchToSepolia: () => Promise<void>;
  approveUSDC: (spenderAddress: string, amount: string) => Promise<boolean>;
  transferUSDC: (toAddress: string, amount: string) => Promise<string | null>;
  getProvider: () => BrowserProvider | null;
  getSigner: () => Promise<JsonRpcSigner | null>;
  getUSDCContract: () => Promise<Contract | null>;
}

export const useWallet = (): UseWalletReturn => {
  const [state, setState] = useState<WalletState>({
    isConnected: false,
    address: null,
    shortAddress: null,
    balance: null,
    usdcBalance: null,
    chainId: null,
    isCorrectNetwork: false,
    isConnecting: false,
    error: null,
  });

  const getProvider = useCallback((): BrowserProvider | null => {
    if (typeof window !== 'undefined' && window.ethereum) {
      return new BrowserProvider(window.ethereum);
    }
    return null;
  }, []);

  const getSigner = useCallback(async (): Promise<JsonRpcSigner | null> => {
    const provider = getProvider();
    if (provider) {
      return await provider.getSigner();
    }
    return null;
  }, [getProvider]);

  const getUSDCContract = useCallback(async (): Promise<Contract | null> => {
    const signer = await getSigner();
    if (signer) {
      return new Contract(USDC_ADDRESS, ERC20_ABI, signer);
    }
    return null;
  }, [getSigner]);

  const fetchBalances = useCallback(async (address: string) => {
    const provider = getProvider();
    if (!provider) return;

    try {
      // Fetch ETH balance
      const ethBalance = await provider.getBalance(address);
      const formattedEth = formatUnits(ethBalance, 18);

      // Fetch USDC balance
      const usdcContract = await getUSDCContract();
      let formattedUsdc = '0';
      if (usdcContract) {
        const usdcBalance = await usdcContract.balanceOf(address);
        const decimals = await usdcContract.decimals();
        formattedUsdc = formatUnits(usdcBalance, decimals);
      }

      setState(prev => ({
        ...prev,
        balance: parseFloat(formattedEth).toFixed(4),
        usdcBalance: parseFloat(formattedUsdc).toFixed(2),
      }));
    } catch (error) {
      console.error('Error fetching balances:', error);
    }
  }, [getProvider, getUSDCContract]);

  const connect = useCallback(async () => {
    if (typeof window === 'undefined') {
      const msg = '当前环境无法连接钱包';
      setState(prev => ({ ...prev, error: msg, isConnecting: false }));
      throw new Error(msg);
    }

    if (!window.ethereum) {
      const msg =
        '未检测到 MetaMask（如果你在预览框/内嵌页面里打开，请在新窗口打开应用再试）';
      setState(prev => ({ ...prev, error: msg, isConnecting: false }));
      // 尝试打开安装页面（可能会被浏览器拦截）
      window.open('https://metamask.io/download/', '_blank');
      throw new Error(msg);
    }

    setState(prev => ({ ...prev, isConnecting: true, error: null }));

    try {
      const provider = getProvider();
      if (!provider) {
        throw new Error('无法初始化钱包提供者');
      }

      // Request account access
      const accounts = await window.ethereum.request({
        method: 'eth_requestAccounts',
      });

      if (!accounts || accounts.length === 0) {
        throw new Error('未获取到钱包地址');
      }

      const address = accounts[0];
      const shortAddress = `${address.slice(0, 6)}...${address.slice(-4)}`;

      // Get chain ID
      const chainId = await window.ethereum.request({ method: 'eth_chainId' });
      const isCorrectNetwork = chainId === SEPOLIA_CHAIN_ID;

      setState(prev => ({
        ...prev,
        isConnected: true,
        address,
        shortAddress,
        chainId,
        isCorrectNetwork,
        isConnecting: false,
        error: null,
      }));

      // Fetch balances
      await fetchBalances(address);

    } catch (error: any) {
      console.error('Connection error:', error);
      const msg = error?.message || '连接钱包失败';
      setState(prev => ({
        ...prev,
        isConnecting: false,
        error: msg,
      }));
      throw error instanceof Error ? error : new Error(msg);
    }
  }, [getProvider, fetchBalances]);

  const disconnect = useCallback(() => {
    setState({
      isConnected: false,
      address: null,
      shortAddress: null,
      balance: null,
      usdcBalance: null,
      chainId: null,
      isCorrectNetwork: false,
      isConnecting: false,
      error: null,
    });
  }, []);

  const switchToSepolia = useCallback(async () => {
    if (!window.ethereum) return;

    try {
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: SEPOLIA_CHAIN_ID }],
      });
      
      setState(prev => ({ ...prev, chainId: SEPOLIA_CHAIN_ID, isCorrectNetwork: true }));
    } catch (switchError: any) {
      // Chain not added, add it
      if (switchError.code === 4902) {
        try {
          await window.ethereum.request({
            method: 'wallet_addEthereumChain',
            params: [{
              chainId: SEPOLIA_CHAIN_ID,
              chainName: 'Sepolia Testnet',
              nativeCurrency: {
                name: 'Sepolia ETH',
                symbol: 'ETH',
                decimals: 18,
              },
              rpcUrls: ['https://sepolia.infura.io/v3/'],
              blockExplorerUrls: ['https://sepolia.etherscan.io'],
            }],
          });
        } catch (addError) {
          console.error('Failed to add Sepolia network:', addError);
        }
      }
    }
  }, []);

  const approveUSDC = useCallback(async (spenderAddress: string, amount: string): Promise<boolean> => {
    try {
      const usdcContract = await getUSDCContract();
      if (!usdcContract) {
        throw new Error('无法获取 USDC 合约');
      }

      const decimals = await usdcContract.decimals();
      const amountInWei = parseUnits(amount, decimals);
      
      const tx = await usdcContract.approve(spenderAddress, amountInWei);
      await tx.wait();
      
      return true;
    } catch (error: any) {
      console.error('USDC approval error:', error);
      setState(prev => ({ ...prev, error: error.message || '授权失败' }));
      return false;
    }
  }, [getUSDCContract]);

  const transferUSDC = useCallback(async (toAddress: string, amount: string): Promise<string | null> => {
    try {
      const usdcContract = await getUSDCContract();
      if (!usdcContract) {
        throw new Error('无法获取 USDC 合约');
      }

      const decimals = await usdcContract.decimals();
      const amountInWei = parseUnits(amount, decimals);
      
      const tx = await usdcContract.transfer(toAddress, amountInWei);
      const receipt = await tx.wait();
      
      // Refresh balance after transfer
      if (state.address) {
        await fetchBalances(state.address);
      }
      
      return receipt.hash;
    } catch (error: any) {
      console.error('USDC transfer error:', error);
      setState(prev => ({ ...prev, error: error.message || '转账失败' }));
      return null;
    }
  }, [getUSDCContract, state.address, fetchBalances]);

  // Listen for account and chain changes
  useEffect(() => {
    if (typeof window === 'undefined' || !window.ethereum) return;

    const handleAccountsChanged = (accounts: string[]) => {
      if (accounts.length === 0) {
        disconnect();
      } else if (accounts[0] !== state.address) {
        const newAddress = accounts[0];
        const shortAddress = `${newAddress.slice(0, 6)}...${newAddress.slice(-4)}`;
        setState(prev => ({ ...prev, address: newAddress, shortAddress }));
        fetchBalances(newAddress);
      }
    };

    const handleChainChanged = (chainId: string) => {
      const isCorrectNetwork = chainId === SEPOLIA_CHAIN_ID;
      setState(prev => ({ ...prev, chainId, isCorrectNetwork }));
      if (state.address) {
        fetchBalances(state.address);
      }
    };

    window.ethereum.on('accountsChanged', handleAccountsChanged);
    window.ethereum.on('chainChanged', handleChainChanged);

    // Check if already connected
    window.ethereum.request({ method: 'eth_accounts' }).then((accounts: string[]) => {
      if (accounts.length > 0) {
        const address = accounts[0];
        const shortAddress = `${address.slice(0, 6)}...${address.slice(-4)}`;
        window.ethereum.request({ method: 'eth_chainId' }).then((chainId: string) => {
          setState(prev => ({
            ...prev,
            isConnected: true,
            address,
            shortAddress,
            chainId,
            isCorrectNetwork: chainId === SEPOLIA_CHAIN_ID,
          }));
          fetchBalances(address);
        });
      }
    });

    return () => {
      window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
      window.ethereum.removeListener('chainChanged', handleChainChanged);
    };
  }, [state.address, disconnect, fetchBalances]);

  return {
    ...state,
    connect,
    disconnect,
    switchToSepolia,
    approveUSDC,
    transferUSDC,
    getProvider,
    getSigner,
    getUSDCContract,
  };
};

// Type declaration for window.ethereum
declare global {
  interface Window {
    ethereum?: {
      request: (args: { method: string; params?: any[] }) => Promise<any>;
      on: (event: string, callback: (...args: any[]) => void) => void;
      removeListener: (event: string, callback: (...args: any[]) => void) => void;
    };
  }
}
