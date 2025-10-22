// SPDX-License-Identifier: MIT
pragma solidity ^0.8.25;

/**
 * @title PayrollConfigRegistry
 * @notice On-chain storage for payroll configuration presets
 * @dev Allows users to save, load, and share payroll configurations
 */
contract PayrollConfigRegistry {
    /**
     * @notice DeFi strategy options (must match FlexibleSplitter/RecurringSplitter)
     */
    enum DeFiStrategy {
        DIRECT_TRANSFER,
        AAVE_SUPPLY,
        MORPHO_DEPOSIT,
        UNISWAP_V2_SWAP
    }

    /**
     * @notice Strategy allocation for a wallet
     */
    struct StrategyAllocation {
        DeFiStrategy strategy;
        uint16 subPercent; // Percentage in basis points (0-10000)
    }

    /**
     * @notice Wallet group configuration
     */
    struct WalletGroup {
        address wallet;
        uint256 walletAmount; // Amount in token units (e.g., USDC)
        StrategyAllocation[] strategies;
    }

    /**
     * @notice Schedule configuration
     */
    struct ScheduleConfig {
        bool enabled;
        uint256 intervalMinutes;
        uint256 maxExecutions;
    }

    /**
     * @notice Complete payroll configuration
     */
    struct PayrollConfig {
        uint256 id;
        address owner;
        string name;
        string description;
        WalletGroup[] walletGroups;
        ScheduleConfig schedule;
        bool isPublic;
        uint256 createdAt;
        uint256 updatedAt;
    }

    /**
     * @notice Storage
     */
    mapping(uint256 => PayrollConfig) private configs;
    mapping(address => uint256[]) private userConfigIds;
    uint256[] private publicConfigIds;
    uint256 public nextConfigId;

    /**
     * @notice Events
     */
    event ConfigSaved(
        uint256 indexed configId,
        address indexed owner,
        string name,
        bool isPublic
    );

    event ConfigUpdated(
        uint256 indexed configId,
        address indexed owner,
        string name
    );

    event ConfigDeleted(
        uint256 indexed configId,
        address indexed owner
    );

    event ConfigVisibilityChanged(
        uint256 indexed configId,
        bool isPublic
    );

    /**
     * @notice Save a new payroll configuration
     * @param name Configuration name
     * @param description Configuration description
     * @param walletGroups Array of wallet groups
     * @param schedule Schedule configuration
     * @param isPublic Whether the config is publicly visible
     * @return configId The ID of the saved configuration
     */
    function saveConfig(
        string memory name,
        string memory description,
        WalletGroup[] memory walletGroups,
        ScheduleConfig memory schedule,
        bool isPublic
    ) external returns (uint256 configId) {
        require(bytes(name).length > 0, "Name cannot be empty");
        require(walletGroups.length > 0, "At least one wallet group required");
        require(walletGroups.length <= 5, "Maximum 5 wallet groups");

        configId = nextConfigId++;
        PayrollConfig storage config = configs[configId];

        config.id = configId;
        config.owner = msg.sender;
        config.name = name;
        config.description = description;
        config.schedule = schedule;
        config.isPublic = isPublic;
        config.createdAt = block.timestamp;
        config.updatedAt = block.timestamp;

        // Copy wallet groups
        for (uint256 i = 0; i < walletGroups.length; i++) {
            WalletGroup memory group = walletGroups[i];
            require(group.wallet != address(0), "Invalid wallet address");
            require(group.strategies.length > 0, "At least one strategy required");
            require(group.strategies.length <= 4, "Maximum 4 strategies");

            config.walletGroups.push();
            WalletGroup storage newGroup = config.walletGroups[config.walletGroups.length - 1];
            newGroup.wallet = group.wallet;
            newGroup.walletAmount = group.walletAmount;

            for (uint256 j = 0; j < group.strategies.length; j++) {
                newGroup.strategies.push(group.strategies[j]);
            }
        }

        userConfigIds[msg.sender].push(configId);

        if (isPublic) {
            publicConfigIds.push(configId);
        }

        emit ConfigSaved(configId, msg.sender, name, isPublic);
    }

    /**
     * @notice Update an existing configuration
     * @param configId Configuration ID to update
     * @param name New name
     * @param description New description
     * @param walletGroups New wallet groups
     * @param schedule New schedule configuration
     */
    function updateConfig(
        uint256 configId,
        string memory name,
        string memory description,
        WalletGroup[] memory walletGroups,
        ScheduleConfig memory schedule
    ) external {
        require(configId < nextConfigId, "Config does not exist");
        PayrollConfig storage config = configs[configId];
        require(config.owner == msg.sender, "Not config owner");
        require(bytes(name).length > 0, "Name cannot be empty");
        require(walletGroups.length > 0, "At least one wallet group required");
        require(walletGroups.length <= 5, "Maximum 5 wallet groups");

        config.name = name;
        config.description = description;
        config.schedule = schedule;
        config.updatedAt = block.timestamp;

        // Clear existing wallet groups
        delete config.walletGroups;

        // Copy new wallet groups
        for (uint256 i = 0; i < walletGroups.length; i++) {
            WalletGroup memory group = walletGroups[i];
            require(group.wallet != address(0), "Invalid wallet address");
            require(group.strategies.length > 0, "At least one strategy required");
            require(group.strategies.length <= 4, "Maximum 4 strategies");

            config.walletGroups.push();
            WalletGroup storage newGroup = config.walletGroups[config.walletGroups.length - 1];
            newGroup.wallet = group.wallet;
            newGroup.walletAmount = group.walletAmount;

            for (uint256 j = 0; j < group.strategies.length; j++) {
                newGroup.strategies.push(group.strategies[j]);
            }
        }

        emit ConfigUpdated(configId, msg.sender, name);
    }

    /**
     * @notice Delete a configuration
     * @param configId Configuration ID to delete
     */
    function deleteConfig(uint256 configId) external {
        require(configId < nextConfigId, "Config does not exist");
        PayrollConfig storage config = configs[configId];
        require(config.owner == msg.sender, "Not config owner");

        // Remove from public list if public
        if (config.isPublic) {
            _removeFromPublicList(configId);
        }

        // Remove from user list
        _removeFromUserList(msg.sender, configId);

        // Delete config
        delete configs[configId];

        emit ConfigDeleted(configId, msg.sender);
    }

    /**
     * @notice Toggle public visibility of a configuration
     * @param configId Configuration ID
     */
    function togglePublic(uint256 configId) external {
        require(configId < nextConfigId, "Config does not exist");
        PayrollConfig storage config = configs[configId];
        require(config.owner == msg.sender, "Not config owner");

        config.isPublic = !config.isPublic;

        if (config.isPublic) {
            publicConfigIds.push(configId);
        } else {
            _removeFromPublicList(configId);
        }

        emit ConfigVisibilityChanged(configId, config.isPublic);
    }

    /**
     * @notice Get a configuration by ID
     * @param configId Configuration ID
     */
    function getConfig(uint256 configId) external view returns (
        uint256 id,
        address owner,
        string memory name,
        string memory description,
        uint256 walletGroupCount,
        ScheduleConfig memory schedule,
        bool isPublic,
        uint256 createdAt,
        uint256 updatedAt
    ) {
        require(configId < nextConfigId, "Config does not exist");
        PayrollConfig storage config = configs[configId];
        require(config.owner != address(0), "Config deleted");

        return (
            config.id,
            config.owner,
            config.name,
            config.description,
            config.walletGroups.length,
            config.schedule,
            config.isPublic,
            config.createdAt,
            config.updatedAt
        );
    }

    /**
     * @notice Get wallet groups for a configuration
     * @param configId Configuration ID
     * @param groupIndex Wallet group index
     */
    function getWalletGroup(uint256 configId, uint256 groupIndex) external view returns (
        address wallet,
        uint256 walletAmount,
        uint256 strategyCount
    ) {
        require(configId < nextConfigId, "Config does not exist");
        PayrollConfig storage config = configs[configId];
        require(config.owner != address(0), "Config deleted");
        require(groupIndex < config.walletGroups.length, "Invalid group index");

        WalletGroup storage group = config.walletGroups[groupIndex];
        return (
            group.wallet,
            group.walletAmount,
            group.strategies.length
        );
    }

    /**
     * @notice Get strategy allocation for a wallet group
     * @param configId Configuration ID
     * @param groupIndex Wallet group index
     * @param strategyIndex Strategy index
     */
    function getStrategyAllocation(
        uint256 configId,
        uint256 groupIndex,
        uint256 strategyIndex
    ) external view returns (
        DeFiStrategy strategy,
        uint16 subPercent
    ) {
        require(configId < nextConfigId, "Config does not exist");
        PayrollConfig storage config = configs[configId];
        require(config.owner != address(0), "Config deleted");
        require(groupIndex < config.walletGroups.length, "Invalid group index");
        require(strategyIndex < config.walletGroups[groupIndex].strategies.length, "Invalid strategy index");

        StrategyAllocation storage allocation = config.walletGroups[groupIndex].strategies[strategyIndex];
        return (allocation.strategy, allocation.subPercent);
    }

    /**
     * @notice Get all configuration IDs for a user
     * @param user User address
     */
    function getUserConfigIds(address user) external view returns (uint256[] memory) {
        return userConfigIds[user];
    }

    /**
     * @notice Get all public configuration IDs
     */
    function getPublicConfigIds() external view returns (uint256[] memory) {
        return publicConfigIds;
    }

    /**
     * @notice Get configuration count for a user
     * @param user User address
     */
    function getUserConfigCount(address user) external view returns (uint256) {
        return userConfigIds[user].length;
    }

    /**
     * @notice Get public configuration count
     */
    function getPublicConfigCount() external view returns (uint256) {
        return publicConfigIds.length;
    }

    /**
     * @notice Remove config ID from public list (internal)
     */
    function _removeFromPublicList(uint256 configId) internal {
        for (uint256 i = 0; i < publicConfigIds.length; i++) {
            if (publicConfigIds[i] == configId) {
                publicConfigIds[i] = publicConfigIds[publicConfigIds.length - 1];
                publicConfigIds.pop();
                break;
            }
        }
    }

    /**
     * @notice Remove config ID from user list (internal)
     */
    function _removeFromUserList(address user, uint256 configId) internal {
        uint256[] storage userIds = userConfigIds[user];
        for (uint256 i = 0; i < userIds.length; i++) {
            if (userIds[i] == configId) {
                userIds[i] = userIds[userIds.length - 1];
                userIds.pop();
                break;
            }
        }
    }
}
