import React, { useEffect, useState } from "react";
import SectionInput from "./SectionInput";
import { useLoginContext } from "@/contexts/LoginContext";
import { useSwapContext } from "@/contexts/Swapcontext";
import TransactionStatus from "./TransactionStatus";

const Swap = () => {
  const {
    selectedPool,
    setSelectedPool,
    fromAmount,
    setFromAmount,
    toAmount,
    setToAmount,
    Twoby1,
    setTwoby1,
    buttonText,
    continueTransaction,
    selectedLiquidity,
    setSelectedLiquidity,
    selectedToLiquidity,
    setSelectedToLiquidity,
    fromLiquidity,
    setFromLiquidity,
    toLiquidity,
    setToLiquidity,
    poolList,
  } = useLoginContext();

  const {
    SwapLiquidity,
    calculateOutputAmount,
    transactionStatus,
    transactionMessage,
  } = useSwapContext();

  const [poolReserves, setPoolReserves] = useState<{
    tokenA: string;
    tokenB: string;
    reserveA: string;
    reserveB: string;
  } | null>(null);

  const [isLoading, setIsLoading] = useState(false);
  const [currentPoolAddress, setCurrentPoolAddress] = useState<string | null>(
    null
  );
  const [currentPool, setCurrentPool] = useState<any>(null);

  const isDisabled =
    buttonText == "Select Token" || buttonText == "Enter Amount";

  // Find the pool for the selected tokens
  useEffect(() => {
    if (selectedLiquidity && selectedToLiquidity) {
      const foundPool = poolList.find(
        (pool) =>
          (pool.firstTokenAddress === selectedLiquidity.address &&
            pool.secondTokenAddress === selectedToLiquidity.address) ||
          (pool.firstTokenAddress === selectedToLiquidity.address &&
            pool.secondTokenAddress === selectedLiquidity.address)
      );

      if (foundPool) {
        setCurrentPoolAddress(foundPool.poolAddress);
        setCurrentPool(foundPool);

        // Set pool reserves from poolList data
        setPoolReserves({
          tokenA: foundPool.firstTokenAddress,
          tokenB: foundPool.secondTokenAddress,
          reserveA: foundPool.firstTokenBalance || "0",
          reserveB: foundPool.secondTokenBalance || "0",
        });
      } else {
        setCurrentPoolAddress(null);
        setCurrentPool(null);
        setPoolReserves(null);
      }
    } else {
      setCurrentPoolAddress(null);
      setCurrentPool(null);
      setPoolReserves(null);
    }
  }, [selectedLiquidity, selectedToLiquidity, poolList]);

  // Calculate output amount when input amount changes
  useEffect(() => {
    const calculateOutput = async () => {
      if (
        fromAmount &&
        selectedLiquidity &&
        selectedToLiquidity &&
        poolReserves
      ) {
        setIsLoading(true);
        try {
          // Calculate output amount based on pool reserves
          const inputToken = selectedLiquidity.address;
          const inputAmount = parseFloat(fromAmount);

          let inputReserve, outputReserve;

          if (inputToken.toLowerCase() === poolReserves.tokenA.toLowerCase()) {
            inputReserve = parseFloat(poolReserves.reserveA);
            outputReserve = parseFloat(poolReserves.reserveB);
          } else {
            inputReserve = parseFloat(poolReserves.reserveB);
            outputReserve = parseFloat(poolReserves.reserveA);
          }

          // Calculate output using the constant product formula: x * y = k
          // (inputReserve + inputAmount) * (outputReserve - outputAmount) = inputReserve * outputReserve
          // Solving for outputAmount:
          // outputAmount = outputReserve - (inputReserve * outputReserve) / (inputReserve + inputAmount)

          if (inputReserve > 0 && outputReserve > 0) {
            const outputAmount =
              outputReserve -
              (inputReserve * outputReserve) / (inputReserve + inputAmount);

            // Apply a 0.3% fee
            const outputWithFee = outputAmount * 0.997;

            setToAmount(outputWithFee.toFixed(6));
          }
        } catch (error) {
          console.error("Error calculating output amount:", error);
        } finally {
          setIsLoading(false);
        }
      }
    };

    calculateOutput();
  }, [fromAmount, selectedLiquidity, selectedToLiquidity, poolReserves]);

  // Format number with commas for display
  const formatNumber = (num: string) => {
    return parseFloat(num).toLocaleString("en-US", {
      maximumFractionDigits: 6,
    });
  };

  return (
    <div className="relative w-full h-[80%] flex flex-col justify-center items-center p-4">
      {/* Background with gradient effect */}
      {/* <div className="absolute inset-0 bg-gradient-to-br from-[#297373]/30 to-[#1a1a1a] opacity-80 z-0"></div> */}

      {/* Animated background particles */}
      {/* <div className="absolute inset-0 bg-[url('/assets/grid-pattern.svg')] bg-repeat opacity-10 z-0"></div> */}

      {/* DEX */}
      <div className="relative z-10 flex flex-col w-[90%] max-w-md h-auto bg-[#1a1a1a]/80 backdrop-blur-md text-white border border-purple-500/30 rounded-xl shadow-lg shadow-pink-500/10">
        <div className="relative flex w-full h-[60px] items-center justify-center text-center text-white text-xl font-semibold border-b border-purple-500/20">
          <span className="bg-gradient-to-r from-purple-500 to-pink-500 bg-clip-text text-transparent">
            Swap Tokens
          </span>
        </div>
        <div className="relative flex w-full flex-col items-center justify-start space-y-8 px-6 py-10">
          {/* Transaction Status */}
          {transactionStatus && (
            <TransactionStatus
              status={transactionStatus}
              message={transactionMessage}
            />
          )}

          <SectionInput
            title="From"
            selectedLiquidity={selectedLiquidity}
            placeholder="Minimum Amount"
            inputRef="fromAmount"
            setInputValue={setFromAmount}
            inputValue={fromAmount}
          />

          {/* Pool Reserves Info */}
          {poolReserves && (
            <div className="w-full px-4 py-3 bg-gray-800/50 rounded-lg border border-purple-500/20">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm text-gray-400">Pool Reserves</span>
                <span className="text-xs text-purple-400">
                  {currentPoolAddress &&
                    `${currentPoolAddress.substring(
                      0,
                      6
                    )}...${currentPoolAddress.substring(
                      currentPoolAddress.length - 4
                    )}`}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <div className="flex flex-col">
                  <span className="text-xs text-gray-400">
                    {selectedLiquidity?.symbol || "Token A"}
                  </span>
                  <span className="text-sm font-medium">
                    {poolReserves.tokenA.toLowerCase() ===
                    selectedLiquidity?.address?.toLowerCase()
                      ? formatNumber(poolReserves.reserveA)
                      : formatNumber(poolReserves.reserveB)}
                  </span>
                </div>
                <div className="flex flex-col items-end">
                  <span className="text-xs text-gray-400">
                    {selectedToLiquidity?.symbol || "Token B"}
                  </span>
                  <span className="text-sm font-medium">
                    {poolReserves.tokenB.toLowerCase() ===
                    selectedToLiquidity?.address?.toLowerCase()
                      ? formatNumber(poolReserves.reserveB)
                      : formatNumber(poolReserves.reserveA)}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Arrow indicator */}
          <div className="flex justify-center items-center w-full">
            <div className="p-2 rounded-full bg-[#1a1a1a] border border-purple-500/30">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 text-pink-500"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 14l-7 7m0 0l-7-7m7 7V3"
                />
              </svg>
            </div>
          </div>

          <SectionInput
            title="To"
            selectedLiquidity={selectedToLiquidity}
            placeholder={isLoading ? "Calculating..." : "Minimum Amount"}
            inputRef="toAmount"
            setInputValue={setToAmount}
            inputValue={toAmount}
          />

          <button
            disabled={isDisabled}
            className="text-white text-base font-medium bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 disabled:from-gray-600/60 disabled:to-gray-600/60 text-center rounded-lg w-full h-[50px] transition-all duration-300 shadow-md"
            onClick={() => {
              SwapLiquidity();
            }}
          >
            {buttonText}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Swap;
