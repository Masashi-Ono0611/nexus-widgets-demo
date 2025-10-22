export const REGISTRY_ABI = [
  {
    name: "saveConfig",
    type: "function",
    stateMutability: "nonpayable",
    inputs: [
      { name: "name", type: "string" },
      { name: "description", type: "string" },
      {
        name: "walletGroups",
        type: "tuple[]",
        components: [
          { name: "wallet", type: "address" },
          { name: "walletAmount", type: "uint256" },
          {
            name: "strategies",
            type: "tuple[]",
            components: [
              { name: "strategy", type: "uint8" },
              { name: "subPercent", type: "uint16" },
            ],
          },
        ],
      },
      {
        name: "schedule",
        type: "tuple",
        components: [
          { name: "enabled", type: "bool" },
          { name: "intervalMinutes", type: "uint256" },
          { name: "maxExecutions", type: "uint256" },
        ],
      },
      { name: "isPublic", type: "bool" },
    ],
    outputs: [{ name: "configId", type: "uint256" }],
  },
  {
    name: "updateConfig",
    type: "function",
    stateMutability: "nonpayable",
    inputs: [
      { name: "configId", type: "uint256" },
      { name: "name", type: "string" },
      { name: "description", type: "string" },
      {
        name: "walletGroups",
        type: "tuple[]",
        components: [
          { name: "wallet", type: "address" },
          { name: "walletAmount", type: "uint256" },
          {
            name: "strategies",
            type: "tuple[]",
            components: [
              { name: "strategy", type: "uint8" },
              { name: "subPercent", type: "uint16" },
            ],
          },
        ],
      },
      {
        name: "schedule",
        type: "tuple",
        components: [
          { name: "enabled", type: "bool" },
          { name: "intervalMinutes", type: "uint256" },
          { name: "maxExecutions", type: "uint256" },
        ],
      },
    ],
    outputs: [],
  },
  {
    name: "getConfig",
    type: "function",
    stateMutability: "view",
    inputs: [{ name: "configId", type: "uint256" }],
    outputs: [
      { name: "id", type: "uint256" },
      { name: "owner", type: "address" },
      { name: "name", type: "string" },
      { name: "description", type: "string" },
      { name: "walletGroupCount", type: "uint256" },
      {
        name: "schedule",
        type: "tuple",
        components: [
          { name: "enabled", type: "bool" },
          { name: "intervalMinutes", type: "uint256" },
          { name: "maxExecutions", type: "uint256" },
        ],
      },
      { name: "isPublic", type: "bool" },
      { name: "createdAt", type: "uint256" },
      { name: "updatedAt", type: "uint256" },
    ],
  },
  {
    name: "getWalletGroup",
    type: "function",
    stateMutability: "view",
    inputs: [
      { name: "configId", type: "uint256" },
      { name: "groupIndex", type: "uint256" },
    ],
    outputs: [
      { name: "wallet", type: "address" },
      { name: "walletAmount", type: "uint256" },
      { name: "strategyCount", type: "uint256" },
    ],
  },
  {
    name: "getStrategyAllocation",
    type: "function",
    stateMutability: "view",
    inputs: [
      { name: "configId", type: "uint256" },
      { name: "groupIndex", type: "uint256" },
      { name: "strategyIndex", type: "uint256" },
    ],
    outputs: [
      { name: "strategy", type: "uint8" },
      { name: "subPercent", type: "uint16" },
    ],
  },
  {
    name: "getUserConfigIds",
    type: "function",
    stateMutability: "view",
    inputs: [{ name: "user", type: "address" }],
    outputs: [{ name: "", type: "uint256[]" }],
  },
  {
    name: "getPublicConfigIds",
    type: "function",
    stateMutability: "view",
    inputs: [],
    outputs: [{ name: "", type: "uint256[]" }],
  },
  {
    name: "deleteConfig",
    type: "function",
    stateMutability: "nonpayable",
    inputs: [{ name: "configId", type: "uint256" }],
    outputs: [],
  },
] as const;
