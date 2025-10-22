// SPDX-License-Identifier: MIT
pragma solidity ^0.8.25;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";

interface IMorphoVault {
    function deposit(
        uint256 assets,
        address onBehalf
    ) external returns (uint256 shares);
}

contract MorphoDepositSplitter {
    using SafeERC20 for IERC20;

    address public constant FORWARD_ADDRESS_1 = 0xC94d68094FA65E991dFfa0A941306E8460876169;
    address public constant FORWARD_ADDRESS_2 = 0x08D811A358850892029251CcC8a565a32fd2dCB8;
    // Arbitrum Sepolia Morpho Vault v2
    address public constant MORPHO_VAULT = 0xAbF102ed5F977331BDaD74D9136B6bFb7A2F09B6;

    event SplitDeposited(
        address indexed asset,
        uint256 amount,
        uint256 sharesForAddress1,
        uint256 sharesForAddress2
    );

    function splitDeposit(
        address asset,
        uint256 amount,
        address onBehalfOf,
        uint16 shareBasisPoints
    ) external returns (uint256 totalShares) {
        require(asset != address(0), "Invalid asset");
        require(amount > 0, "Amount must be greater than 0");
        require(onBehalfOf != address(0), "Invalid onBehalfOf");
        require(shareBasisPoints <= 10_000, "Invalid share");

        IERC20 token = IERC20(asset);
        token.safeTransferFrom(msg.sender, address(this), amount);

        uint256 amountForForward1 = (amount * shareBasisPoints) / 10_000;
        uint256 amountForForward2 = amount - amountForForward1;

        token.safeIncreaseAllowance(MORPHO_VAULT, amount);

        uint256 sharesForAddress1 = 0;
        uint256 sharesForAddress2 = 0;

        if (amountForForward1 > 0) {
            sharesForAddress1 = IMorphoVault(MORPHO_VAULT).deposit(amountForForward1, FORWARD_ADDRESS_1);
        }
        if (amountForForward2 > 0) {
            sharesForAddress2 = IMorphoVault(MORPHO_VAULT).deposit(amountForForward2, FORWARD_ADDRESS_2);
        }

        token.forceApprove(MORPHO_VAULT, 0);

        totalShares = sharesForAddress1 + sharesForAddress2;

        emit SplitDeposited(asset, amount, sharesForAddress1, sharesForAddress2);
    }
}
