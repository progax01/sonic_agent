import React, { useEffect, useState } from "react";
import SectionInput from "./SectionInput";
import { useLoginContext } from "@/contexts/LoginContext";
import { MdInfo, MdSwapVert } from "react-icons/md";
import { getPoolLists } from "@/services/userService";
import Pagination from "./Pagination";
import useEffectAsync from "../utils/useEffectAsync";
import { Networks, TokenList } from "@/config";
import { FiPlus } from "react-icons/fi";
import { IoWalletOutline } from "react-icons/io5";
import { useSwapContext } from "@/contexts/Swapcontext";
import TransactionStatus from "./TransactionStatus";

const Liquidity = () => {
  const {
    address,
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
    selectedNetwork,
    networkData,
    switchNetwork,
    poolList,
    setPoolList,
    resetValues,
    getPoolReserves,
    transactionStatus,
    transactionMessage,
  } = useLoginContext();

  const [totalPages, setTotalPages] = useState(1);
  const [currentPageNo, setCurrentPageNo] = useState(1);
  const [activeTab, setActiveTab] = useState("all"); // "all" or "my"
  const length = 4;
  const poolListMyShare =
    poolList?.filter((item: any) =>
      item?.users?.some(
        (user: any) => user.address === address && Number(user.liquidity) > 0
      )
    ) || [];

  const isDisabled =
    buttonText == "Select Token" ||
    buttonText == "Enter Amount" ||
    buttonText == "Enter Pool Ratio";
  const [switchData, setSwitchData] = useState<any>(null);
  const [isNotSwitch, setIsNotSwitch] = useState<boolean>(true);
  useEffect(() => {
    if (selectedNetwork != null) {
      setSwitchData(selectedNetwork);
      setIsNotSwitch(
        networkData?.chainId != selectedNetwork?.chainId ? false : true
      ); //For Now Being
    }
  }, [selectedNetwork, networkData]);

  // useEffectAsync(async () => {
  //   const response: any = await getPoolLists(currentPageNo, length);
  //   setPoolList(response?.data?.pools);
  //   setTotalPages(Math.ceil(response?.data?.pools?.length / length) || 1);
  // }, []);

  const {
    selectedLiquidity,
    setSelectedLiquidity,
    selectedToLiquidity,
    setSelectedToLiquidity,
    fromLiquidity,
    setFromLiquidity,
    toLiquidity,
    setToLiquidity,
    isCreatePool,
    setIsCreatePool,
    isAddLiquidity,
    setIsAddLiquidity,
    isRemoveLiquidity,
    setIsRemoveLiquidity,
    setSelectedNetwork,
  } = useLoginContext();

  // Add poolReserves state
  const [poolReserves, setPoolReserves] = useState<{
    tokenA: string;
    tokenB: string;
    reserveA: string;
    reserveB: string;
  } | null>(null);

  useEffect(() => {
    if (fromAmount) {
      setToAmount((Number(fromAmount) * Number(Twoby1)).toFixed(4));
    }
  }, [Twoby1, fromAmount]);

  // Update pool reserves when selected pool changes
  useEffect(() => {
    if (selectedPool) {
      // Set pool reserves from poolList data
      setPoolReserves({
        tokenA: selectedPool.firstTokenAddress,
        tokenB: selectedPool.secondTokenAddress,
        reserveA: selectedPool.firstTokenBalance || "0",
        reserveB: selectedPool.secondTokenBalance || "0",
      });
    } else {
      setPoolReserves(null);
    }
  }, [selectedPool]);

  // Format number with commas for display
  const formatNumber = (num: string) => {
    return parseFloat(num).toLocaleString("en-US", {
      maximumFractionDigits: 6,
    });
  };

  // Calculate the expected amount of the second token based on pool reserves
  useEffect(() => {
    if (
      poolReserves &&
      fromAmount &&
      selectedLiquidity &&
      selectedToLiquidity
    ) {
      // Find which token corresponds to which reserve
      const isFirstToken =
        poolReserves.tokenA.toLowerCase() ===
          selectedLiquidity.address.toLowerCase() ||
        poolReserves.tokenB.toLowerCase() ===
          selectedLiquidity.address.toLowerCase();

      if (isFirstToken && !isRemoveLiquidity) {
        // For adding liquidity, calculate based on the ratio of reserves
        const reserveA = parseFloat(
          poolReserves.tokenA.toLowerCase() ===
            selectedLiquidity.address.toLowerCase()
            ? poolReserves.reserveA
            : poolReserves.reserveB
        );

        const reserveB = parseFloat(
          poolReserves.tokenB.toLowerCase() ===
            selectedToLiquidity.address.toLowerCase()
            ? poolReserves.reserveB
            : poolReserves.reserveA
        );

        if (reserveA > 0 && reserveB > 0) {
          const ratio = reserveB / reserveA;
          const calculatedAmount = parseFloat(fromAmount) * ratio;
          setToAmount(calculatedAmount.toFixed(6));
        }
      }
    }
  }, [
    fromAmount,
    poolReserves,
    selectedLiquidity,
    selectedToLiquidity,
    isRemoveLiquidity,
  ]);

  // Function to calculate user's share percentage
  const calculateUserShare = (pool: any) => {
    if (!pool?.users || !address) return 0;

    const userLiquidity = pool?.users?.find(
      (user: any) => user.address === address
    )?.liquidity;
    if (!userLiquidity || !pool.liquidityTokenBalance) return 0;

    return (
      (Number(userLiquidity) / Number(pool.liquidityTokenBalance)) *
      100
    ).toFixed(2);
  };

  // Function to swap tokens in the form
  const handleSwapTokens = () => {
    if (selectedLiquidity && selectedToLiquidity) {
      const tempToken = selectedLiquidity;
      setSelectedLiquidity(selectedToLiquidity);
      setSelectedToLiquidity(tempToken);

      // Update the ratio
      if (Twoby1 && Number(Twoby1) !== 0) {
        setTwoby1((1 / Number(Twoby1)).toFixed(4));
      }

      // Swap amounts
      const tempAmount = fromAmount;
      setFromAmount(Number(toAmount));
      setToAmount(Number(tempAmount));
    }
  };

  const renderPoolReserves = () => {
    if (!poolReserves || !selectedPool) return null;

    return (
      <div className="w-full px-4 py-3 bg-gray-800/50 rounded-lg border border-purple-500/20 my-4">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm text-gray-400">Pool Reserves</span>
          <span className="text-xs text-purple-400">
            {selectedPool.poolAddress &&
              `${selectedPool.poolAddress.substring(
                0,
                6
              )}...${selectedPool.poolAddress.substring(
                selectedPool.poolAddress.length - 4
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
        {isAddLiquidity && (
          <div className="mt-2 pt-2 border-t border-purple-500/20">
            <div className="text-xs text-gray-400">
              Current Ratio: 1 {selectedLiquidity?.symbol} ={" "}
              {poolReserves && selectedLiquidity && selectedToLiquidity
                ? parseFloat(
                    poolReserves.tokenA.toLowerCase() ===
                      selectedLiquidity.address.toLowerCase()
                      ? (
                          parseFloat(poolReserves.reserveB) /
                          parseFloat(poolReserves.reserveA)
                        ).toFixed(6)
                      : (
                          parseFloat(poolReserves.reserveA) /
                          parseFloat(poolReserves.reserveB)
                        ).toFixed(6)
                  ).toLocaleString("en-US", { maximumFractionDigits: 6 })
                : "0"}{" "}
              {selectedToLiquidity?.symbol}
            </div>
          </div>
        )}
      </div>
    );
  };

  // Call getPoolReserves when component mounts or when network changes
  useEffect(() => {
    if (networkData?.provider && address) {
      getPoolReserves();
    }
  }, [networkData, address]);

  return (
    <div className="relative w-full h-full flex flex-col md:flex-row gap-4 p-4">
      {/* Overview */}
      <div className="relative flex flex-col w-full md:w-[70%] h-full bg-[#1A1D21] text-white border border-[#39393A] rounded-xl shadow-lg">
        <div className="flex h-[60px] items-center justify-between px-5 border-b border-[#39393A] ">
          <div className="flex space-x-4">
            <button
              className={`text-base font-medium px-4 py-2 rounded-md transition-all ${
                activeTab === "all"
                  ? "bg-gradient-to-r from-purple-500 to-pink-500 text-white"
                  : "text-gray-400 hover:text-white"
              }`}
              onClick={() => setActiveTab("all")}
            >
              All Pools
            </button>
            <button
              className={`text-base font-medium px-4 py-2 rounded-md transition-all ${
                activeTab === "my"
                  ? "bg-gradient-to-r from-purple-500 to-pink-500 text-white"
                  : "text-gray-400 hover:text-white"
              }`}
              onClick={() => setActiveTab("my")}
            >
              My Liquidity
            </button>
          </div>
          <button
            className="text-white text-sm font-medium bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 transition-all text-center rounded-md px-4 py-2 flex items-center gap-2"
            onClick={() => {
              setIsAddLiquidity(false);
              setIsCreatePool(true);
              setIsRemoveLiquidity(false);
              resetValues();
            }}
          >
            <FiPlus className="size-4" />
            Create Pool
          </button>
        </div>
        <div className="relative h-[620px] w-full flex-1 flex flex-col">
          <div className="w-full h-[566px] px-6 py-4">
            <div className="grid sm:grid-cols-2 grid-cols-1 grid-rows-2 gap-4 h-full overflow-y-auto">
              {(activeTab === "all" ? poolList : poolListMyShare)?.length >
              0 ? (
                (activeTab === "all" ? poolList : poolListMyShare)
                  .slice(length * (currentPageNo - 1), length * currentPageNo)
                  .map((item, index) => {
                    const firstToken = TokenList.find(
                      (token: any) => token.address === item.firstTokenAddress
                    );
                    const secondToken = TokenList.find(
                      (token: any) => token.address === item.secondTokenAddress
                    );
                    const userSharePercent = calculateUserShare(item);

                    return (
                      <div
                        key={index}
                        id={index.toString()}
                        className="w-full h-a rounded-lg bg-[#242830] flex justify-between flex-col p-4 border border-[#39393A] hover:border-purple-500 transition-all shadow-md hover:shadow-purple-500/10"
                      >
                        <div className="w-full flex flex-row items-center justify-between mb-3">
                          <div className="flex flex-row items-center">
                            <div className="bg-black rounded-full size-8 flex items-center justify-center z-10">
                              <img
                                src={firstToken?.logo}
                                className="size-6"
                                alt="First token logo"
                              />
                            </div>
                            <div className="bg-black rounded-full -translate-x-2 size-8 flex items-center justify-center z-0">
                              <img
                                src={secondToken?.logo}
                                className="size-6"
                                alt="Second token logo"
                              />
                            </div>
                            <p className="ml-1 text-sm font-semibold text-white">
                              {firstToken?.name}/{secondToken?.name}
                            </p>
                          </div>
                          <button
                            className="flex items-center justify-center bg-[#1A1D21] p-1.5 rounded-full hover:bg-purple-500/20 transition-all"
                            onClick={() => {}}
                          >
                            <MdInfo className="size-5 text-gray-400 hover:text-white" />
                          </button>
                        </div>

                        <div className="grid grid-cols-2 gap-3 mb-3">
                          <div className="bg-[#1A1D21] rounded-md p-2.5">
                            <p className="text-xs text-gray-400 font-medium mb-1">
                              Pool Reserve
                            </p>
                            <div className="flex flex-col">
                              <p className="text-xs text-white font-medium">
                                {Number(
                                  item?.firstTokenBalance
                                ).toLocaleString()}{" "}
                                {firstToken?.symbol}
                              </p>
                              <p className="text-xs text-white font-medium">
                                {Number(
                                  item?.secondTokenBalance
                                ).toLocaleString()}{" "}
                                {secondToken?.symbol}
                              </p>
                            </div>
                          </div>

                          <div className="bg-[#1A1D21] rounded-md p-2.5">
                            <p className="text-xs text-gray-400 font-medium mb-1">
                              Your Share
                            </p>
                            <div className="flex items-center">
                              {Number(userSharePercent) > 0 ? (
                                <div className="w-full bg-gray-700 rounded-full h-1.5">
                                  <div
                                    className="bg-gradient-to-r from-purple-500 to-pink-500 h-1.5 rounded-full"
                                    style={{
                                      width: `${Math.min(
                                        Number(userSharePercent),
                                        100
                                      )}%`,
                                    }}
                                  ></div>
                                </div>
                              ) : (
                                <p className="text-xs text-gray-400 font-medium">
                                  No position
                                </p>
                              )}
                              {Number(userSharePercent) > 0 && (
                                <p className="text-xs text-white font-medium ml-2">
                                  {userSharePercent}%
                                </p>
                              )}
                            </div>
                          </div>
                        </div>

                        <div className="relative w-full flex flex-row space-x-2 mt-auto">
                          <button
                            className="h-9 w-full rounded-md bg-[#1A1D21] text-white text-xs font-medium border border-[#39393A] hover:bg-[#39393A] transition-all flex items-center justify-center gap-1"
                            onClick={() => {
                              // Find the most up-to-date pool data
                              const updatedPool =
                                poolList.find(
                                  (p) => p.poolAddress === item.poolAddress
                                ) || item;
                              setSelectedPool(updatedPool);
                              setIsAddLiquidity(false);
                              setIsCreatePool(false);
                              setIsRemoveLiquidity(true);
                              setSelectedNetwork(
                                Networks.filter(
                                  (network) =>
                                    network.code == updatedPool.chainId
                                )[0]
                              );
                              setSelectedLiquidity(
                                TokenList.filter(
                                  (token: any) =>
                                    token.address ==
                                    updatedPool.firstTokenAddress
                                )[0]
                              );
                              setSelectedToLiquidity(
                                TokenList.filter(
                                  (token: any) =>
                                    token.address ==
                                    updatedPool.secondTokenAddress
                                )[0]
                              );
                              setTwoby1(
                                Number(
                                  updatedPool.secondTokenBalance /
                                    updatedPool.firstTokenBalance
                                ).toFixed(4)
                              );
                            }}
                          >
                            <IoWalletOutline className="size-4" />
                            Withdraw
                          </button>
                          <button
                            className="h-9 w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 transition-all rounded-md text-white text-xs font-medium flex items-center justify-center gap-1"
                            onClick={() => {
                              // Find the most up-to-date pool data
                              const updatedPool =
                                poolList.find(
                                  (p) => p.poolAddress === item.poolAddress
                                ) || item;
                              setSelectedPool(updatedPool);
                              setIsAddLiquidity(true);
                              setIsCreatePool(false);
                              setIsRemoveLiquidity(false);
                              setSelectedNetwork(
                                Networks.filter(
                                  (network) =>
                                    network.code == updatedPool.chainId
                                )[0]
                              );
                              setSelectedLiquidity(
                                TokenList.filter(
                                  (token: any) =>
                                    token.address ==
                                    updatedPool.firstTokenAddress
                                )[0]
                              );
                              setSelectedToLiquidity(
                                TokenList.filter(
                                  (token: any) =>
                                    token.address ==
                                    updatedPool.secondTokenAddress
                                )[0]
                              );
                              setTwoby1(
                                Number(
                                  updatedPool.secondTokenBalance /
                                    updatedPool.firstTokenBalance
                                ).toFixed(4)
                              );
                            }}
                          >
                            <FiPlus className="size-4" />
                            Add Liquidity
                          </button>
                        </div>
                      </div>
                    );
                  })
              ) : (
                <div className="col-span-2 flex flex-col items-center justify-center py-8 text-center">
                  <div className="bg-[#242830] p-6 rounded-full mb-4">
                    <IoWalletOutline className="size-12 text-gray-400" />
                  </div>
                  <h3 className="text-xl font-medium text-white mb-2">
                    No liquidity found
                  </h3>
                  <p className="text-gray-400 max-w-md mb-6">
                    {activeTab === "all"
                      ? "There are no liquidity pools available yet. Be the first to create one!"
                      : "You haven't provided liquidity to any pools yet."}
                  </p>
                  {activeTab === "my" && (
                    <button
                      className="text-white text-sm font-medium bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 transition-all text-center rounded-md px-4 py-2 flex items-center gap-2"
                      onClick={() => setActiveTab("all")}
                    >
                      View All Pools
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
          {(activeTab === "all" ? poolList : poolListMyShare)?.length > 0 && (
            <div className="h-12 w-full border-t border-[#39393A] flex items-center justify-center">
              <Pagination
                setCurrentPageNo={setCurrentPageNo}
                currentPageNo={currentPageNo}
                totalPages={
                  Math.ceil(
                    (activeTab === "all"
                      ? poolList?.length
                      : poolListMyShare?.length) / length
                  ) || 1
                }
              />
            </div>
          )}
        </div>
      </div>

      {/* DEX */}
      <div className="relative flex flex-col w-full md:w-[30%] h-[calc(100%-1.5rem)] bg-[#1A1D21] text-white border border-[#39393A] rounded-xl shadow-lg">
        <div className="h-[60px] flex items-center justify-center text-center text-white text-lg font-medium border-b border-[#39393A] bg-gradient-to-r from-purple-500/10 to-pink-500/10">
          {isCreatePool
            ? "Create Pool"
            : isAddLiquidity
            ? "Add Liquidity"
            : "Withdraw Liquidity"}
        </div>
        <div className="flex-1 flex flex-col justify-between p-6">
          <div className="space-y-6">
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
              placeholder="Enter amount"
              inputRef="fromAmount"
              setInputValue={setFromAmount}
              inputValue={fromAmount}
            />

            {isAddLiquidity && renderPoolReserves()}
            {isRemoveLiquidity && renderPoolReserves()}

            <div className="relative w-full flex justify-center">
              <button
                onClick={handleSwapTokens}
                className="bg-[#242830] hover:bg-[#39393A] p-2 rounded-full transition-all"
              >
                <MdSwapVert className="size-5 text-gray-400" />
              </button>
            </div>

            <SectionInput
              title="To"
              selectedLiquidity={selectedToLiquidity}
              placeholder="Enter amount"
              inputRef="toAmount"
              setInputValue={setToAmount}
              inputValue={toAmount}
            />

            <div className="relative w-full flex flex-col space-y-3 mt-2">
              <p className="text-sm font-medium text-gray-300">
                Price & Pool Share
              </p>
              <div className="relative flex flex-col space-y-4 w-full bg-[#242830] border border-[#39393A] rounded-lg px-5 py-4">
                {/* As Per Token 1 and Token 2 */}
                <div className="relative w-full flex flex-row space-x-2">
                  <div className="relative w-[50%] flex flex-col space-y-1 items-center justify-center">
                    <div className="bg-[#1A1D21] rounded-md w-full p-2 text-center">
                      {isCreatePool ? (
                        <input
                          key="TokenTwoByTokenOne"
                          id="TwoByOne"
                          value={Twoby1}
                          type="number"
                          className="bg-transparent text-white w-full text-sm text-center !outline-none placeholder:text-[#626262] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                          onChange={(e: any) => {
                            setTwoby1(Number(e.target?.value));
                          }}
                        />
                      ) : selectedPool ? (
                        Twoby1
                      ) : (
                        0
                      )}
                    </div>
                    <p className="text-xs font-normal text-gray-400">
                      {selectedToLiquidity?.symbol || "Token2"} /{" "}
                      {selectedLiquidity?.symbol || "Token1"}{" "}
                    </p>
                  </div>
                  <div className="relative w-[50%] flex flex-col space-y-1 items-center justify-center">
                    <div className="bg-[#1A1D21] rounded-md w-full p-2 text-center">
                      {isCreatePool ? (
                        <input
                          key="Token1/Token2"
                          id="OneByTwo"
                          value={1}
                          disabled={true}
                          className="bg-transparent text-white w-full text-center text-sm !outline-none placeholder:text-[#626262] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                        />
                      ) : (
                        1
                      )}
                    </div>
                    <p className="text-xs font-normal text-gray-400">
                      {selectedLiquidity?.symbol || "Token1"} /{" "}
                      {selectedToLiquidity?.symbol || "Token2"}{" "}
                    </p>
                  </div>
                </div>

                {/* Share of Pool */}
                {isCreatePool ? (
                  <div className="relative w-full flex flex-row space-x-2 items-center justify-center bg-[#1A1D21] rounded-md p-2">
                    {selectedLiquidity && selectedToLiquidity ? (
                      <p className="text-sm text-white text-center">
                        1 {selectedLiquidity?.symbol} = {Twoby1}{" "}
                        {selectedToLiquidity?.symbol}
                      </p>
                    ) : (
                      <p className="text-sm text-gray-400 text-center">
                        Select tokens to see exchange rate
                      </p>
                    )}
                  </div>
                ) : (
                  <div className="relative w-full flex items-center justify-between bg-[#1A1D21] rounded-md p-2">
                    <p className="text-sm font-normal text-gray-400">
                      Share of Pool
                    </p>
                    <p className="text-sm font-medium text-white">
                      {selectedPool ? calculateUserShare(selectedPool) : "0"}%
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="mt-6">
            {isNotSwitch ? (
              <button
                disabled={isDisabled}
                className={`text-white text-base font-medium text-center rounded-md w-full h-[48px] transition-all ${
                  isDisabled
                    ? "bg-[#39393A]/60 cursor-not-allowed"
                    : "bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
                }`}
                onClick={continueTransaction}
              >
                {buttonText}
              </button>
            ) : (
              <button
                className="text-white text-base font-medium bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-center rounded-md w-full h-[48px] transition-all"
                onClick={() => {
                  switchNetwork(selectedNetwork.chainId);
                }}
              >
                Switch Network
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Liquidity;
