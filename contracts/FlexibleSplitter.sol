// SPDX-License-Identifier: MIT
pragma solidity ^0.8.25;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

/**
 * @title IAavePool
 * @notice Interface for AAVE Pool
 */
interface IAavePool {
    function supply(
        address asset,
        uint256 amount,
        address onBehalfOf,
        uint16 referralCode
    ) external;
}

/**
 * @title IMorphoVault
 * @notice Interface for Morpho Vault (ERC4626)
 */
interface IMorphoVault {
    function deposit(
        uint256 assets,
        address onBehalf
    ) external returns (uint256 shares);
}

/**
 * @title IUniswapV2Pair
 * @notice Interface for Uniswap V2 Pair
 */
interface IUniswapV2Pair {
    function swap(uint amount0Out, uint amount1Out, address to, bytes calldata data) external;
    function getReserves() external view returns (uint112 reserve0, uint112 reserve1, uint32 blockTimestampLast);
    function token0() external view returns (address);
    function token1() external view returns (address);
}

/**
 * @title FlexibleSplitter
 * @notice Flexible token distribution with multiple recipients and DeFi strategies
 * @dev Supports dynamic recipient configuration with AAVE, Morpho, or direct transfer
 */
contract FlexibleSplitter is ReentrancyGuard {
    using SafeERC20 for IERC20;

    /**
     * @notice DeFi strategy options for each recipient
     */
    enum DeFiStrategy {
        DIRECT_TRANSFER,  // Send tokens directly to recipient
        AAVE_SUPPLY,      // Supply to AAVE on behalf of recipient
        MORPHO_DEPOSIT,   // Deposit to Morpho Vault on behalf of recipient
        UNISWAP_V2_SWAP   // Swap to WETH via Uniswap V2 and send to recipient
    }

    /**
     * @notice Recipient configuration
     */
    struct Recipient {
        address wallet;           // Recipient wallet address
        uint16 sharePercent;      // Share percentage in basis points (0-10000)
        DeFiStrategy strategy;    // DeFi strategy to use
    }

    /**
     * @notice Protocol addresses (can be updated by constructor)
     */
    address public immutable aavePool;
    address public immutable morphoVault;
    address public immutable uniswapV2Pair;
    address public immutable weth;

    /**
     * @notice Events
     */
    event TokensDistributed(
        address indexed sender,
        address indexed asset,
        uint256 totalAmount,
        uint256 recipientCount
    );

    event RecipientPaid(
        address indexed recipient,
        address indexed asset,
        uint256 amount,
        DeFiStrategy strategy
    );

    /**
     * @notice Constructor
     * @param _aavePool AAVE Pool address (can be zero if not used)
     * @param _morphoVault Morpho Vault address (can be zero if not used)
     * @param _uniswapV2Pair Uniswap V2 Pair address (can be zero if not used)
     * @param _weth WETH address (can be zero if not used)
     */
    constructor(address _aavePool, address _morphoVault, address _uniswapV2Pair, address _weth) {
        aavePool = _aavePool;
        morphoVault = _morphoVault;
        uniswapV2Pair = _uniswapV2Pair;
        weth = _weth;
    }

    /**
     * @notice Distribute tokens to multiple recipients with different strategies
     * @param asset Token address to distribute
     * @param amount Total amount to distribute
     * @param recipients Array of recipient configurations
     */
    function distributeTokens(
        address asset,
        uint256 amount,
        Recipient[] memory recipients
    ) external nonReentrant {
        require(asset != address(0), "Invalid asset");
        require(amount > 0, "Amount must be greater than 0");
        require(recipients.length > 0, "No recipients");
        require(recipients.length <= 20, "Too many recipients");

        // Validate total share percentage
        uint256 totalShare = _validateRecipients(recipients);
        require(totalShare == 10_000, "Total share must be 100%");

        // Transfer tokens from sender to contract
        IERC20 token = IERC20(asset);
        token.safeTransferFrom(msg.sender, address(this), amount);

        // Distribute to each recipient
        for (uint256 i = 0; i < recipients.length; i++) {
            Recipient memory recipient = recipients[i];
            
            if (recipient.sharePercent == 0) {
                continue;
            }

            uint256 recipientAmount = (amount * recipient.sharePercent) / 10_000;
            
            if (recipientAmount == 0) {
                continue;
            }

            _executeStrategy(asset, recipientAmount, recipient);

            emit RecipientPaid(
                recipient.wallet,
                asset,
                recipientAmount,
                recipient.strategy
            );
        }

        emit TokensDistributed(
            msg.sender,
            asset,
            amount,
            recipients.length
        );
    }

    /**
     * @notice Validate recipients configuration
     * @param recipients Array of recipient configurations
     * @return totalShare Total share percentage
     */
    function _validateRecipients(Recipient[] memory recipients) internal pure returns (uint256 totalShare) {
        for (uint256 i = 0; i < recipients.length; i++) {
            require(recipients[i].wallet != address(0), "Invalid recipient address");
            require(recipients[i].sharePercent <= 10_000, "Share exceeds 100%");
            totalShare += recipients[i].sharePercent;
        }
    }

    /**
     * @notice Execute DeFi strategy for a recipient
     * @param asset Token address
     * @param amount Amount to process
     * @param recipient Recipient configuration
     */
    function _executeStrategy(
        address asset,
        uint256 amount,
        Recipient memory recipient
    ) internal {
        IERC20 token = IERC20(asset);

        if (recipient.strategy == DeFiStrategy.DIRECT_TRANSFER) {
            // Direct transfer to recipient
            token.safeTransfer(recipient.wallet, amount);
        } 
        else if (recipient.strategy == DeFiStrategy.AAVE_SUPPLY) {
            // Supply to AAVE on behalf of recipient
            require(aavePool != address(0), "AAVE Pool not configured");
            token.safeIncreaseAllowance(aavePool, amount);
            IAavePool(aavePool).supply(asset, amount, recipient.wallet, 0);
            token.forceApprove(aavePool, 0);
        } 
        else if (recipient.strategy == DeFiStrategy.MORPHO_DEPOSIT) {
            // Deposit to Morpho Vault on behalf of recipient
            require(morphoVault != address(0), "Morpho Vault not configured");
            token.safeIncreaseAllowance(morphoVault, amount);
            IMorphoVault(morphoVault).deposit(amount, recipient.wallet);
            token.forceApprove(morphoVault, 0);
        }
        else if (recipient.strategy == DeFiStrategy.UNISWAP_V2_SWAP) {
            // Swap to WETH via Uniswap V2 and send to recipient
            require(uniswapV2Pair != address(0), "Uniswap V2 Pair not configured");
            require(weth != address(0), "WETH not configured");
            
            IUniswapV2Pair pair = IUniswapV2Pair(uniswapV2Pair);
            address token0 = pair.token0();
            
            require(
                (asset == token0 && weth == pair.token1()) || 
                (asset == pair.token1() && weth == token0),
                "Invalid token pair"
            );
            
            // Get reserves and calculate output
            (uint112 reserve0, uint112 reserve1,) = pair.getReserves();
            bool isToken0 = asset == token0;
            
            uint256 reserveIn = isToken0 ? uint256(reserve0) : uint256(reserve1);
            uint256 reserveOut = isToken0 ? uint256(reserve1) : uint256(reserve0);
            
            uint256 amountOut = (amount * 997 * reserveOut) / ((reserveIn * 1000) + (amount * 997));
            require(amountOut > 0, "Insufficient output");
            
            // Transfer tokens to pair and execute swap
            token.safeTransfer(uniswapV2Pair, amount);
            
            pair.swap(
                isToken0 ? 0 : amountOut,
                isToken0 ? amountOut : 0,
                recipient.wallet,
                new bytes(0)
            );
        }
    }

    /**
     * @notice Get strategy name for UI display
     * @param strategy DeFi strategy enum
     * @return Strategy name as string
     */
    function getStrategyName(DeFiStrategy strategy) external pure returns (string memory) {
        if (strategy == DeFiStrategy.DIRECT_TRANSFER) {
            return "Direct Transfer";
        } else if (strategy == DeFiStrategy.AAVE_SUPPLY) {
            return "AAVE Supply";
        } else if (strategy == DeFiStrategy.MORPHO_DEPOSIT) {
            return "Morpho Deposit";
        } else if (strategy == DeFiStrategy.UNISWAP_V2_SWAP) {
            return "Uniswap V2 Swap";
        }
        return "Unknown";
    }

    /**
     * @notice Preview distribution amounts for each recipient
     * @param amount Total amount to distribute
     * @param recipients Array of recipient configurations
     * @return amounts Array of amounts for each recipient
     */
    function previewDistribution(
        uint256 amount,
        Recipient[] memory recipients
    ) external pure returns (uint256[] memory amounts) {
        amounts = new uint256[](recipients.length);
        
        for (uint256 i = 0; i < recipients.length; i++) {
            amounts[i] = (amount * recipients[i].sharePercent) / 10_000;
        }
    }
}
