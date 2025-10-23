export const FLEXIBLE_SPLITTER_ABI = [
  {
    inputs: [
      { name: "asset", type: "address" },
      { name: "amount", type: "uint256" },
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
    name: "distributeTokens",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
] as const;
