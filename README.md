# Nexus Widgets Demo

A demonstration project for cross-chain bridge and execute functionality using Nexus Widgets, featuring automated delayed transfers with Gelato Automate integration.

> **Note**: This project is designed for testnet environments only (Sepolia, Base Sepolia, Arbitrum Sepolia, Optimism Sepolia).

## Requirements

- Node.js `v20.18.0` or higher
- pnpm `v10.15.0` or higher
- Hardhat `2.26.3`
- tsx `4.20.6`

## Initial Setup

### 1. Install Dependencies

```bash
pnpm install
```

### 2. Environment Configuration

Copy `.env.example` to `.env` and fill in your values:

```bash
cp .env.example .env
```

See `.env.example` for all available configuration options.

### 3. Start Development Server

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### 4. Get Testnet USDC

Get free testnet USDC from Circle's faucet:
- **Circle USDC Faucet**: [https://faucet.circle.com/](https://faucet.circle.com/)
- Supports: Sepolia, Base Sepolia, Arbitrum Sepolia, Optimism Sepolia

## Contract Deployment

### Deploy a Contract

Use the unified deployment script:

```bash
# Deploy to Base Sepolia (default)
pnpm run deploy:delayed-transfer

# Deploy to a specific network
HARDHAT_NETWORK=arbitrumSepolia pnpm run deploy:auto-splitter
```

See `package.json` scripts section for all available deployment commands.

### After Deployment

1. Copy the deployed contract address from the output
2. Update the corresponding UI component in `src/app/_components/`
3. Update the test script in `scripts/` if applicable

## Testing

### Run Contract Tests

```bash
# Run all Hardhat tests
pnpm run test:contracts

# Run specific test scripts
pnpm run test:delayed-transfer
pnpm run test:uniswap-v4-swap
```

### Test Script Usage Examples

```bash
# Check DelayedTransfer contract state
pnpm run test:delayed-transfer

# Schedule a transfer with 1 minute delay
pnpm run test:delayed-transfer 1

# Execute Transfer ID 0
pnpm run test:delayed-transfer 3 0
```

## Adding a New Contract

### 1. Create Contract File

Add your Solidity contract to `contracts/YourContract.sol`

### 2. Compile Contract

```bash
pnpm hardhat compile
```

### 3. Add Deployment Script

Add to `package.json`:

```json
"deploy:your-contract": "HARDHAT_NETWORK=${HARDHAT_NETWORK:-${npm_config_network:-baseSepolia}} CONTRACT_NAME=YourContract tsx --tsconfig tsconfig.hardhat.json scripts/deployContract.ts"
```

### 4. Create Test Script (Optional)

Create `scripts/testYourContract.ts` and add to `package.json`:

```json
"test:your-contract": "HARDHAT_NETWORK=${HARDHAT_NETWORK:-${npm_config_network:-baseSepolia}} tsx --tsconfig tsconfig.hardhat.json scripts/testYourContract.ts"
```

### 5. Create UI Component

Create a component in `src/app/_components/YourContractCard.tsx` using `BridgeAndExecuteButton`

## Implemented Features

Features are listed in the order they appear on the UI (`src/app/page.tsx`):

### 1. Bridge
- **UI**: `BridgeCard.tsx`
- **Description**: Simple cross-chain token bridge.

### 2. Transfer
- **UI**: `TransferCard.tsx`
- **Description**: Bridge and transfer tokens.

### 3. Transfer (Base)
- **UI**: `TransferBaseCard.tsx`
- **Contract**: `AutoTransfer.sol`
- **Description**: Bridge and forward tokens to a fixed address on Base Sepolia.

### 4. Transfer Split (Base)
- **UI**: `TransferSplitBaseCard.tsx`
- **Description**: Bridge and split transfer on Base Sepolia.

### 5. AAVE Supply (Optimism)
- **UI**: `SupplyOptimismCard.tsx`
- **Description**: Bridge USDC and supply to AAVE on Optimism Sepolia.

### 6. AAVE Supply (Arbitrum)
- **UI**: `SupplyArbitrumCard.tsx`
- **Description**: Bridge USDC and supply to AAVE on Arbitrum Sepolia.

### 7. AAVE Supply Splitter (Arbitrum)
- **UI**: `SplitSupplyArbitrumCard.tsx`
- **Contract**: `AaveSupplySplitter.sol`
- **Description**: Bridge USDC and split supply to AAVE between two addresses on Arbitrum Sepolia.

### 8. AAVE Supply Splitter (Optimism)
- **UI**: `SplitSupplyOptimismCard.tsx`
- **Contract**: `AaveSupplySplitter.sol`
- **Description**: Bridge USDC and split supply to AAVE between two addresses on Optimism Sepolia.

### 9. Morpho Supply (Base)
- **UI**: `MorphoSupplyBaseCard.tsx`
- **Description**: Bridge USDC and supply to Morpho Vault on Base Sepolia.

### 10. Morpho Deposit Splitter (Base)
- **UI**: `MorphoSplitDepositBaseCard.tsx`
- **Contract**: `MorphoDepositSplitter.sol` (`0x104A5ED0a02e95b23D0C29543Ab8Bed5Dd4010eD`)
- **Description**: Bridge USDC and split deposit to Morpho Vault between two addresses on Base Sepolia.

### 11. Uniswap V4 Swap (Base)
- **UI**: `UniswapV4SwapCard.tsx`
- **Description**: Swap tokens using Uniswap V4 on Base Sepolia.

### 12. Delayed Transfer (Base)
- **UI**: `DelayedTransferCard.tsx`
- **Contract**: `DelayedTransfer.sol` (`0x9B31E6D589657d37fFf3d8D8f3699C8d28c4B8F9`)
- **Description**: Schedule token transfers with customizable delay (1 minute to 365 days) on Base Sepolia. Gelato Automate automatically executes transfers when the delay period expires.
- **Features**:
  - Automatic Gelato task creation on first use
  - Customizable recipient address
  - Flexible delay time in minutes
  - Manual execution available

## Issues Found

### 1. AAVE Markets USDC Compatibility

Some AAVE markets use different USDC addresses than Nexus Widgets and Circle faucet. **Always check compatibility before deployment.**

#### Sepolia
- Market: `0x794a61358D6845594F94dc1DB02A252b5b4814aD`
- USDC: `0x94a9D9AC8a22534E3FaCa9F4e7F2E2cf85d5E4C8`
- ⚠️ **Incompatible** with Nexus USDC (`0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238`)

#### Arbitrum Sepolia ✅
- Market: `0xBfC91D59fdAA134A4ED45f7B584cAf96D7792Eff`
- USDC: `0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238`
- ✅ **Compatible** with Nexus and Circle faucet

#### Base Sepolia
- Market: Not confirmed
- USDC: `0xba50Cd2A20f6DA35D788639E581bca8d0B5d4D5f`
- ⚠️ **Incompatible** with Nexus USDC (`0x036CbD53842c5426634e7929541eC2318f3dCF7e`)

#### Optimism Sepolia ✅
- Market: `0xb50201558B00496A145fE76f7424749556E326D8`
- USDC: `0x5fd84259d66Cd46123540766Be93DFE6D43130D7`
- ✅ **Compatible** with Nexus and Circle faucet

### 2. Token Approval Error in BridgeAndExecute

**Condition:**
- When using the BridgeAndExecute function on Nexus Widgets
- If the approved token amount for the specified `toChainId` and token is less than the sending amount

**Error Behavior:**
- Right after signing the approval transaction, the UI shows:
  ```
  Transaction failed to execute. This might be a temporary network issue.
  ```
- This error consistently occurs if you revoke all approvals (e.g., using [revoke.cash](https://revoke.cash/)) and run the test again

**Workaround:**
- Manually approve a higher token allowance in a separate transaction before using BridgeAndExecute
- You can use [revoke.cash](https://revoke.cash/) to set the approval amount

### 3. Sepolia USDC Address Inconsistency in Nexus SDK

**Issue:**
The Nexus SDK contains two different USDC addresses for Ethereum Sepolia (Chain ID: 11155111):

1. **`TOKEN_CONTRACT_ADDRESSES.USDC[SEPOLIA]`**: `0xf08A50178dfcDe18524640EA6618a1f965821715`
   - Used in widget components for building function parameters

2. **`knownTokens` (actual bridged token)**: `0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238`
   - This is the **Circle USDC** that Nexus Widget actually bridges
   - Compatible with Circle faucet

**Impact:**
- When using `TOKEN_CONTRACT_ADDRESSES[token][chainId]` in `buildFunctionParams`, contracts receive the wrong USDC address
- Approval transactions may target the wrong token address

**Recommended Solution:**
- **Avoid using Ethereum Sepolia** for USDC BridgeAndExecute operations
- Use alternative testnets instead:
  - **Base Sepolia** (recommended)
  - **Arbitrum Sepolia**
  - **Optimism Sepolia**
- These chains have consistent USDC addresses between `TOKEN_CONTRACT_ADDRESSES` and actual bridged tokens

**Note:** Hardcoding the Circle USDC address in `buildFunctionParams` does not resolve this issue completely due to SDK internal behavior.

<!-- Add more discovered issues here -->
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
