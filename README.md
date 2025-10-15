# Payment Splitter Bridge & Execute Requirements

## Objectives
- **Implement Split Flow** Enable Wallet A to bridge a single USDC amount and distribute it to fixed recipients (Wallet B 70%, Wallet C 20%, Wallet D 10%) on the destination chain.
- **Leverage Existing Widget** Extend `src/app/_components/BridgeAndExecuteCard.tsx` to call a deployed `PaymentSplitter` contract via the `BridgeAndExecuteButton`.
- **Avoid Bridge Skips** Ensure the splitter contract keeps a zero balance after each execution so that the SDK performs the bridge step when Wallet A lacks sufficient funds on the destination chain.

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
