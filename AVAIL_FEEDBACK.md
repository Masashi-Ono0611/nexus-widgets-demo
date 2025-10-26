# AVAIL_FEEDBACK.md

## Overview

This feedback is based on the integration of **Avail Nexus SDK** and **Nexus Widgets** into a PayFi dApp — **Toke Of App**, designed to handle multi-wallet distributions, recurring DeFi allocations, and cross-chain payments across Base, Arbitrum, and Optimism Sepolia networks.

The app leverages `@avail-project/nexus-widgets` primarily through the `BridgeAndExecuteButton` component for cross-chain USDC transfers and on-chain function execution.

Overall, the SDK experience was positive, but several inconsistencies and integration issues were observed during real test deployments and UI interactions.

---

## General Experience

- The Nexus Widgets simplified cross-chain bridge execution, and the prefill + parameter builder pattern was intuitive.
- However, there were notable inconsistencies in token addresses across networks and unclear handling of token approvals.
- The documentation could benefit from more detailed examples and explanations of expected behaviors, especially for multi-chain setups and contract integrations.

---

## Issues Identified

### 1. USDC Compatibility Mismatch with AAVE Markets

**Description:**  
Certain AAVE testnet markets use USDC contract addresses that differ from both the Circle faucet and Nexus SDK token lists.  
This causes bridging and DeFi allocation failures when tokens are sent to AAVE pools.

| Network | Market Address | AAVE USDC | Nexus USDC | Compatibility |
|----------|----------------|------------|-------------|----------------|
| Sepolia | `0x794a61358D6845594F94dc1DB02A252b5b4814aD` | `0x94a9D9AC8a22534E3FaCa9F4e7F2E2cf85d5E4C8` | `0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238` | ❌ |
| Arbitrum Sepolia | `0xBfC91D59fdAA134A4ED45f7B584cAf96D7792Eff` | `0x75faf114eafb1BDbe2F0316DF893fd58CE46AA4d` | ✅ | ✅ |
| Base Sepolia | Not confirmed | `0xba50Cd2A20f6DA35D788639E581bca8d0B5d4D5f` | `0x036CbD53842c5426634e7929541eC2318f3dCF7e` | ❌ |
| Optimism Sepolia | `0xb50201558B00496A145fE76f7424749556E326D8` | `0x5fd84259d66Cd46123540766Be93DFE6D43130D7` | ✅ | ✅ |

**Impact:**  
Contracts interacting with AAVE markets fail when tokens come from the wrong USDC contract.

**Recommendation:**  
- Provide an SDK-level configuration or compatibility check for token–market alignment.
- Document which USDC addresses are used by Avail Nexus per network.

---

### 2. Token Approval Error in `BridgeAndExecute`

**Condition:**  
Occurs when approved token allowance is less than the amount to be bridged/executed.

**Observed Behavior:**  
- After signing the approval transaction, the UI displays:  


Transaction failed to execute. This might be a temporary network issue.


- The transaction consistently fails if all previous approvals are revoked (e.g., via [revoke.cash](https://revoke.cash)).

**Workaround:**  
Manually set a higher approval amount in a separate transaction before using `BridgeAndExecute`.

**Recommendation:**  
- Improve error messages to specify allowance issues explicitly.  
- Add an automatic retry or “increase allowance” prompt in the widget UI.  
- Clarify this scenario in SDK documentation.

---

### 3. USDC Address Inconsistency in Nexus SDK (Ethereum Sepolia)

**Description:**  
The SDK defines two different USDC addresses for Ethereum Sepolia (Chain ID: `11155111`):

| Source | Address | Notes |
|--------|----------|-------|
| `TOKEN_CONTRACT_ADDRESSES.USDC[SEPOLIA]` | `0xf08A50178dfcDe18524640EA6618a1f965821715` | Used by default in `buildFunctionParams` |
| `knownTokens` | `0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238` | Actual Circle USDC bridged by Nexus |

**Impact:**  
- Approval and execution transactions may use mismatched token addresses.  
- Developers face unexpected reverts or incorrect allowances.

**Recommendation:**  
- Ensure token address consistency across SDK modules.  
- Offer an override mechanism for developers to set preferred token addresses.  
- Add a “known issues” note in documentation for Ethereum Sepolia.

---

## Suggestions for SDK & Documentation Improvement

1. **Add Token Registry Validation**  
 - Include a consistency check across chains for token address alignment within SDK.

2. **Improve Error Transparency**  
 - Provide user-facing error hints (e.g., “Insufficient token approval” vs “Temporary network issue”).

3. **Enhance Cross-Chain Documentation**  
 - Include explicit examples for Arbitrum, Base, and Optimism Sepolia with supported tokens.

4. **Add Known Issues Section in Docs**  
 - Publicly track testnet-specific mismatches (AAVE–USDC incompatibility, Sepolia USDC confusion, etc.)

5. **Expose Internal SDK Token Mappings**  
 - Export the internal token registry for easier debugging and configuration.

---

## Test Environment

| Tool | Version |
|------|----------|
| Node.js | 20.18.0 |
| pnpm | 10.15.0 |
| Hardhat | 2.26.3 |
| tsx | 4.20.6 |
| Chains Tested | Base Sepolia, Arbitrum Sepolia, Optimism Sepolia |
| SDK Used | `@avail-project/nexus-widgets` |

---

## Summary

The **Avail Nexus SDK** provides a robust foundation for multi-chain execution and bridging, but the integration experience would greatly benefit from improved clarity in:
- Token registry consistency,
- Error diagnostics in widget UX,
- Documentation coverage for chain-specific nuances.

These improvements would make the SDK significantly more developer-friendly and production-ready for complex PayFi or DeFi automation systems.

---