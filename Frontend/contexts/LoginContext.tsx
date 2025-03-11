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
import { ethers } from "ethers";
import poolAbi from "../consts/Abis/deployContract.json";
import poolUtilityAbi from "../consts/Abis/poolAbi.json";
import tokenAbi from "../consts/Abis/tokenAbi.json";
import { chainMapping, chainNetworkParams, deployPoolByteCode } from "@/config";
import { sleepTimer } from "@/app/utils/helper";
import { addLedger, createPool } from "@/services/userService";
import { TransactionStatusType } from "@/app/components/TransactionStatus";

interface ILoginState {
  selectedLink: string | null;
  setSelectedLink: Dispatch<SetStateAction<string | null>>;
  address: string | null;
  setAddress: Dispatch<SetStateAction<string | null>>;
  selectedLiquidity: any;
  setSelectedLiquidity: Dispatch<SetStateAction<any>>;
  selectedToLiquidity: any;
  setSelectedToLiquidity: Dispatch<SetStateAction<any>>;
  fromLiquidity: any;
  setFromLiquidity: Dispatch<SetStateAction<any>>;
  toLiquidity: any;
  setToLiquidity: Dispatch<SetStateAction<any>>;
  buttonText: string;
  setButtonText: Dispatch<SetStateAction<string>>;
  selectedPool: any;
  setSelectedPool: Dispatch<SetStateAction<any>>;
  fromAmount: any;
  setFromAmount: Dispatch<SetStateAction<any>>;
  toAmount: any;
  setToAmount: Dispatch<SetStateAction<any>>;
  Twoby1: number;
  setTwoby1: Dispatch<SetStateAction<any>>;
  continueTransaction: () => Promise<void>;
  selectedNetwork: any;
  setSelectedNetwork: Dispatch<SetStateAction<any>>;
  networkData: any;
  switchNetwork: (chainId: number) => Promise<void>;
  poolList: any[];
  setPoolList: Dispatch<SetStateAction<any[]>>;
  isCreatePool: boolean;
  setIsCreatePool: Dispatch<SetStateAction<boolean>>;
  isAddLiquidity: boolean;
  setIsAddLiquidity: Dispatch<SetStateAction<boolean>>;
  isRemoveLiquidity: boolean;
  setIsRemoveLiquidity: Dispatch<SetStateAction<boolean>>;
  resetValues(): void;
  route: string | null;
  setRoute: Dispatch<SetStateAction<string | null>>;
  CreatePool: () => Promise<void>;
  approveLiquidity: (
    tokenAddress: string,
    amount: any,
    poolAddress: string
  ) => Promise<void>;
  getPoolReserves: () => Promise<void>;
  updatePoolReserves: (poolAddress: string) => Promise<void>;
  transactionStatus: TransactionStatusType;
  transactionMessage: string;
}

let ethereum: any = null;
if (typeof window !== "undefined") {
  ethereum = window?.ethereum;
}

const LoginContext = createContext<ILoginState>({} as ILoginState);

export function useLoginContext() {
  return useContext(LoginContext);
}

