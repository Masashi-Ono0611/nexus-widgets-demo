# Toke Of App

**A PayFi App with Multi-Wallet Distribution, Multi-Strategy Allocation, and Automated Recurring from Multiple Chains**

This app is a payment tool with:
- **Multi-Wallet Distribution**: Send payments to multiple recipients simultaneously
- **Multi-Strategy Allocation**: Allocate funds across different DeFi protocols (AAVE, Morpho, Uniswap)
- **Automated Recurring**: Schedule recurring payments with customizable intervals
- **Cross-Chain Support**: Accept payments from multiple major EVM chains

> **Note**: This project is designed for testnet environments only (Base Sepolia, Arbitrum Sepolia, Optimism Sepolia).

## Features

- **Payroll Manager**: Configure wallet groups, execute one-off payouts, or schedule recurring runs with DeFi strategy allocations
- **Gifting Manager**: Percentage-based USDC gifting with DeFi strategy allocations and cross-chain execution
- **Cross-chain Bridge**: Seamless token bridging through Nexus Widgets
- **DeFi Integration**: Support for AAVE, Morpho Vault, and Uniswap V2 strategies
- **Config Management**: On-chain storage for saving and loading payroll/gifting configurations
- **Network Gate**: Automatic wallet connection and network switching to Arbitrum Sepolia

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
- Supports: Base Sepolia, Arbitrum Sepolia, Optimism Sepolia

## Available Pages

- **/**: Landing page with Payroll and Gifting managers
- **/payroll**: Payroll management with recurring and immediate execution modes
- **/gifting**: Percentage-based gifting with DeFi strategy allocations
- **/morpho**: Direct interaction with Morpho Vault v2 on Arbitrum Sepolia

## Contract Deployment

### Deploy a Contract

Use the unified deployment script:

```bash
# Deploy to Base Sepolia (default)
pnpm run deploy:delayed-transfer

# Deploy to a specific network
HARDHAT_NETWORK=arbitrumSepolia pnpm run deploy:auto-splitter

# Deploy FlexibleSplitter (requires constructor args)
pnpm run deploy:flexible-splitter
```

See `package.json` scripts section for all available deployment commands.

**Note for FlexibleSplitter**: This contract requires AAVE Pool and Morpho Vault addresses as constructor arguments. Update `scripts/deploy/deployFlexibleSplitter.ts` for network-specific addresses before deployment.

### After Deployment

1. Copy the deployed contract address from the output
2. Update the corresponding UI component in `src/app/_components/`
3. Update the test script in `scripts/` if applicable

## Deployed Contracts (Arbitrum Sepolia)

### Core Contracts

- **FlexibleSplitter**: `0x3BE9739723Ad9C8394511d96E3Daf9942A8AD454`
  - Multi-recipient token distribution with DeFi strategies
  - 4 strategies: Direct Transfer, AAVE Supply, Morpho Deposit, Uniswap V2 Swap
  - Deploy: `pnpm run deploy:flexible-splitter`
  - Test: `pnpm run test:flexible-splitter`

- **RecurringSplitter**: `0x4b54649cc3cC15dA42077fcFDAA79E09DC377C2E`
  - Scheduled recurring distributions with Gelato automation
  - Same 4 strategies as FlexibleSplitter
  - Deploy: `pnpm run deploy:recurring-splitter`
  - Test: `pnpm run test:recurring-splitter`

- **SwapExecutor**: `0x783140003cFF6C06B230937707eB5222186F0118`
  - Standalone Uniswap V2 swap contract (USDC → WETH)
  - Deploy: `pnpm run deploy:swap-executor`
  - Test: `pnpm run test:uniswap-v2-swap`

### Configuration Registries

- **PayrollConfigRegistry**: `0x1d5dF7B4553c78318DB8F4833BD22fE92E32F2D7`
  - On-chain storage for payroll configuration presets
  - Shared contract for all users
  - Deploy: `pnpm run deploy:payroll-config-registry`
  - Test: `pnpm run test:payroll-config-registry`

