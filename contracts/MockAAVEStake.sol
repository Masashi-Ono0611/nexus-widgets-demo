// SPDX-License-Identifier: MIT
pragma solidity ^0.8.25;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";

/**
 * @title MockAaveStakePool
 * @notice Mock contract simulating an AAVE-style stake/unstake flow for testing BridgeAndExecuteButton
 * @dev This contract accepts ERC20 tokens and tracks staked balances per user
 */
contract MockAaveStakePool {
    using SafeERC20 for IERC20;

    // Events
    event Stake(
        address indexed asset,
        uint256 amount,
        address indexed staker,
        uint16 indexed referralCode
    );

    event Unstake(
        address indexed asset,
        uint256 amount,
        address indexed to
    );

    // Mapping: user => asset => staked amount
    mapping(address => mapping(address => uint256)) public stakes;

    // Total staked per asset
    mapping(address => uint256) public totalStaked;

    /**
     * @notice Stake assets into the pool
     * @param asset The address of the underlying asset to stake
     * @param amount The amount to stake
     * @param staker The address that will receive the stake credit
     * @param referralCode Code used to register the integrator originating the operation
     */
    function stake(
        address asset,
        uint256 amount,
        address staker,
        uint16 referralCode
    ) external {
        require(asset != address(0), "Invalid asset address");
        require(amount > 0, "Amount must be greater than 0");
        require(staker != address(0), "Invalid staker address");

        IERC20(asset).safeTransferFrom(msg.sender, address(this), amount);

        stakes[staker][asset] += amount;
        totalStaked[asset] += amount;

        emit Stake(asset, amount, staker, referralCode);
    }

    /**
     * @notice Unstake previously staked assets from the pool
     * @param asset The address of the underlying asset to unstake
     * @param amount The amount to unstake
     * @param to The address that will receive the underlying tokens
     * @return The final amount unstaked
     */
    function unstake(
        address asset,
        uint256 amount,
        address to
    ) external returns (uint256) {
        require(asset != address(0), "Invalid asset address");
        require(amount > 0, "Amount must be greater than 0");
        require(to != address(0), "Invalid to address");
        require(stakes[msg.sender][asset] >= amount, "Insufficient balance");

        stakes[msg.sender][asset] -= amount;
        totalStaked[asset] -= amount;

        IERC20(asset).safeTransfer(to, amount);

        emit Unstake(asset, amount, to);

        return amount;
    }

    /**
     * @notice Get the staked balance for a user and asset
     * @param user The address of the user
     * @param asset The address of the asset
     * @return The staked balance
     */
    function getStakeBalance(address user, address asset) external view returns (uint256) {
        return stakes[user][asset];
    }

    /**
     * @notice Get the total staked amount for an asset
     * @param asset The address of the asset
     * @return The total staked amount
     */
    function getTotalStaked(address asset) external view returns (uint256) {
        return totalStaked[asset];
    }
}