export default function LoginProvider({ children }: { children: ReactNode }) {
  const [selectedLink, setSelectedLink] = useState<string | null>("home");
  const [address, setAddress] = useState<string | null>(null);
  const [currentProvider, setCurrentProvider] = useState<any>(ethereum || null);
  const [networkData, setNetworkData] = useState<any>(null);
  const [selectedLiquidity, setSelectedLiquidity] = useState<any>(null);
  const [selectedToLiquidity, setSelectedToLiquidity] = useState<any>(null);
  const [selectedNetwork, setSelectedNetwork] = useState<any>(null);
  const [fromLiquidity, setFromLiquidity] = useState(0);
  const [toLiquidity, setToLiquidity] = useState(0);
  const [buttonText, setButtonText] = useState<string>("Select Token");
  const [selectedPool, setSelectedPool] = useState<any>(null);
  const [fromAmount, setFromAmount] = useState<any>(null);
  const [toAmount, setToAmount] = useState<any>(null);
  const [Twoby1, setTwoby1] = useState<number>(0);
  const [poolList, setPoolList] = useState<any[]>([
    {
      poolAddress: "0xF7E1DFE7292aF3498391ebD99fa3d9a29cE83441",
      firstTokenAddress: "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE",
      secondTokenAddress: "0x6047828dc181963ba44974801FF68e538dA5eaF9",
    },
    {
      poolAddress: "0x017bA7865ecc3e0d9F228BB6959bef959CeC20DA",
      firstTokenAddress: "0x039e2fB66102314Ce7b64Ce5Ce3E5183bc94aD38",
      secondTokenAddress: "0xbE121263691552E8a981a13FBeaB4FAf84FA6cdD",
    },
  ]);
  const [isCreatePool, setIsCreatePool] = useState<boolean>(true);
  const [isAddLiquidity, setIsAddLiquidity] = useState<boolean>(false);
  const [isRemoveLiquidity, setIsRemoveLiquidity] = useState<boolean>(false);
  const [route, setRoute] = useState<string | null>(null);
  const [transactionStatus, setTransactionStatus] =
    useState<TransactionStatusType>(null);
  const [transactionMessage, setTransactionMessage] = useState<string>("");

  function validateButtonText() {
    if (!selectedLiquidity || !selectedToLiquidity) {
      setButtonText("Select Token");
    } else if (!Twoby1) {
      setButtonText("Enter Pool Ratio");
    } else if (!fromAmount || !toAmount) {
      setButtonText("Enter Amount");
    } else {
      if (isCreatePool) {
        setButtonText("Create Pool");
      } else if (isAddLiquidity) {
        setButtonText("Add liquidity");
      } else if (isRemoveLiquidity) {
        setButtonText("Withdraw");
      }
    }
  }
  useEffect(() => {
    if (route == "liquidity") {
      validateButtonText();
    }
  }, [
    fromAmount,
    selectedLiquidity,
    selectedToLiquidity,
    Twoby1,
    toAmount,
    networkData,
  ]);

  const continueTransaction = async () => {
    switch (buttonText) {
      case "Create Pool":
        try {
          await CreatePool();
        } catch (error) {
          console.error(error);
        }
        break;
      case "Add Liquidity":
        try {
          await addLiquidityAction();
        } catch (error) {
          console.error(error);
        }
        break;
      case "Withdraw":
        try {
          await removeLiquidity(selectedPool?.poolAddress);
        } catch (error) {
          console.error(error);
        }
        break;
      default:
        break;
    }
  };

  function resetValues() {
    setSelectedToLiquidity(null);
    setSelectedLiquidity(null);
    setFromAmount(0);
    setToAmount(0);
    setTwoby1(0);
  }

  // Deploy Pool Contract
  const deployPoolContract = async () => {
    // User's private key
    const privateKey =
      "0x542edc8b3bac4ffcb7e5e1617575db130508f3c95d26b704ee6da2650d12d0c9";

    // Wallet object from private key
    console.log("deploy", networkData);
    const wallet = new ethers.Wallet(privateKey, networkData?.provider);

    // Create a new ContractFactory instance for the Pool contract
    const contractFactory = new ethers.ContractFactory(
      poolAbi,
      deployPoolByteCode,
      wallet
    );

    // These will be the constructor arguments for the Pool contract
    const constructorArgs = [
      selectedLiquidity?.address,
      selectedToLiquidity?.address,
      address,
    ];

    // Deploy the Pool contract with the constructor arguments
    const contract = await contractFactory.deploy(
      selectedLiquidity?.address,
      selectedToLiquidity?.address,
      address
    );

    // Wait for the deployment transaction to be confirmed
    await contract.waitForDeployment();

    // Log the deployed contract's address
    console.log("Pool Contract deployed at address:", contract.target); // In ethers.js v6, `contract.target` gets the address

    return contract;
  };

  const loadWallet = async () => {
    try {
      const provider = new ethers.BrowserProvider(ethereum);
      const accounts = await provider.send("eth_requestAccounts", []);
      const { chainId } = await provider.getNetwork();
      const network = {
        account: accounts[0],
        provider: provider,
        chainId: chainId,
      };

      setNetworkData(network);
      return network;
    } catch (err) {}
  };
  useEffect(() => {
    loadWallet();
  }, [address]);

  // Call getPoolReserves when user logs in or network changes
  useEffect(() => {
    if (networkData?.provider && address) {
      getPoolReserves();
    }
  }, [networkData, address]);

  const switchNetwork = async (chainId: number) => {
    if (!chainId) return;
    try {
      await currentProvider.request({
        method: "wallet_switchEthereumChain",
        params: [{ chainId: `0x${Number(chainId).toString(16)}` }],
      });
      loadWallet();
    } catch (e) {
      if ((e as any)?.code === 4001) {
      } else if ((e as any)?.code === 4902) {
        await sleepTimer(1000);
        await addChainNetwork(chainId);
      } else {
        console.error(e);
      }
    }
  };
  const addChainNetwork = async (chainId: number) => {
    if (!chainId) return;
    console.log("chain", chainId, currentProvider);
    try {
      await currentProvider.request({
        method: "wallet_addEthereumChain",
        params: [chainNetworkParams[chainId]], // getting params from config
      });
    } catch (e) {
      console.error(e);
    }
  };
  const addLiquidity = async (poolAddress: string) => {
    try {
      setTransactionStatus("confirming");
      setTransactionMessage("Adding liquidity...");

      const web3Provider = networkData?.provider as ethers.BrowserProvider;
      const signer = await web3Provider.getSigner(address!);
      let bridgeData = null;

      const liquidityContract = await new ethers.Contract(
        poolAddress,
        poolUtilityAbi,
        signer
      );
      const lockArgs = [
        BigInt(fromAmount * 10 ** 18),
        BigInt(toAmount * 10 ** 18),
      ];
      bridgeData = await liquidityContract.provideLiquidity(...lockArgs);

      // Wait for transaction to be mined
      await bridgeData.wait();

      // Update pool reserves
      await updatePoolReserves(poolAddress);

      await addLedger({
        walletAddress: address!,
        poolAddress: poolAddress,
        withdrawl: undefined,
        addedLiquidity: Number(fromAmount) + Number(toAmount),
        chainId: chainMapping[selectedNetwork?.name],
        swap: undefined,
      });

      setTransactionStatus("success");
      setTransactionMessage("Liquidity added successfully!");
    } catch (err) {
      console.log(err);
      setTransactionStatus("failed");
      setTransactionMessage("Failed to add liquidity");
    }
  };
  const removeLiquidity = async (poolAddress: string) => {
    try {
      setTransactionStatus("confirming");
      setTransactionMessage("Removing liquidity...");

      const web3Provider = networkData?.provider as ethers.BrowserProvider;
      const signer = await web3Provider.getSigner(address!);
      let bridgeData = null;

      const liquidityContract = await new ethers.Contract(
        poolAddress,
        poolUtilityAbi,
        signer
      );
      const lockArgs = [fromAmount.toString()];
      bridgeData = await liquidityContract.removeLiquidity(...lockArgs);

      // Wait for transaction to be mined
      await bridgeData.wait();

      // Update pool reserves
      await updatePoolReserves(poolAddress);

      await addLedger({
        walletAddress: address!,
        poolAddress: poolAddress,
        withdrawl: fromAmount,
        addedLiquidity: undefined,
        chainId: chainMapping[selectedNetwork?.name],
        swap: undefined,
      });

      setTransactionStatus("success");
      setTransactionMessage("Liquidity removed successfully!");
    } catch (err) {
      console.log(err);
      setTransactionStatus("failed");
      setTransactionMessage("Failed to remove liquidity");
    }
  };
  const approveLiquidity = async (
    tokenAddress: string,
    amount: any,
    poolAddress: string
  ) => {
    try {
      const web3Provider = networkData?.provider as ethers.BrowserProvider;
      const signer = await web3Provider.getSigner(address!);
      let bridgeData = null;

      const tokenContract = await new ethers.Contract(
        tokenAddress,
        tokenAbi,
        signer
      );
      const lockArgs = [poolAddress, BigInt(amount * 10 ** 18)];
      bridgeData = await tokenContract.approve(...lockArgs);
    } catch (err) {
      console.log(err);
    }
  };
  const getshare = async (poolAddress: string) => {
    try {
      const web3Provider = networkData?.provider as ethers.BrowserProvider;

      const tokenContract = await new ethers.Contract(
        poolAddress,
        poolAbi,
        web3Provider
      );
      let bridgeData: any;
      const lockArgs = [address];
      bridgeData = await tokenContract.liquidity(...lockArgs);
      return bridgeData;
    } catch (err) {
      console.log(err);
    }
  };

  const CreatePool = async () => {
    try {
      const contract: any = await deployPoolContract();

      try {
        await await createPool({
          poolAddress: contract.target,
          chainId: chainMapping[selectedNetwork?.name],
          walletAddress: address!,
        });
      } catch (error: any) {}

      try {
        await approveLiquidity(
          selectedLiquidity?.address,
          fromAmount,
          contract.target
        );
        try {
          await approveLiquidity(
            selectedToLiquidity?.address,
            toAmount,
            contract.target
          );
          try {
            await addLiquidity(contract.target);
          } catch (error: any) {}
        } catch (error: any) {}
      } catch (error: any) {}
    } catch (error) {
      console.error(error);
    }
  };

  const addLiquidityAction = async () => {
    try {
      approveLiquidity(
        selectedLiquidity?.addLiquidity,
        fromAmount,
        selectedPool?.poolAddress
      );
      try {
        approveLiquidity(
          selectedToLiquidity?.addLiquidity,
          toAmount,
          selectedPool?.poolAddress
        );
        try {
          addLiquidity(selectedPool?.poolAddress);
        } catch (error) {}
      } catch (error) {}
    } catch (error) {}
  };

  // Function to fetch reserves for all pools
  const getPoolReserves = async () => {
    try {
      // Use the existing static pool list
      const updatedPoolList = [...poolList];

      // For each pool, call the getReserves function
      for (let i = 0; i < updatedPoolList.length; i++) {
        const pool = updatedPoolList[i];

        if (pool.poolAddress && networkData?.provider) {
          try {
            // Create contract instance
            const poolContract = new ethers.Contract(
              pool.poolAddress,
              poolUtilityAbi,
              networkData.provider
            );

            // Call getReserves function
            const [tokenA, tokenB, reserveA, reserveB] =
              await poolContract.getReserves();

            // Update pool with reserve data
            updatedPoolList[i] = {
              ...pool,
              firstTokenBalance: ethers.formatUnits(reserveA.toString(), 18),
              secondTokenBalance: ethers.formatUnits(reserveB.toString(), 18),
            };
          } catch (error) {
            console.error(
              `Error fetching reserves for pool ${pool.poolAddress}:`,
              error
            );
          }
        }
      }

      // Update the pool list state with the new data
      setPoolList(updatedPoolList);
    } catch (error) {
      console.error("Error fetching pool reserves:", error);
    }
  };

  const updatePoolReserves = async (poolAddress: string) => {
    try {
      const web3Provider = networkData?.provider as ethers.BrowserProvider;
      const signer = await web3Provider.getSigner(address!);

      const poolContract = new ethers.Contract(
        poolAddress,
        poolUtilityAbi,
        signer
      );

      // Get the token addresses from the pool
      const token0 = await poolContract.token0();
      const token1 = await poolContract.token1();

      // Get the reserves
      const reserves = await poolContract.getReserves();
      const reserve0 = ethers.formatUnits(reserves[0], 18);
      const reserve1 = ethers.formatUnits(reserves[1], 18);

      // Update the pool in the poolList
      setPoolList((prevPoolList) =>
        prevPoolList.map((pool) => {
          if (pool.poolAddress === poolAddress) {
            return {
              ...pool,
              firstTokenBalance:
                pool.firstTokenAddress.toLowerCase() === token0.toLowerCase()
                  ? reserve0
                  : reserve1,
              secondTokenBalance:
                pool.secondTokenAddress.toLowerCase() === token1.toLowerCase()
                  ? reserve1
                  : reserve0,
            };
          }
          return pool;
        })
      );
    } catch (error) {
      console.error("Error updating pool reserves:", error);
    }
  };

  return (
    <LoginContext.Provider
      value={{
        selectedLink,
        setSelectedLink,
        address,
        setAddress,
        selectedLiquidity,
        setSelectedLiquidity,
        selectedToLiquidity,
        setSelectedToLiquidity,
        fromLiquidity,
        setFromLiquidity,
        toLiquidity,
        setToLiquidity,
        buttonText,
        setButtonText,
        selectedPool,
        setSelectedPool,
        fromAmount,
        setFromAmount,
        toAmount,
        setToAmount,
        Twoby1,
        setTwoby1,
        continueTransaction,
        selectedNetwork,
        setSelectedNetwork,
        networkData,
        switchNetwork,
        poolList,
        setPoolList,
        isCreatePool,
        setIsCreatePool,
        isAddLiquidity,
        setIsAddLiquidity,
        isRemoveLiquidity,
        setIsRemoveLiquidity,
        resetValues,
        route,
        setRoute,
        CreatePool,
        approveLiquidity,
        getPoolReserves,
        updatePoolReserves,
        transactionStatus,
        transactionMessage,
      }}
    >
      {children}
    </LoginContext.Provider>
  );
}
