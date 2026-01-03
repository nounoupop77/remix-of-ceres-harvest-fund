// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title CeresBetting
 * @dev 天气预测博弈合约 - 使用 USDC 进行投注
 * 
 * 部署步骤:
 * 1. 在 Remix (remix.ethereum.org) 中编译此合约
 * 2. 选择 Sepolia 网络，编译器版本 0.8.20
 * 3. 部署时传入:
 *    - _usdcToken: 0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238 (Sepolia USDC)
 *    - _charityWallet: 您的慈善钱包地址
 * 4. 复制部署后的合约地址到前端 BETTING_CONTRACT_ADDRESS
 * 
 * 使用流程:
 * 1. 用户先调用 USDC.approve(本合约地址, 金额) 授权
 * 2. 用户调用 placeBet(marketId, isYes, amount) 下注
 * 3. 管理员调用 resolveMarket(marketId, result) 结算
 * 4. 胜者调用 claimWinnings(marketId) 领奖
 */

// 简化版 IERC20 接口
interface IERC20 {
    function totalSupply() external view returns (uint256);
    function balanceOf(address account) external view returns (uint256);
    function transfer(address to, uint256 amount) external returns (bool);
    function allowance(address owner, address spender) external view returns (uint256);
    function approve(address spender, uint256 amount) external returns (bool);
    function transferFrom(address from, address to, uint256 amount) external returns (bool);
    function decimals() external view returns (uint8);
}

