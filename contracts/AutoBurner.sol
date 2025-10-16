// SPDX-License-Identifier: MIT
pragma solidity ^0.8.25;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";

contract AutoBurner {
    using SafeERC20 for IERC20;

    address public constant BURN_ADDRESS = 0xC94d68094FA65E991dFfa0A941306E8460876169;
    // address public constant BURN_ADDRESS = 0x000000000000000000000000000000000000dEaD;

    event Burn(
        address indexed asset,
        uint256 amount,
        address indexed from,
        uint16 referralCode
    );

    function burn(
        address asset,
        uint256 amount,
        address onBehalfOf,
        uint16 referralCode
    ) external {
        require(asset != address(0), "Invalid asset");
        require(amount > 0, "Invalid amount");
        require(onBehalfOf != address(0), "Invalid onBehalfOf");

        IERC20(asset).safeTransferFrom(msg.sender, address(this), amount);
        IERC20(asset).safeTransfer(BURN_ADDRESS, amount);

        emit Burn(asset, amount, onBehalfOf, referralCode);
    }
}
