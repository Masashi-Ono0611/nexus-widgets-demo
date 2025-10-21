// SPDX-License-Identifier: MIT
pragma solidity ^0.8.25;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";

interface IUniswapV2Pair {
    function swap(uint amount0Out, uint amount1Out, address to, bytes calldata data) external;
    function getReserves() external view returns (uint112 reserve0, uint112 reserve1, uint32 blockTimestampLast);
    function token0() external view returns (address);
    function token1() external view returns (address);
}

contract SwapExecutor {
    using SafeERC20 for IERC20;
    
    address public owner;
    
    event SwapExecuted(
        address indexed tokenIn,
        address indexed tokenOut,
        uint256 amountIn,
        uint256 amountOut,
        address indexed recipient
    );
    
    constructor() {
        owner = msg.sender;
    }
    
    modifier onlyOwner() {
        require(msg.sender == owner, "Not owner");
        _;
    }
    
    /**
     * @notice Execute a swap using Uniswap V2 pair (low-level)
     * @param pair The Uniswap V2 pair address
     * @param tokenIn The input token address
     * @param tokenOut The output token address
     * @param amountIn The amount of input token to swap
     * @param recipient The address to receive the output tokens
     * @return amountOut The amount of output tokens received
     */
    function executeSwap(
        address pair,
        address tokenIn,
        address tokenOut,
        uint256 amountIn,
        address recipient
    ) external onlyOwner returns (uint256 amountOut) {
        require(pair != address(0) && tokenIn != address(0) && tokenOut != address(0), "Invalid addresses");
        require(amountIn > 0 && recipient != address(0), "Invalid params");
        
        IUniswapV2Pair pairContract = IUniswapV2Pair(pair);
        address token0 = pairContract.token0();
        
        require(
            (tokenIn == token0 && tokenOut == pairContract.token1()) || 
            (tokenIn == pairContract.token1() && tokenOut == token0),
            "Invalid token pair"
        );
        
        // Get reserves and calculate output
        (uint112 reserve0, uint112 reserve1,) = pairContract.getReserves();
        bool isToken0 = tokenIn == token0;
        
        uint256 reserveIn = isToken0 ? uint256(reserve0) : uint256(reserve1);
        uint256 reserveOut = isToken0 ? uint256(reserve1) : uint256(reserve0);
        
        amountOut = (amountIn * 997 * reserveOut) / ((reserveIn * 1000) + (amountIn * 997));
        require(amountOut > 0, "Insufficient output");
        
        // Transfer tokens and execute swap
        IERC20(tokenIn).safeTransferFrom(msg.sender, pair, amountIn);
        
        pairContract.swap(
            isToken0 ? 0 : amountOut,
            isToken0 ? amountOut : 0,
            recipient,
            new bytes(0)
        );
        
        emit SwapExecuted(tokenIn, tokenOut, amountIn, amountOut, recipient);
    }
    
    /**
     * @notice Withdraw tokens from this contract (emergency function)
     */
    function withdrawToken(address token, uint256 amount) external onlyOwner {
        IERC20(token).safeTransfer(owner, amount);
    }
    
    /**
     * @notice Get the expected output amount for a swap
     */
    function getAmountOut(
        address pair,
        address tokenIn,
        uint256 amountIn
    ) external view returns (uint256 amountOut) {
        IUniswapV2Pair pairContract = IUniswapV2Pair(pair);
        
        address token0 = pairContract.token0();
        (uint112 reserve0, uint112 reserve1,) = pairContract.getReserves();
        
        uint256 reserveIn;
        uint256 reserveOut;
        
        if (tokenIn == token0) {
            reserveIn = uint256(reserve0);
            reserveOut = uint256(reserve1);
        } else {
            reserveIn = uint256(reserve1);
            reserveOut = uint256(reserve0);
        }
        
        uint256 amountInWithFee = amountIn * 997;
        uint256 numerator = amountInWithFee * reserveOut;
        uint256 denominator = (reserveIn * 1000) + amountInWithFee;
        amountOut = numerator / denominator;
        
        return amountOut;
    }
}
