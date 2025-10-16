// SPDX-License-Identifier: MIT
pragma solidity ^0.8.25;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";

contract AutoForwarder {
    using SafeERC20 for IERC20;

    address public constant FORWARD_RECIPIENT = 0xC94d68094FA65E991dFfa0A941306E8460876169;

    event Forward(
        address indexed asset,
        uint256 amount,
        address indexed from,
        uint16 referralCode
    );

    function forward(
        address asset,
        uint256 amount,
        address onBehalfOf,
        uint16 referralCode
    ) external {
        require(asset != address(0), "Invalid asset");
        require(amount > 0, "Amount must be greater than 0");
        require(onBehalfOf != address(0), "Invalid onBehalfOf address");

        IERC20(asset).safeTransferFrom(msg.sender, address(this), amount);
        IERC20(asset).safeTransfer(FORWARD_RECIPIENT, amount);

        emit Forward(asset, amount, onBehalfOf, referralCode);
    }
}
