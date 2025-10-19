// SPDX-License-Identifier: MIT
pragma solidity ^0.8.25;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";

interface IMockAavePool {
    function supply(
        address asset,
        uint256 amount,
        address onBehalfOf,
        uint16 referralCode
    ) external;
}

contract AutoSupplySplitter {
    using SafeERC20 for IERC20;

    address public constant FORWARD_ADDRESS_1 = 0xC94d68094FA65E991dFfa0A941306E8460876169;
    address public constant FORWARD_ADDRESS_2 = 0x08D811A358850892029251CcC8a565a32fd2dCB8;
    address public constant MOCK_AAVE_POOL = 0x00E3B1c858686A0e64Dfdb9F861CC659B96580b0;

    event SplitSupplied(
        address indexed asset,
        uint256 amount,
        uint16 referralCode
    );

    function splitSupply(
        address asset,
        uint256 amount,
        address onBehalfOf,
        uint16 referralCode,
        uint16 shareBasisPoints
    ) external {
        require(asset != address(0), "Invalid asset");
        require(amount > 0, "Amount must be greater than 0");
        require(onBehalfOf != address(0), "Invalid onBehalfOf");
        require(shareBasisPoints <= 10_000, "Invalid share");

        IERC20 token = IERC20(asset);
        token.safeTransferFrom(msg.sender, address(this), amount);

        uint256 amountForForward1 = (amount * shareBasisPoints) / 10_000;
        uint256 amountForForward2 = amount - amountForForward1;

        token.safeIncreaseAllowance(MOCK_AAVE_POOL, amount);

        if (amountForForward1 > 0) {
            IMockAavePool(MOCK_AAVE_POOL).supply(asset, amountForForward1, FORWARD_ADDRESS_1, referralCode);
        }
        if (amountForForward2 > 0) {
            IMockAavePool(MOCK_AAVE_POOL).supply(asset, amountForForward2, FORWARD_ADDRESS_2, referralCode);
        }

        token.forceApprove(MOCK_AAVE_POOL, 0);

        emit SplitSupplied(asset, amount, referralCode);
    }
}