- **GiftingConfigRegistry**: `0x2e14Dc0A48F5d700695fc0c15b35bcf24761756F`
  - On-chain storage for gifting configuration presets
  - Shared contract for all users
  - Deploy: `pnpm run deploy:gifting-config-registry`
  - Test: `pnpm run test:gifting-config-registry`

### External Contracts

- **Morpho Vault v2**: `0xabf102Ed5f977331BdAD74d9136b6bFb7A2F09b6`
  - ERC4626 compatible vault for USDC deposits
  - Direct interaction available at `/morpho`

- **DelayedTransfer**: `0x9B31E6D589657d37fFf3d8D8f3699C8d28c4B8F9`
  - Time-locked token transfers with Gelato automation
  - Deploy: `pnpm run deploy:delayed-transfer`
  - Test: `pnpm run test:delayed-transfer`

## Testing

### Run Contract Tests

```bash
# Run all Hardhat tests
pnpm run test:contracts

# Run specific test scripts
pnpm run test:flexible-splitter
pnpm run test:recurring-splitter
pnpm run test:payroll-config-registry
pnpm run test:gifting-config-registry
```

### Management Commands

For RecurringSplitter schedules:
```bash
# Check schedule status
pnpm run check:recurring-schedule [scheduleId]

# Execute schedule manually
pnpm run execute:recurring-schedule [scheduleId]

# Cancel schedule
pnpm run cancel:recurring-schedule [scheduleId]
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
"deploy:your-contract": "HARDHAT_NETWORK=${HARDHAT_NETWORK:-${npm_config_network:-arbitrumSepolia}} CONTRACT_NAME=YourContract tsx --tsconfig tsconfig.hardhat.json scripts/deployContract.ts"
```

### 4. Create Test Script (Optional)

Create `scripts/testYourContract.ts` and add to `package.json`:

```json
"test:your-contract": "HARDHAT_NETWORK=${HARDHAT_NETWORK:-${npm_config_network:-arbitrumSepolia}} tsx --tsconfig tsconfig.hardhat.json scripts/testYourContract.ts"
```

### 5. Create UI Component

Create a component in `src/app/_components/YourContractCard.tsx` using `BridgeAndExecuteButton`

## DeFi Strategy Integration

### Supported Strategies

1. **Direct Transfer**: Send tokens directly to recipient wallet
2. **AAVE Supply**: Supply tokens to AAVE protocol on behalf of recipient
3. **Morpho Deposit**: Deposit tokens to Morpho Vault on behalf of recipient
4. **Uniswap V2 Swap**: Swap USDC to WETH via Uniswap V2 (Arbitrum Sepolia only)

## Architecture

### Frontend Structure
- **Next.js 14** with App Router
- **TypeScript** for type safety
- **Tailwind CSS** for styling
- **Radix UI** components for accessibility
- **Wagmi** for Web3 integration

### Key Components
- **PayrollManager**: Main payroll interface with wallet group management
- **GiftingManager**: Percentage-based gifting with strategy allocation
- **ConfigManager**: On-chain configuration save/load/update flows
- **NetworkGateModal**: Wallet connection and network switching enforcement

### Contract Architecture
- **FlexibleSplitter**: Core distribution logic with strategy routing
- **RecurringSplitter**: Time-based execution with Gelato automation
- **ConfigRegistry**: Shared on-chain storage for user configurations
- **Strategy Interfaces**: Standardized integration with DeFi protocols

## Issues Found

### 1. AAVE Markets USDC Compatibility

Some AAVE markets use different USDC addresses than Nexus Widgets and Circle faucet. **Always check compatibility before deployment.**

#### Sepolia
- Market: `0x794a61358D6845594F94dc1DB02A252b5b4814aD`
- USDC: `0x94a9D9AC8a22534E3FaCa9F4e7F2E2cf85d5E4C8`
- ⚠️ **Incompatible** with Nexus USDC (`0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238`)

#### Arbitrum Sepolia ✅
- Market: `0xBfC91D59fdAA134A4ED45f7B584cAf96D7792Eff`
- USDC: `0x75faf114eafb1BDbe2F0316DF893fd58CE46AA4d`
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