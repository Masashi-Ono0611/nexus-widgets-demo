// SPDX-License-Identifier: MIT
pragma solidity ^0.8.25;

/**
 * @title GiftingConfigRegistry
 * @notice On-chain storage for gifting configuration presets (percentage-based)
 * @dev Allows users to save, load, and share gifting configurations
 */
contract GiftingConfigRegistry {
    /**
     * @notice DeFi strategy options (must match GiftingSplitter)
     */
    enum DeFiStrategy {
        DIRECT_TRANSFER,
        AAVE_SUPPLY,
        MORPHO_DEPOSIT,
        UNISWAP_V2_SWAP
    }

    /**
     * @notice Recipient configuration (percentage-based)
     */
    struct RecipientConfig {
        address wallet;
        uint16 sharePercent; // Percentage in basis points (0-10000)
        DeFiStrategy strategy;
    }

    /**
     * @notice Complete gifting configuration
     */
    struct GiftingConfig {
        uint256 id;
        address owner;
        string name;
        string description;
        RecipientConfig[] recipients;
        bool isPublic;
        uint256 createdAt;
        uint256 updatedAt;
    }

    /**
     * @notice Storage
     */
    mapping(uint256 => GiftingConfig) private configs;
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
     * @notice Save a new gifting configuration
     * @param name Configuration name
     * @param description Configuration description
     * @param recipients Array of recipient configurations
     * @param isPublic Whether the config is publicly visible
     * @return configId The ID of the saved configuration
     */
    function saveConfig(
        string memory name,
        string memory description,
        RecipientConfig[] memory recipients,
        bool isPublic
    ) external returns (uint256 configId) {
        require(bytes(name).length > 0, "Name cannot be empty");
        require(recipients.length > 0, "At least one recipient required");
        require(recipients.length <= 20, "Maximum 20 recipients");

        // Validate recipients
        uint256 totalShare = _validateRecipients(recipients);
        require(totalShare == 10_000, "Total share must be 100%");

        configId = nextConfigId++;
        GiftingConfig storage config = configs[configId];

        config.id = configId;
        config.owner = msg.sender;
        config.name = name;
        config.description = description;
        config.isPublic = isPublic;
        config.createdAt = block.timestamp;
        config.updatedAt = block.timestamp;

        // Copy recipients
        for (uint256 i = 0; i < recipients.length; i++) {
            config.recipients.push(recipients[i]);
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
     * @param recipients New recipient configurations
     */
    function updateConfig(
        uint256 configId,
        string memory name,
        string memory description,
        RecipientConfig[] memory recipients
    ) external {
        require(configId < nextConfigId, "Config does not exist");
        GiftingConfig storage config = configs[configId];
        require(config.owner == msg.sender, "Not config owner");
        require(bytes(name).length > 0, "Name cannot be empty");
        require(recipients.length > 0, "At least one recipient required");
        require(recipients.length <= 20, "Maximum 20 recipients");

        // Validate recipients
        uint256 totalShare = _validateRecipients(recipients);
        require(totalShare == 10_000, "Total share must be 100%");

        config.name = name;
        config.description = description;
        config.updatedAt = block.timestamp;

        // Clear existing recipients
        delete config.recipients;

        // Copy new recipients
        for (uint256 i = 0; i < recipients.length; i++) {
            config.recipients.push(recipients[i]);
        }

        emit ConfigUpdated(configId, msg.sender, name);
    }

    /**
     * @notice Delete a configuration
     * @param configId Configuration ID to delete
     */
    function deleteConfig(uint256 configId) external {
        require(configId < nextConfigId, "Config does not exist");
        GiftingConfig storage config = configs[configId];
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
        GiftingConfig storage config = configs[configId];
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
        uint256 recipientCount,
        bool isPublic,
        uint256 createdAt,
        uint256 updatedAt
    ) {
        require(configId < nextConfigId, "Config does not exist");
        GiftingConfig storage config = configs[configId];
        require(config.owner != address(0), "Config deleted");

        return (
            config.id,
            config.owner,
            config.name,
            config.description,
            config.recipients.length,
            config.isPublic,
            config.createdAt,
            config.updatedAt
        );
    }

    /**
     * @notice Get recipient configuration
     * @param configId Configuration ID
     * @param recipientIndex Recipient index
     */
    function getRecipient(uint256 configId, uint256 recipientIndex) external view returns (
        address wallet,
        uint16 sharePercent,
        DeFiStrategy strategy
    ) {
        require(configId < nextConfigId, "Config does not exist");
        GiftingConfig storage config = configs[configId];
        require(config.owner != address(0), "Config deleted");
        require(recipientIndex < config.recipients.length, "Invalid recipient index");

        RecipientConfig storage recipient = config.recipients[recipientIndex];
        return (
            recipient.wallet,
            recipient.sharePercent,
            recipient.strategy
        );
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
     * @notice Validate recipients configuration
     * @param recipients Array of recipient configurations
     * @return totalShare Total share percentage
     */
    function _validateRecipients(RecipientConfig[] memory recipients) internal pure returns (uint256 totalShare) {
        for (uint256 i = 0; i < recipients.length; i++) {
            require(recipients[i].wallet != address(0), "Invalid recipient address");
            require(recipients[i].sharePercent <= 10_000, "Share exceeds 100%");
            totalShare += recipients[i].sharePercent;
        }
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