contract CeresBetting {
    // 状态变量
    IERC20 public immutable usdcToken;
    address public owner;
    address public charityWallet;
    uint256 public charityBasisPoints = 100; // 1% = 100 基点
    uint256 public constant BASIS_POINTS_TOTAL = 10000;

    // 防重入锁
    bool private locked;

    // 投注结构
    struct Bet {
        address bettor;
        uint256 amount;
        bool isYes;
        bool claimed;
    }

    // 市场结构
    struct Market {
        bool exists;
        uint256 yesPool;
        uint256 noPool;
        uint256 charityContribution;
        bool resolved;
        bool result; // true = YES 赢, false = NO 赢
    }

    // 映射
    mapping(bytes32 => Market) public markets;
    mapping(bytes32 => mapping(address => Bet[])) public userBets;

    // 事件
    event BetPlaced(
        address indexed bettor,
        bytes32 indexed marketHash,
        string marketId,
        bool isYes,
        uint256 betAmount,
        uint256 charityAmount
    );

    event MarketResolved(
        bytes32 indexed marketHash,
        string marketId,
        bool result,
        uint256 totalPool
    );

    event WinningsClaimed(
        address indexed bettor,
        bytes32 indexed marketHash,
        uint256 amount
    );

    event CharityWalletUpdated(address indexed oldWallet, address indexed newWallet);
    event OwnershipTransferred(address indexed previousOwner, address indexed newOwner);

    // 修饰器
    modifier onlyOwner() {
        require(msg.sender == owner, "Not owner");
        _;
    }

    modifier nonReentrant() {
        require(!locked, "Reentrant call");
        locked = true;
        _;
        locked = false;
    }

    /**
     * @dev 构造函数
     * @param _usdcToken USDC 代币地址 (Sepolia: 0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238)
     * @param _charityWallet 慈善钱包地址
     */
    constructor(address _usdcToken, address _charityWallet) {
        require(_usdcToken != address(0), "Invalid USDC address");
        require(_charityWallet != address(0), "Invalid charity address");
        
        usdcToken = IERC20(_usdcToken);
        charityWallet = _charityWallet;
        owner = msg.sender;
    }

    /**
     * @dev 下注函数 - 用户需先 approve USDC 给本合约
     * @param marketId 市场 ID 字符串
     * @param isYes 是否押 YES (true) 或 NO (false)
     * @param amount USDC 数量 (6 位小数，例如 10 USDC = 10000000)
     */
    function placeBet(
        string calldata marketId,
        bool isYes,
        uint256 amount
    ) external nonReentrant {
        require(amount > 0, "Amount must be > 0");
        require(bytes(marketId).length > 0, "Invalid marketId");
        
        bytes32 marketHash = keccak256(bytes(marketId));
        Market storage market = markets[marketHash];
        
        require(!market.resolved, "Market resolved");

        // 计算慈善捐赠 (1%)
        uint256 charityAmount = (amount * charityBasisPoints) / BASIS_POINTS_TOTAL;
        uint256 betAmount = amount - charityAmount;

        // 检查授权额度
        uint256 allowance = usdcToken.allowance(msg.sender, address(this));
        require(allowance >= amount, "Insufficient allowance");

        // 检查余额
        uint256 balance = usdcToken.balanceOf(msg.sender);
        require(balance >= amount, "Insufficient balance");

        // 从用户转入 USDC
        bool success = usdcToken.transferFrom(msg.sender, address(this), amount);
        require(success, "Transfer failed");

        // 转慈善部分到慈善钱包
        if (charityAmount > 0) {
            bool charitySuccess = usdcToken.transfer(charityWallet, charityAmount);
            require(charitySuccess, "Charity transfer failed");
        }

        // 初始化或更新市场
        if (!market.exists) {
            market.exists = true;
        }

        // 更新池子
        if (isYes) {
            market.yesPool += betAmount;
        } else {
            market.noPool += betAmount;
        }
        market.charityContribution += charityAmount;

        // 记录投注
        userBets[marketHash][msg.sender].push(Bet({
            bettor: msg.sender,
            amount: betAmount,
            isYes: isYes,
            claimed: false
        }));

        emit BetPlaced(msg.sender, marketHash, marketId, isYes, betAmount, charityAmount);
    }

    /**
     * @dev 管理员结算市场
     * @param marketId 市场 ID
     * @param result true = YES 赢, false = NO 赢
     */
    function resolveMarket(
        string calldata marketId,
        bool result
    ) external onlyOwner {
        bytes32 marketHash = keccak256(bytes(marketId));
        Market storage market = markets[marketHash];
        
        require(market.exists, "Market not found");
        require(!market.resolved, "Already resolved");
        require(market.yesPool > 0 || market.noPool > 0, "No bets");

        market.resolved = true;
        market.result = result;

        emit MarketResolved(
            marketHash,
            marketId,
            result,
            market.yesPool + market.noPool
        );
    }

    /**
     * @dev 用户领取奖金
     * @param marketId 市场 ID
     */
    function claimWinnings(string calldata marketId) external nonReentrant {
        bytes32 marketHash = keccak256(bytes(marketId));
        Market storage market = markets[marketHash];
        
        require(market.resolved, "Not resolved");

        Bet[] storage bets = userBets[marketHash][msg.sender];
        require(bets.length > 0, "No bets");

        uint256 totalPayout = 0;
        uint256 totalPool = market.yesPool + market.noPool;
        uint256 winningPool = market.result ? market.yesPool : market.noPool;

        require(winningPool > 0, "No winning pool");

        for (uint256 i = 0; i < bets.length; i++) {
            Bet storage bet = bets[i];
            if (!bet.claimed && bet.isYes == market.result) {
                // 计算收益: (下注金额 / 赢家池) * 总池
                uint256 payout = (bet.amount * totalPool) / winningPool;
                totalPayout += payout;
                bet.claimed = true;
            }
        }

        require(totalPayout > 0, "No winnings");
        
        bool success = usdcToken.transfer(msg.sender, totalPayout);
        require(success, "Payout failed");

        emit WinningsClaimed(msg.sender, marketHash, totalPayout);
    }

    // ============ 查询函数 ============

    /**
     * @dev 获取市场池信息
     */
    function getMarketPool(string calldata marketId)
        external
        view
        returns (
            uint256 yesPool,
            uint256 noPool,
            bool resolved,
            bool result
        )
    {
        bytes32 marketHash = keccak256(bytes(marketId));
        Market storage market = markets[marketHash];
        return (market.yesPool, market.noPool, market.resolved, market.result);
    }

    /**
     * @dev 获取用户在某市场的投注数量
     */
    function getUserBetCount(string calldata marketId, address user)
        external
        view
        returns (uint256)
    {
        bytes32 marketHash = keccak256(bytes(marketId));
        return userBets[marketHash][user].length;
    }

    /**
     * @dev 获取用户某笔投注详情
     */
    function getUserBetAt(string calldata marketId, address user, uint256 index)
        external
        view
        returns (uint256 amount, bool isYes, bool claimed)
    {
        bytes32 marketHash = keccak256(bytes(marketId));
        Bet storage bet = userBets[marketHash][user][index];
        return (bet.amount, bet.isYes, bet.claimed);
    }

    // ============ 管理函数 ============

    /**
     * @dev 更新慈善钱包地址
     */
    function setCharityWallet(address _charityWallet) external onlyOwner {
        require(_charityWallet != address(0), "Invalid address");
        address oldWallet = charityWallet;
        charityWallet = _charityWallet;
        emit CharityWalletUpdated(oldWallet, _charityWallet);
    }

    /**
     * @dev 更新慈善捐赠比例 (基点，100 = 1%)
     */
    function setCharityBasisPoints(uint256 _basisPoints) external onlyOwner {
        require(_basisPoints <= 1000, "Max 10%");
        charityBasisPoints = _basisPoints;
    }

    /**
     * @dev 转移所有权
     */
    function transferOwnership(address newOwner) external onlyOwner {
        require(newOwner != address(0), "Invalid owner");
        address oldOwner = owner;
        owner = newOwner;
        emit OwnershipTransferred(oldOwner, newOwner);
    }

    /**
     * @dev 紧急提取 (仅限 owner)
     */
    function emergencyWithdraw(address token, uint256 amount) external onlyOwner {
        if (token == address(0)) {
            payable(owner).transfer(amount);
        } else {
            IERC20(token).transfer(owner, amount);
        }
    }

    receive() external payable {}
}
