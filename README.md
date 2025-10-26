# Toke Of App

**A PayFi App with Multi-Wallet Distribution, Multi-Strategy Allocation, and Automated Recurring from Multiple Chains**

This app is a payment tool with:
- **Multi-Wallet Distribution**: Send payments to multiple recipients simultaneously
- **Multi-Strategy Allocation**: Allocate funds across different DeFi protocols (AAVE, Morpho, Uniswap)
- **Automated Recurring**: Schedule recurring payments with customizable intervals
- **Cross-Chain Support**: Accept payments from multiple major EVM chains and bridge seamlessly

> **Note**: This project is designed for testnet environments only (Base Sepolia, Arbitrum Sepolia, Optimism Sepolia).

## Features

- **Payroll Manager**: Configure wallet groups, execute one-off payouts, or schedule recurring runs with DeFi strategy allocations
- **Gifting Manager**: Percentage-based USDC gifting with DeFi strategy allocations and cross-chain execution
- **Cross-chain Bridge**: Seamless token bridging through Nexus Widgets
- **DeFi Integration**: Support for AAVE, Morpho Vault, and Uniswap V2 strategies
- **Config Management**: On-chain storage for saving and loading payroll/gifting configurations
- **Network Gate**: Automatic wallet connection and network switching to Arbitrum Sepolia
- **Gelato Automation**: Scheduled recurring payments with time-based execution

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

## Development

### Contract Development

#### Adding a New Contract
1. **Create Contract File**: Add your Solidity contract to `contracts/YourContract.sol`
2. **Compile Contract**: `pnpm hardhat compile`
3. **Add Deployment Script**: Add to `package.json`
   ```json
   "deploy:your-contract": "HARDHAT_NETWORK=${HARDHAT_NETWORK:-${npm_config_network:-arbitrumSepolia}} CONTRACT_NAME=YourContract tsx --tsconfig tsconfig.hardhat.json scripts/deployContract.ts"
   ```
4. **Create Test Script**: `scripts/testYourContract.ts`
   ```json
   "test:your-contract": "HARDHAT_NETWORK=${HARDHAT_NETWORK:-${npm_config_network:-arbitrumSepolia}} tsx --tsconfig tsconfig.hardhat.json scripts/testYourContract.ts"
   ```
5. **Create UI Component**: `src/app/_components/YourContractCard.tsx` using `BridgeAndExecuteButton`

#### Testing
```bash
# Run all Hardhat tests
pnpm run test:contracts

# Run specific test scripts
pnpm run test:flexible-splitter
pnpm run test:recurring-splitter
pnpm run test:payroll-config-registry
pnpm run test:gifting-config-registry
```

#### Deployment Commands
```bash
# Deploy to Base Sepolia (default)
pnpm run deploy:delayed-transfer

# Deploy to specific network
HARDHAT_NETWORK=arbitrumSepolia pnpm run deploy:auto-splitter

# Deploy FlexibleSplitter (requires constructor args)
pnpm run deploy:flexible-splitter
```

**Note**: FlexibleSplitter requires AAVE Pool and Morpho Vault addresses as constructor arguments. Update `scripts/deploy/deployFlexibleSplitter.ts` for network-specific addresses before deployment.

### After Deployment
1. Copy the deployed contract address from the output
2. Update the corresponding UI component in `src/app/_components/`
3. Update the test script in `scripts/` if applicable

## DeFi Strategy Integration

### Supported Strategies

1. **Direct Transfer**: Send tokens directly to recipient wallet
2. **AAVE Supply**: Supply tokens to AAVE protocol on behalf of recipient
3. **Morpho Deposit**: Deposit tokens to Morpho Vault on behalf of recipient
4. **Uniswap V2 Swap**: Swap USDC to WETH via Uniswap V2 (Arbitrum Sepolia only)

## Tech Stack

### Frontend
- **Next.js 14** with App Router for modern React development
- **TypeScript** for type-safe development
- **React 18** with hooks and concurrent features
- **Tailwind CSS** for utility-first styling
- **Radix UI** components for accessible UI primitives
- **Wagmi v2** for Ethereum interaction and wallet management
- **Viem v2** for low-level Ethereum operations
- **RainbowKit** for multi-wallet connection UI
- **TanStack Query** for state management
- **Sonner** for toast notifications

### Web3 Integration
- **Avail Nexus Widgets** for cross-chain bridge functionality
- **@walletconnect** for multi-chain wallet connections
- **@gelatonetwork/automate-sdk** for automation services

### Smart Contracts
- **Solidity ^0.8.25** with OpenZeppelin contracts
- **Hardhat** for development, testing, and deployment
- **TypeScript** for deployment scripts and testing

### DeFi Protocols
- **AAVE**: Lending and borrowing protocol integration
- **Morpho Vault v2**: ERC4626 compatible yield optimization
- **Uniswap V2**: Decentralized exchange for token swaps

## Cross-Chain Integration

### Avail Nexus Widget Integration

#### Bridge Execution Flow
The application leverages **Avail Nexus Widgets** (`@avail-project/nexus-widgets`) for seamless cross-chain token bridging:

```typescript
// BridgeAndExecuteButton usage pattern
<BridgeAndExecuteButton
  contractAddress={CONTRACT_ADDRESS}
  contractAbi={CONTRACT_ABI}
  functionName="distributeTokens"
  prefill={{
    toChainId: 421614, // Arbitrum Sepolia
    token: "USDC"
  }}
  buildFunctionParams={(token, amount, chainId, userAddress) => {
    const tokenAddress = TOKEN_CONTRACT_ADDRESSES[token][chainId];
    const amountWei = parseUnits(amount, decimals);

    return {
      functionParams: [tokenAddress, amountWei, recipients]
    };
  }}
/>
```

#### Token Address Management
- **TOKEN_CONTRACT_ADDRESSES**: SDK-provided token addresses per chain
- **TOKEN_METADATA**: Token decimals and metadata
- **Chain-specific bridging**: Support for Base Sepolia, Arbitrum Sepolia, Optimism Sepolia

#### Bridge Execution Flow
1. User selects target chain and token
2. Widget handles token bridging to destination chain
3. Smart contract execution on destination chain
4. Real-time transaction status updates

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