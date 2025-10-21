// SPDX-License-Identifier: MIT
pragma solidity ^0.8.25;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

/**
 * @title IAutomate
 * @notice Interface for Gelato Automate
 */
interface IAutomate {
    function createTask(
        address execAddress,
        bytes calldata execDataOrSelector,
        ModuleData calldata moduleData,
        address feeToken
    ) external returns (bytes32 taskId);
    
    function cancelTask(bytes32 taskId) external;
    
    function getFeeDetails() external view returns (uint256, address);
}

struct ModuleData {
    Module[] modules;
    bytes[] args;
}

enum Module {
    RESOLVER,
    TIME,
    PROXY,
    SINGLE_EXEC
}

/**
 * @title DelayedTransfer
 * @notice Delayed transfer contract fully integrated with Gelato Automate
 * @dev Gelato task is automatically created on first scheduleTransfer() call
 */
contract DelayedTransfer is ReentrancyGuard {
    using SafeERC20 for IERC20;

    struct Transfer {
        address asset;
        uint256 amount;
        address recipient;
        uint256 executeAfter;
        bool executed;
    }

    // Gelato Automate (Base Sepolia)
    address public constant GELATO_AUTOMATE = 0x2A6C106ae13B558BB9E2Ec64Bd2f1f7BEFF3A5E0;
    
    // Transfer ID => Transfer info
    mapping(uint256 => Transfer) public transfers;
    
    // User address => Transfer ID list
    mapping(address => uint256[]) public userTransfers;
    
    uint256 public nextTransferId;
    
    uint256 public constant MIN_DELAY = 1 minutes;
    uint256 public constant MAX_DELAY = 365 days;
    
    // Gelato task management
    bytes32 public gelatoTaskId;
    bool public isGelatoTaskCreated;

    event TransferScheduled(
        uint256 indexed transferId,
        address indexed user,
        address indexed asset,
        uint256 amount,
        address recipient,
        uint256 executeAfter
    );

    event TransferExecuted(
        uint256 indexed transferId,
        address indexed asset,
        uint256 amount,
        address indexed recipient
    );

    event TransferCancelled(
        uint256 indexed transferId,
        address indexed user
    );
    
    event GelatoTaskCreated(bytes32 indexed taskId);

    /**
     * @notice Deposit tokens and schedule a delayed transfer
     * @dev Gelato task is automatically created on first call
     */
    function scheduleTransfer(
        address asset,
        uint256 amount,
        address recipient,
        uint256 delaySeconds
    ) external nonReentrant returns (uint256 transferId) {
        require(asset != address(0), "Invalid asset");
        require(amount > 0, "Invalid amount");
        require(recipient != address(0), "Invalid recipient");
        require(delaySeconds >= MIN_DELAY && delaySeconds <= MAX_DELAY, "Invalid delay");

        // Receive tokens
        IERC20(asset).safeTransferFrom(msg.sender, address(this), amount);

        transferId = nextTransferId++;
        uint256 executeAfter = block.timestamp + delaySeconds;

        transfers[transferId] = Transfer({
            asset: asset,
            amount: amount,
            recipient: recipient,
            executeAfter: executeAfter,
            executed: false
        });

        userTransfers[msg.sender].push(transferId);

        emit TransferScheduled(
            transferId,
            msg.sender,
            asset,
            amount,
            recipient,
            executeAfter
        );
        
        // Create Gelato task on first call only
        if (!isGelatoTaskCreated) {
            _createGelatoTask();
        }
    }

    /**
     * @notice Create Gelato task (internal function)
     */
    function _createGelatoTask() internal {
        // Configure Resolver + Proxy modules
        ModuleData memory moduleData = ModuleData({
            modules: new Module[](2),
            args: new bytes[](2)
        });
        
        // Resolver module
        moduleData.modules[0] = Module.RESOLVER;
        moduleData.args[0] = abi.encode(
            address(this),
            abi.encodeWithSelector(this.checker.selector)
        );
        
        // Proxy module (required)
        moduleData.modules[1] = Module.PROXY;
        moduleData.args[1] = bytes("");

        // Create task (executes executeTransfer function)
        gelatoTaskId = IAutomate(GELATO_AUTOMATE).createTask(
            address(this),
            abi.encodeWithSelector(this.executeTransfer.selector, uint256(0)), // Placeholder
            moduleData,
            address(0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE) // Pay with ETH
        );
        
        isGelatoTaskCreated = true;
        
        emit GelatoTaskCreated(gelatoTaskId);
    }

    /**
     * @notice Execute a scheduled transfer
     * @dev Can be called by Gelato or anyone
     */
    function executeTransfer(uint256 transferId) external nonReentrant {
        Transfer storage transfer = transfers[transferId];
        
        require(!transfer.executed, "Already executed");
        require(block.timestamp >= transfer.executeAfter, "Too early");

        transfer.executed = true;

        IERC20(transfer.asset).safeTransfer(transfer.recipient, transfer.amount);

        emit TransferExecuted(
            transferId,
            transfer.asset,
            transfer.amount,
            transfer.recipient
        );
    }

    /**
     * @notice Cancel a scheduled transfer
     */
    function cancelTransfer(uint256 transferId, address user) external nonReentrant {
        Transfer storage transfer = transfers[transferId];
        
        require(!transfer.executed, "Already executed");
        require(msg.sender == user, "Not authorized");

        transfer.executed = true;

        IERC20(transfer.asset).safeTransfer(user, transfer.amount);

        emit TransferCancelled(transferId, user);
    }

    /**
     * @notice Checker function for Gelato Resolver
     */
    function checker() external view returns (bool canExec, bytes memory execPayload) {
        for (uint256 i = 0; i < nextTransferId; i++) {
            Transfer memory transfer = transfers[i];
            
            if (!transfer.executed && block.timestamp >= transfer.executeAfter) {
                return (
                    true,
                    abi.encodeWithSelector(
                        this.executeTransfer.selector,
                        i
                    )
                );
            }
        }
        
        return (false, bytes("No transfers ready"));
    }

    /**
     * @notice Check if a specific transfer ID is ready to execute
     */
    function isTransferReady(uint256 transferId) external view returns (bool) {
        Transfer memory transfer = transfers[transferId];
        return !transfer.executed && block.timestamp >= transfer.executeAfter;
    }

    /**
     * @notice Get list of transfers for a user
     */
    function getUserTransfers(address user) external view returns (uint256[] memory) {
        return userTransfers[user];
    }

    /**
     * @notice Get transfer information
     */
    function getTransfer(uint256 transferId) external view returns (
        address asset,
        uint256 amount,
        address recipient,
        uint256 executeAfter,
        bool executed
    ) {
        Transfer memory transfer = transfers[transferId];
        return (
            transfer.asset,
            transfer.amount,
            transfer.recipient,
            transfer.executeAfter,
            transfer.executed
        );
    }
    
    /**
     * @notice Receive ETH for Gelato payment
     */
    receive() external payable {}
}
