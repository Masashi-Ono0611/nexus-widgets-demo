// SPDX-License-Identifier: MIT
pragma solidity ^0.8.25;

import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {SafeERC20} from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";

/// @title PaymentSplitter
/// @notice Splits ERC-20 payments among predefined recipients using fixed shares.
/// @dev Designed to be funded by bridge transfers before each distribute call.
contract PaymentSplitter is Ownable {
    using SafeERC20 for IERC20;

    struct RecipientShare {
        address recipient;
        uint256 share;
    }

    RecipientShare[] private _recipientShares;
    uint256 public immutable totalShares;

    event Distribution(address indexed token, uint256 totalAmount);

    constructor(address[] memory _recipients, uint256[] memory shares_, address initialOwner)
        Ownable(initialOwner)
    {
        uint256 length = _recipients.length;
        require(length > 0, "PaymentSplitter: no recipients");
        require(length == shares_.length, "PaymentSplitter: length mismatch");

        uint256 sum;
        for (uint256 i = 0; i < length; i++) {
            address recipient = _recipients[i];
            uint256 share = shares_[i];
            require(recipient != address(0), "PaymentSplitter: zero recipient");
            require(share > 0, "PaymentSplitter: zero share");

            _recipientShares.push(RecipientShare({recipient: recipient, share: share}));
            sum += share;
        }

        totalShares = sum;
        require(totalShares > 0, "PaymentSplitter: invalid total shares");
    }

    function recipients() external view returns (RecipientShare[] memory) {
        return _recipientShares;
    }

    /// @notice Distributes `totalAmount` of `token` from caller to recipients according to their shares.
    /// @dev Caller must have approved this contract for at least `totalAmount` tokens.
    function distribute(address token, uint256 totalAmount) external {
        require(totalAmount > 0, "PaymentSplitter: amount is zero");
        IERC20 erc20 = IERC20(token);

        uint256 distributed;
        uint256 length = _recipientShares.length;
        for (uint256 i = 0; i < length; i++) {
            RecipientShare memory info = _recipientShares[i];
            uint256 payment = (totalAmount * info.share) / totalShares;

            if (i == length - 1) {
                payment = totalAmount - distributed;
            }

            distributed += payment;
            if (payment > 0) {
                erc20.safeTransferFrom(msg.sender, info.recipient, payment);
            }
        }

        emit Distribution(token, totalAmount);
    }
}
