// SPDX-License-Identifier: MIT
pragma solidity ^0.8.25;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";

/**
 * @title MockAavePool
 * @notice Mock contract simulating AAVE Pool's supply function for testing BridgeAndExecuteButton
 * @dev This contract accepts ERC20 tokens and tracks supplies per user
 */
contract MockAavePool {
    using SafeERC20 for IERC20;

    // Events
    event Supply(
        address indexed asset,
        uint256 amount,
        address indexed onBehalfOf,
        uint16 indexed referralCode
    );

    event Withdraw(
        address indexed asset,
        uint256 amount,
        address indexed to
    );

    // Mapping: user => asset => supplied amount
    mapping(address => mapping(address => uint256)) public supplies;

    // Total supplied per asset
    mapping(address => uint256) public totalSupplied;

    /**
     * @notice Supply assets to the pool
     * @param asset The address of the underlying asset to supply
     * @param amount The amount to be supplied
     * @param onBehalfOf The address that will receive the aTokens (for this mock, just tracking)
     * @param referralCode Code used to register the integrator originating the operation
     */
    function supply(
        address asset,
        uint256 amount,
        address onBehalfOf,
        uint16 referralCode
    ) external {
        require(asset != address(0), "Invalid asset address");
        require(amount > 0, "Amount must be greater than 0");
        require(onBehalfOf != address(0), "Invalid onBehalfOf address");

        // Transfer tokens from sender to this contract
        IERC20(asset).safeTransferFrom(msg.sender, address(this), amount);

        // Update supplies
        supplies[onBehalfOf][asset] += amount;
        totalSupplied[asset] += amount;

        emit Supply(asset, amount, onBehalfOf, referralCode);
    }

    /**
     * @notice Withdraw supplied assets from the pool
     * @param asset The address of the underlying asset to withdraw
     * @param amount The amount to be withdrawn
     * @param to The address that will receive the underlying
     * @return The final amount withdrawn
     */
    function withdraw(
        address asset,
        uint256 amount,
        address to
    ) external returns (uint256) {
        require(asset != address(0), "Invalid asset address");
        require(amount > 0, "Amount must be greater than 0");
        require(to != address(0), "Invalid to address");
        require(supplies[msg.sender][asset] >= amount, "Insufficient balance");

        // Update supplies
        supplies[msg.sender][asset] -= amount;
        totalSupplied[asset] -= amount;

        // Transfer tokens to recipient
        IERC20(asset).safeTransfer(to, amount);

        emit Withdraw(asset, amount, to);

        return amount;
    }

    /**
     * @notice Get the supplied balance for a user and asset
     * @param user The address of the user
     * @param asset The address of the asset
     * @return The supplied balance
     */
    function getSupplyBalance(address user, address asset) external view returns (uint256) {
        return supplies[user][asset];
    }

    /**
     * @notice Get the total supplied amount for an asset
     * @param asset The address of the asset
     * @return The total supplied amount
     */
    function getTotalSupplied(address asset) external view returns (uint256) {
        return totalSupplied[asset];
    }
}
