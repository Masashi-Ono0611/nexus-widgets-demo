# Payment Splitter Bridge & Execute Requirements

## Objectives
- **Implement Split Flow** Enable Wallet A to bridge a single USDC amount and distribute it to fixed recipients (Wallet B 70%, Wallet C 20%, Wallet D 10%) on the destination chain.
- **Leverage Existing Widget** Extend `src/app/_components/BridgeAndExecuteCard.tsx` to call a deployed `PaymentSplitter` contract via the `BridgeAndExecuteButton`.
- **Avoid Bridge Skips** Ensure the splitter contract keeps a zero balance after each execution so that the SDK performs the bridge step when Wallet A lacks sufficient funds on the destination chain.

## Versions
- Node.js `v20.18.0`
- pnpm `v10.15.0`
- Hardhat `2.26.3`
- tsx `4.20.6`

## Technical Requirements
- **Contract** Deploy a `PaymentSplitter` contract that receives bridged USDC and forwards the full amount to the predefined wallets in a single call (e.g., `distribute()`).
- **Widget Wiring**
  - Set `contractAddress` to the splitter contract.
  - Provide an ABI that exposes the distribution function.
  - Implement `buildFunctionParams` to encode `[tokenAddress, amountWei, recipients, shares]` (or the chosen signature) using `TOKEN_CONTRACT_ADDRESSES` and `TOKEN_METADATA`.
  - Optionally prefill `toChainId`, `token`, and `amount` for the modal.
- **Monitoring** Surface `metadata.bridgeSkipped` from `simulateBridgeAndExecute()` to flag any unintended skip events.

## Testing Checklist
- **Unit Tests** Verify `PaymentSplitter` correctly handles ERC-20 transfers and leaves no residual balance.
- **Integration Tests**
  - Confirm the bridge + execute flow succeeds on the chosen testnets (e.g., Base Sepolia → Arbitrum Sepolia).
  - Validate distribution amounts and transaction hashes on block explorers.
- **Failure Handling** Ensure the UI warns users when `bridgeSkipped` is `true` or when allowance approvals are required.

## Official AAVE Markets (https://app.aave.com/)

### Sepolia: Not Available
- **Market Contract**: `0x794a61358D6845594F94dc1DB02A252b5b4814aD` (matches sample code)
- **USDC Address**: `0x94a9D9AC8a22534E3FaCa9F4e7F2E2cf85d5E4C8`
- **Issue**: This USDC differs from Nexus-supported and Circle faucet USDC (`0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238`)

### Arbitrum Sepolia: Available
- **Market Contract**: `0xBfC91D59fdAA134A4ED45f7B584cAf96D7792Eff`
- **USDC Address**: `0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238` (Nexus-supported and Circle faucet compatible)

### Base Sepolia: Not Available
- **Market Contract**: Not confirmed
- **USDC Address**: `0xba50Cd2A20f6DA35D788639E581bca8d0B5d4D5f`
- **Issue**: This USDC differs from Nexus-supported and Circle faucet USDC (`0x036CbD53842c5426634e7929541eC2318f3dCF7e`)

### Optimism Sepolia: Available
- **Market Contract**: `0xb50201558B00496A145fE76f7424749556E326D8`
- **USDC Address**: `0x5fd84259d66Cd46123540766Be93DFE6D43130D7` (Nexus-supported and Circle faucet compatible)
- testing stuff
