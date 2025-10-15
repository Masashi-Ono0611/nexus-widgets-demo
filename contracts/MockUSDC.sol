// SPDX-License-Identifier: MIT
pragma solidity ^0.8.25;

import {ERC20} from "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract MockUSDC is ERC20 {
    uint8 private immutable _customDecimals;

    constructor(uint256 initialSupply, uint8 decimals_) ERC20("MockUSDC", "mUSDC") {
        _customDecimals = decimals_;
        _mint(msg.sender, initialSupply);
    }

    function decimals() public view override returns (uint8) {
        return _customDecimals;
    }
}
