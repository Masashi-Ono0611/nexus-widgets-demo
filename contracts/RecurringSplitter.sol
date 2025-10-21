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
 * @title RecurringSplitter
 * @notice Recurring token distribution with multiple recipients and DeFi strategies
 * @dev Integrates Gelato Automate for scheduled recurring distributions
 */
contract RecurringSplitter is ReentrancyGuard {
    using SafeERC20 for IERC20;

    /**
     * @notice DeFi strategy options for each recipient
     */
    enum DeFiStrategy {
        DIRECT_TRANSFER,  // Send tokens directly to recipient
        AAVE_SUPPLY,      // Supply to AAVE on behalf of recipient
        MORPHO_DEPOSIT    // Deposit to Morpho Vault on behalf of recipient
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
     * @notice Schedule configuration
     */
    struct Schedule {
        address owner;            // Schedule owner
        address asset;            // Token address
        uint256 amountPerExecution; // Amount to distribute per execution
        Recipient[] recipients;   // Recipients configuration
        uint256 intervalSeconds;  // Interval between executions
        uint256 nextExecutionTime; // Next execution timestamp
        uint256 executionCount;   // Number of times executed
        uint256 maxExecutions;    // Maximum executions (0 = unlimited)
        bool active;              // Schedule active status
    }

    /**
     * @notice Protocol addresses
     */
    address public immutable aavePool;
    address public immutable morphoVault;
    address public constant GELATO_AUTOMATE = 0x2A6C106ae13B558BB9E2Ec64Bd2f1f7BEFF3A5E0; // Arbitrum Sepolia

    /**
     * @notice Schedule storage
     */
    mapping(uint256 => Schedule) public schedules;
    mapping(address => uint256[]) public userSchedules;
    uint256 public nextScheduleId;

    /**
     * @notice Gelato task management
     */
    bytes32 public gelatoTaskId;
    bool public isGelatoTaskCreated;

    /**
     * @notice Constants
     */
    uint256 public constant MIN_INTERVAL = 1 minutes;
    uint256 public constant MAX_INTERVAL = 365 days;

    /**
     * @notice Events
     */
    event ScheduleCreated(
        uint256 indexed scheduleId,
        address indexed owner,
        address indexed asset,
        uint256 amountPerExecution,
        uint256 intervalSeconds
    );

    event ScheduleExecuted(
        uint256 indexed scheduleId,
        uint256 executionCount,
        uint256 totalAmount
    );

    event ScheduleCancelled(
        uint256 indexed scheduleId,
        address indexed owner
    );

    event RecipientPaid(
        uint256 indexed scheduleId,
        address indexed recipient,
        uint256 amount,
        DeFiStrategy strategy
    );

    event GelatoTaskCreated(bytes32 indexed taskId);

    /**
     * @notice Constructor
     * @param _aavePool AAVE Pool address (can be zero if not used)
     * @param _morphoVault Morpho Vault address (can be zero if not used)
     */
    constructor(address _aavePool, address _morphoVault) {
        aavePool = _aavePool;
        morphoVault = _morphoVault;
    }

    /**
     * @notice Create a new recurring distribution schedule
     * @param asset Token address to distribute
     * @param amountPerExecution Amount to distribute per execution
     * @param recipients Array of recipient configurations
     * @param intervalSeconds Interval between executions
     * @param maxExecutions Maximum number of executions (0 = unlimited)
     */
    function createSchedule(
        address asset,
        uint256 amountPerExecution,
        Recipient[] memory recipients,
        uint256 intervalSeconds,
        uint256 maxExecutions
    ) external nonReentrant returns (uint256 scheduleId) {
        require(asset != address(0), "Invalid asset");
        require(amountPerExecution > 0, "Amount must be greater than 0");
        require(recipients.length > 0, "No recipients");
        require(recipients.length <= 20, "Too many recipients");
        require(intervalSeconds >= MIN_INTERVAL && intervalSeconds <= MAX_INTERVAL, "Invalid interval");

        // Validate total share percentage
        uint256 totalShare = _validateRecipients(recipients);
        require(totalShare == 10_000, "Total share must be 100%");

        scheduleId = nextScheduleId++;
        Schedule storage schedule = schedules[scheduleId];
        
        schedule.owner = msg.sender;
        schedule.asset = asset;
        schedule.amountPerExecution = amountPerExecution;
        schedule.intervalSeconds = intervalSeconds;
        schedule.nextExecutionTime = block.timestamp + intervalSeconds;
        schedule.executionCount = 0;
        schedule.maxExecutions = maxExecutions;
        schedule.active = true;

        // Copy recipients
        for (uint256 i = 0; i < recipients.length; i++) {
            schedule.recipients.push(recipients[i]);
        }

        userSchedules[msg.sender].push(scheduleId);

        emit ScheduleCreated(
            scheduleId,
            msg.sender,
            asset,
            amountPerExecution,
            intervalSeconds
        );

        // Create Gelato task on first schedule
        if (!isGelatoTaskCreated) {
            _createGelatoTask();
        }
    }

    /**
     * @notice Execute a scheduled distribution
     * @param scheduleId Schedule ID to execute
     */
    function executeSchedule(uint256 scheduleId) external nonReentrant {
        Schedule storage schedule = schedules[scheduleId];
        
        require(schedule.active, "Schedule not active");
        require(block.timestamp >= schedule.nextExecutionTime, "Too early");
        
        // Check if max executions reached
        if (schedule.maxExecutions > 0 && schedule.executionCount >= schedule.maxExecutions) {
            schedule.active = false;
            emit ScheduleCancelled(scheduleId, schedule.owner);
            return;
        }

        // Transfer tokens from owner to contract
        IERC20 token = IERC20(schedule.asset);
        token.safeTransferFrom(schedule.owner, address(this), schedule.amountPerExecution);

        // Distribute to recipients
        for (uint256 i = 0; i < schedule.recipients.length; i++) {
            Recipient memory recipient = schedule.recipients[i];
            
            if (recipient.sharePercent == 0) {
                continue;
            }

            uint256 recipientAmount = (schedule.amountPerExecution * recipient.sharePercent) / 10_000;
            
            if (recipientAmount == 0) {
                continue;
            }

            _executeStrategy(schedule.asset, recipientAmount, recipient);

            emit RecipientPaid(
                scheduleId,
                recipient.wallet,
                recipientAmount,
                recipient.strategy
            );
        }

        // Update schedule
        schedule.executionCount++;
        schedule.nextExecutionTime += schedule.intervalSeconds;

        emit ScheduleExecuted(
            scheduleId,
            schedule.executionCount,
            schedule.amountPerExecution
        );
    }

    /**
     * @notice Cancel a schedule
     * @param scheduleId Schedule ID to cancel
     */
    function cancelSchedule(uint256 scheduleId) external nonReentrant {
        Schedule storage schedule = schedules[scheduleId];
        
        require(schedule.owner == msg.sender, "Not schedule owner");
        require(schedule.active, "Schedule not active");

        schedule.active = false;

        emit ScheduleCancelled(scheduleId, msg.sender);
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

        // Create task
        gelatoTaskId = IAutomate(GELATO_AUTOMATE).createTask(
            address(this),
            abi.encodeWithSelector(this.executeSchedule.selector, uint256(0)), // Placeholder
            moduleData,
            address(0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE) // Pay with ETH
        );
        
        isGelatoTaskCreated = true;
        
        emit GelatoTaskCreated(gelatoTaskId);
    }

    /**
     * @notice Checker function for Gelato Resolver
     */
    function checker() external view returns (bool canExec, bytes memory execPayload) {
        for (uint256 i = 0; i < nextScheduleId; i++) {
            Schedule storage schedule = schedules[i];
            
            if (schedule.active && block.timestamp >= schedule.nextExecutionTime) {
                // Check if max executions reached
                if (schedule.maxExecutions > 0 && schedule.executionCount >= schedule.maxExecutions) {
                    continue;
                }
                
                return (
                    true,
                    abi.encodeWithSelector(
                        this.executeSchedule.selector,
                        i
                    )
                );
            }
        }
        
        return (false, bytes("No schedules ready"));
    }

    /**
     * @notice Get schedule information
     * @param scheduleId Schedule ID
     */
    function getSchedule(uint256 scheduleId) external view returns (
        address owner,
        address asset,
        uint256 amountPerExecution,
        uint256 intervalSeconds,
        uint256 nextExecutionTime,
        uint256 executionCount,
        uint256 maxExecutions,
        bool active,
        uint256 recipientCount
    ) {
        Schedule storage schedule = schedules[scheduleId];
        return (
            schedule.owner,
            schedule.asset,
            schedule.amountPerExecution,
            schedule.intervalSeconds,
            schedule.nextExecutionTime,
            schedule.executionCount,
            schedule.maxExecutions,
            schedule.active,
            schedule.recipients.length
        );
    }

    /**
     * @notice Get user's schedules
     * @param user User address
     */
    function getUserSchedules(address user) external view returns (uint256[] memory) {
        return userSchedules[user];
    }

    /**
     * @notice Receive ETH for Gelato payment
     */
    receive() external payable {}
}
