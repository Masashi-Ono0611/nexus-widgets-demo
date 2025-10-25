export const REGISTRY_ABI = [
  {
    name: "saveConfig",
    type: "function",
    stateMutability: "nonpayable",
    inputs: [
      { name: "name", type: "string" },
      { name: "description", type: "string" },
      {
        name: "recipients",
        type: "tuple[]",
        components: [
          { name: "wallet", type: "address" },
          { name: "sharePercent", type: "uint16" },
          { name: "strategy", type: "uint8" },
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
        name: "recipients",
        type: "tuple[]",
        components: [
          { name: "wallet", type: "address" },
          { name: "sharePercent", type: "uint16" },
          { name: "strategy", type: "uint8" },
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
      { name: "recipientCount", type: "uint256" },
      { name: "isPublic", type: "bool" },
      { name: "createdAt", type: "uint256" },
      { name: "updatedAt", type: "uint256" },
    ],
  },
  {
    name: "getRecipient",
    type: "function",
    stateMutability: "view",
    inputs: [
      { name: "configId", type: "uint256" },
      { name: "recipientIndex", type: "uint256" },
    ],
    outputs: [
      { name: "wallet", type: "address" },
      { name: "sharePercent", type: "uint16" },
      { name: "strategy", type: "uint8" },
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
