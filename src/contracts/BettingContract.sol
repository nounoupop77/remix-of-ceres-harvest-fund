// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

/**
 * @title CeresBetting
 * @dev 天气预测博弈合约 - 使用 USDC 进行投注
 * 
 * 部署步骤:
 * 1. 在 Remix (remix.ethereum.org) 中编译此合约
 * 2. 选择 Sepolia 网络
 * 3. 部署时传入 USDC 地址: 0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238
 * 4. 部署时传入慈善钱包地址 (用于接收 1% 捐赠)
 * 5. 复制部署后的合约地址到前端配置
 */
contract CeresBetting is Ownable, ReentrancyGuard {
    IERC20 public usdcToken;
    address public charityWallet;
    uint256 public charityPercent = 100; // 1% = 100 basis points
    uint256 public constant BASIS_POINTS = 10000;

    struct Bet {
        address bettor;
        uint256 amount;
        bool isYes;
        bool claimed;
    }

    struct Market {
        string marketId;
        uint256 yesPool;
        uint256 noPool;
        bool resolved;
        bool result; // true = YES wins, false = NO wins
        uint256 charityContribution;
    }

    // marketId => Market
    mapping(string => Market) public markets;
    
    // marketId => bettor => Bet[]
    mapping(string => mapping(address => Bet[])) public userBets;
    
    // marketId => total bettors count
    mapping(string => uint256) public marketBettorCount;

    event BetPlaced(
        address indexed bettor,
        string marketId,
        bool isYes,
        uint256 amount,
        uint256 charityAmount
    );

    event MarketResolved(
        string marketId,
        bool result,
        uint256 totalPool
    );

    event WinningsClaimed(
        address indexed bettor,
        string marketId,
        uint256 amount
    );

    event CharityWithdrawn(
        address indexed to,
        uint256 amount
    );

    constructor(address _usdcToken, address _charityWallet) {
        usdcToken = IERC20(_usdcToken);
        charityWallet = _charityWallet;
    }

    /**
     * @dev 下注 - 用户需要先 approve USDC
     * @param marketId 市场 ID
     * @param isYes 是否押 YES
     * @param amount USDC 数量 (6 位小数)
     */
    function placeBet(
        string calldata marketId,
        bool isYes,
        uint256 amount
    ) external nonReentrant {
        require(amount > 0, "Amount must be greater than 0");
        require(!markets[marketId].resolved, "Market already resolved");

        // Calculate charity contribution (1%)
        uint256 charityAmount = (amount * charityPercent) / BASIS_POINTS;
        uint256 betAmount = amount - charityAmount;

        // Transfer USDC from user
        require(
            usdcToken.transferFrom(msg.sender, address(this), amount),
            "USDC transfer failed"
        );

        // Transfer charity portion
        if (charityAmount > 0) {
            require(
                usdcToken.transfer(charityWallet, charityAmount),
                "Charity transfer failed"
            );
        }

        // Update market pools
        Market storage market = markets[marketId];
        if (bytes(market.marketId).length == 0) {
            market.marketId = marketId;
        }

        if (isYes) {
            market.yesPool += betAmount;
        } else {
            market.noPool += betAmount;
        }
        market.charityContribution += charityAmount;

        // Record bet
        userBets[marketId][msg.sender].push(Bet({
            bettor: msg.sender,
            amount: betAmount,
            isYes: isYes,
            claimed: false
        }));

        marketBettorCount[marketId]++;

        emit BetPlaced(msg.sender, marketId, isYes, betAmount, charityAmount);
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
        Market storage market = markets[marketId];
        require(!market.resolved, "Already resolved");
        require(
            market.yesPool > 0 || market.noPool > 0,
            "No bets placed"
        );

        market.resolved = true;
        market.result = result;

        emit MarketResolved(
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
        Market storage market = markets[marketId];
        require(market.resolved, "Market not resolved");

        Bet[] storage bets = userBets[marketId][msg.sender];
        require(bets.length > 0, "No bets found");

        uint256 totalPayout = 0;
        uint256 totalPool = market.yesPool + market.noPool;
        uint256 winningPool = market.result ? market.yesPool : market.noPool;

        for (uint256 i = 0; i < bets.length; i++) {
            Bet storage bet = bets[i];
            if (!bet.claimed && bet.isYes == market.result) {
                // Calculate payout: (bet amount / winning pool) * total pool
                uint256 payout = (bet.amount * totalPool) / winningPool;
                totalPayout += payout;
                bet.claimed = true;
            }
        }

        require(totalPayout > 0, "No winnings to claim");
        require(
            usdcToken.transfer(msg.sender, totalPayout),
            "Payout transfer failed"
        );

        emit WinningsClaimed(msg.sender, marketId, totalPayout);
    }

    /**
     * @dev 获取市场信息
     */
    function getMarketPool(string calldata marketId)
        external
        view
        returns (uint256 yesPool, uint256 noPool)
    {
        Market storage market = markets[marketId];
        return (market.yesPool, market.noPool);
    }

    /**
     * @dev 获取用户在某市场的投注
     */
    function getUserBets(string calldata marketId, address user)
        external
        view
        returns (Bet[] memory)
    {
        return userBets[marketId][user];
    }

    /**
     * @dev 更新慈善钱包地址
     */
    function setCharityWallet(address _charityWallet) external onlyOwner {
        charityWallet = _charityWallet;
    }

    /**
     * @dev 更新慈善捐赠比例 (basis points, 100 = 1%)
     */
    function setCharityPercent(uint256 _percent) external onlyOwner {
        require(_percent <= 1000, "Max 10%");
        charityPercent = _percent;
    }
}
