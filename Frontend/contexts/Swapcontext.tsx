"use client";
import {
  Dispatch,
  ReactNode,
  SetStateAction,
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";
import { useLoginContext } from "./LoginContext";
import useEffectAsync from "@/app/utils/useEffectAsync";
import { ethers } from "ethers";
import SwapAbi from "../consts/Abis/swapAbi.json";
import deployContractAbi from "../consts/Abis/deployContract.json";
import { getPoolLists } from "@/services/userService";
import { TransactionStatusType } from "@/app/components/TransactionStatus";

interface ISwapState {
  setSelectedToNetwork: Dispatch<any>;
  SwapLiquidity: () => Promise<void>;
  selectedToNetwork: any;
  getReserves: (poolAddress: string) => Promise<{
    tokenA: string;
    tokenB: string;
    reserveA: string;
    reserveB: string;
  } | null>;
  calculateOutputAmount: (
    inputAmount: string,
    inputToken: string,
    poolAddress: string
  ) => Promise<string | null>;
  transactionStatus: TransactionStatusType;
  transactionMessage: string;
}

interface User {
  address: string;
  liquidity: string;
  _id: string;
}

interface Pool {
  _id: string;
  poolAddress: string;
  firstTokenAddress: string;
  secondTokenAddress: string;
  firstTokenBalance: string;
  secondTokenBalance: string;
  liquidityTokenBalance: string;
  users: User[];
  chainId: string;
  createdAt: string;
  updatedAt: string;
  __v: number;
}

interface Graph {
  [key: string]: Pool[]; // Maps token addresses to arrays of connected pools
}

let ethereum: any = null;
if (typeof window !== "undefined") {
  ethereum = window?.ethereum;
}

const LoginContext = createContext<ISwapState>({} as ISwapState);

export function useSwapContext() {
  return useContext(LoginContext);
}

export default function SwapProvider({ children }: { children: ReactNode }) {
  const {
    address,
    selectedLiquidity,
    networkData,
    selectedToLiquidity,
    fromAmount,
    toAmount,
    route,
    buttonText,
    poolList,
    selectedNetwork,
    setToAmount,
    setButtonText,
    setPoolList,
    approveLiquidity,
    updatePoolReserves,
  } = useLoginContext();
  const [pathroute, setPathRoute] = useState<any[]>([]);
  const [selectedToNetwork, setSelectedToNetwork] = useState<any>(null);
  const [transactionStatus, setTransactionStatus] =
    useState<TransactionStatusType>(null);
  const [transactionMessage, setTransactionMessage] = useState<string>("");
  const swapContracts: { [key: string]: string } = {
    Arbitrum: "0xf40FC41d326Af8D45E58C36B1c79b29106CfDBCa",
    BNB: "",
    Sonic: "0xc0631291095A22415D2F22dB4c264aE6090c0757",
    Base: "",
  };

  useEffectAsync(async () => {
    // Any initialization code can go here if needed
  }, []);

  function validateButtonText() {
    if (!selectedLiquidity || !selectedToLiquidity) {
      setButtonText("Select Token");
    } else if (!fromAmount || !toAmount) {
      setButtonText("Enter Amount");
    } else {
      setButtonText("Swap");
    }
  }
  useEffect(() => {
    if (route == "dex") {
      validateButtonText();
    }
  }, [
    fromAmount,
    selectedLiquidity,
    selectedToLiquidity,
    toAmount,
    networkData,
  ]);

  interface Graph {
    [key: string]: Pool[]; // Maps token addresses to arrays of connected pools
  }

  function buildGraph(poolList: Pool[]): Graph {
    const graph: Graph = {};

    if (poolList?.length) {
      for (const pool of poolList) {
        const { firstTokenAddress, secondTokenAddress } = pool;

        // Add the pool to the graph for both tokens
        if (!graph[firstTokenAddress]) graph[firstTokenAddress] = [];
        if (!graph[secondTokenAddress]) graph[secondTokenAddress] = [];

        graph[firstTokenAddress].push(pool);
        graph[secondTokenAddress].push(pool);
      }
    }

    return graph;
  }

  function bfs(
    graph: Graph,
    startToken: string,
    endToken: string
  ): string[] | null {
    const queue: [string, string[]][] = [[startToken, []]]; // [currentToken, path of pool addresses]
    const visited: Set<string> = new Set();

    while (queue.length > 0) {
      const [currentToken, poolPath] = queue.shift()!;

      if (currentToken === endToken) {
        return poolPath; // Return the path of pool addresses when we reach the end token
      }

      if (visited.has(currentToken)) continue;
      visited.add(currentToken);

      const connectedPools = graph[currentToken] || [];
      for (const pool of connectedPools) {
        const nextToken =
          pool.firstTokenAddress === currentToken
            ? pool.secondTokenAddress
            : pool.firstTokenAddress;

        // Add the current pool's poolAddress to the path
        const newPath = [...poolPath, pool.poolAddress];

        queue.push([nextToken, newPath]);
      }
    }

    return null; // Return null if no path is found
  }
  useEffectAsync(async () => {}, []);
  // useEffectAsync(async () => {
  //   const response: any = await getPoolLists(1, "all");
  //   setPoolList(response?.data?.pools);
  // }, []);

  useEffect(() => {
    if (selectedLiquidity && selectedToLiquidity) {
      const graph = buildGraph(poolList);

      const shortestPath: any[] | null = bfs(
        graph,
        selectedLiquidity?.address,
        selectedToLiquidity?.address
      );
      setPathRoute(shortestPath!);
    }
  }, [selectedLiquidity, selectedToLiquidity]);

  const SwapLiquidity = async () => {
    try {
      setTransactionStatus("confirming");
      setTransactionMessage("Swap transaction in progress...");

      const web3Provider = networkData?.provider as ethers.BrowserProvider;
      const signer = await web3Provider.getSigner(address!);
      let bridgeData = null;

      const tokenContract = await new ethers.Contract(
        swapContracts["Sonic"],
        SwapAbi,
        signer
      );
      const lockArgs = [
        selectedLiquidity?.address,
        BigInt(Math.floor(Number(fromAmount) * 10 ** 18)),
        BigInt(Math.floor(Number(toAmount) * 10 ** 18)),
        selectedToLiquidity?.address,
        address,
        pathroute,
      ];
      console.log("lockArgs", lockArgs);

      try {
        await approveLiquidity(
          selectedLiquidity?.address,
          fromAmount,
          pathroute[0]
        );
        try {
          await approveLiquidity(
            selectedToLiquidity?.address,
            toAmount,
            pathroute[0]
          );
        } catch (error: any) {
          setTransactionStatus("failed");
          setTransactionMessage("Failed to approve token for swap");
          return;
        }
      } catch (error: any) {
        setTransactionStatus("failed");
        setTransactionMessage("Failed to approve token for swap");
        return;
      }

      bridgeData = await tokenContract.multiHopSwap(...lockArgs, {
        gasLimit: 10000000,
      });

      // Wait for transaction to be mined
      await bridgeData.wait();

      // Update pool reserves after successful swap
      if (pathroute && pathroute.length > 0) {
        for (const poolAddress of pathroute) {
          const reserves = await getReserves(poolAddress);
          if (reserves) {
            // Update the pool reserves in the poolList
            setPoolList((prevPoolList) =>
              prevPoolList.map((pool) => {
                if (pool.poolAddress === poolAddress) {
                  return {
                    ...pool,
                    firstTokenBalance:
                      reserves.tokenA === pool.firstTokenAddress
                        ? reserves.reserveA
                        : reserves.reserveB,
                    secondTokenBalance:
                      reserves.tokenB === pool.secondTokenAddress
                        ? reserves.reserveB
                        : reserves.reserveA,
                  };
                }
                return pool;
              })
            );
          }
        }
      }

      setTransactionStatus("success");
      setTransactionMessage("Swap completed successfully!");
    } catch (err) {
      console.log(err);
      setTransactionStatus("failed");
      setTransactionMessage("Swap transaction failed");
    }
  };
  useEffect(() => {
    console.log(pathroute);
    if (selectedLiquidity && selectedToLiquidity && pathroute?.length) {
      estimateOutputForShortestPath(
        poolList,
        pathroute,
        selectedLiquidity?.address,
        fromAmount
      );
    }
  }, [fromAmount]);

  function calculateSwapOutput(
    inputAmount: number,
    inputReserve: number,
    outputReserve: number
  ): number {
    return (inputAmount * outputReserve) / (inputReserve + inputAmount);
  }

  function estimateOutputForShortestPath(
    poolList: Pool[],
    shortestPath: string[],
    startToken: string,
    fromAmount: number
  ): any {
    let currentAmount = fromAmount;
    let currentToken = startToken;

    for (const poolAddress of shortestPath) {
      const pool = poolList.find((p) => p.poolAddress === poolAddress);

      if (!pool) {
        throw new Error(`Pool with address ${poolAddress} not found.`);
      }

      let inputReserve: number;
      let outputReserve: number;
      let nextToken: string;

      if (pool.firstTokenAddress === currentToken) {
        // Swap from firstToken to secondToken
        inputReserve = parseFloat(pool.firstTokenBalance);
        outputReserve = parseFloat(pool.secondTokenBalance);
        nextToken = pool.secondTokenAddress;
      } else if (pool.secondTokenAddress === currentToken) {
        // Swap from secondToken to firstToken
        inputReserve = parseFloat(pool.secondTokenBalance);
        outputReserve = parseFloat(pool.firstTokenBalance);
        nextToken = pool.firstTokenAddress;
      } else {
        throw new Error(
          `Current token ${currentToken} not found in pool ${poolAddress}.`
        );
      }

      // Calculate the output for this pool swap
      currentAmount = calculateSwapOutput(
        currentAmount,
        inputReserve,
        outputReserve
      );
      currentToken = nextToken;
    }

    setToAmount(currentAmount.toFixed(4));
  }

  // Function to get pool reserves
  const getReserves = async (poolAddress: string) => {
    try {
      if (!networkData?.provider) return null;

      const web3Provider = networkData?.provider as ethers.BrowserProvider;
      const signer = await web3Provider.getSigner(address!);

      const poolContract = new ethers.Contract(
        poolAddress,
        deployContractAbi,
        signer
      );
      const reserves = await poolContract.getReserves();
      console.log("reserves", ethers.formatUnits(reserves._reserveA, 18));
      setPoolList((prevPoolList) =>
        prevPoolList.map((pool) =>
          pool.address === poolAddress
            ? {
                ...pool,
                firstTokenBalance: ethers.formatUnits(reserves._reserveA, 18),
                secondTokenBalance: ethers.formatUnits(reserves._reserveB, 18),
              }
            : pool
        )
      );
      console.log(
        "poolList",
        ethers.formatUnits(reserves._reserveA, 18),
        ethers.formatUnits(reserves._reserveB, 18)
      );

      return {
        tokenA: reserves._tokenA,
        tokenB: reserves._tokenB,
        reserveA: ethers.formatUnits(reserves._reserveA, 18),
        reserveB: ethers.formatUnits(reserves._reserveB, 18),
      };
    } catch (error) {
      console.error("Error getting reserves:", error);
      return null;
    }
  };

  // Function to calculate output amount based on input amount and reserves
  const calculateOutputAmount = async (
    inputAmount: string,
    inputToken: string,
    poolAddress: string
  ) => {
    try {
      if (!inputAmount || !inputToken || !poolAddress) return null;

      const reserves = await getReserves(poolAddress);
      if (!reserves) return null;

      const inputAmountBN = ethers.parseUnits(inputAmount, 18);

      // Determine which reserve is input and which is output
      let inputReserve, outputReserve;
      if (inputToken.toLowerCase() === reserves.tokenA.toLowerCase()) {
        inputReserve = ethers.parseUnits(reserves.reserveA, 18);
        outputReserve = ethers.parseUnits(reserves.reserveB, 18);
      } else if (inputToken.toLowerCase() === reserves.tokenB.toLowerCase()) {
        inputReserve = ethers.parseUnits(reserves.reserveB, 18);
        outputReserve = ethers.parseUnits(reserves.reserveA, 18);
      } else {
        return null; // Input token not in this pool
      }

      // Calculate output amount using the constant product formula: x * y = k
      // (inputReserve + inputAmount) * (outputReserve - outputAmount) = inputReserve * outputReserve
      // Solving for outputAmount:
      // outputAmount = outputReserve - (inputReserve * outputReserve) / (inputReserve + inputAmount)

      const numerator = inputReserve * outputReserve;
      const denominator = inputReserve + inputAmountBN;
      const outputAmount = outputReserve - numerator / denominator;

      // Apply a 0.3% fee
      const outputWithFee = (outputAmount * BigInt(997)) / BigInt(1000);

      return ethers.formatUnits(outputWithFee, 18);
    } catch (error) {
      console.error("Error calculating output amount:", error);
      return null;
    }
  };

  return (
    <LoginContext.Provider
      value={{
        setSelectedToNetwork,
        SwapLiquidity,
        selectedToNetwork,
        getReserves,
        calculateOutputAmount,
        transactionStatus,
        transactionMessage,
      }}
    >
      {children}
    </LoginContext.Provider>
  );
}
