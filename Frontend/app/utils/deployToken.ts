import { ethers } from "ethers";

// Replace with your own provider (e.g., Infura, Alchemy, or local node)
// const provider = new ethers.JsonRpcProvider("https://opt-sepolia.g.alchemy.com/v2/XE-fniPpIqe120z7FJ1mYLMQodkasCzy");

// User's private key
// const privateKey = "0x60bbef07496435c3d8f4ac33549307ee29343b856a506628ecf5b96ccd1ba78c";

// Wallet object from private key
// const wallet = new ethers.Wallet(privateKey, provider);

// Token contract's ABI and bytecode
export const tokenAbi = [
  {
    inputs: [
      {
        internalType: "string",
        name: "name_",
        type: "string",
      },
      {
        internalType: "string",
        name: "symbol_",
        type: "string",
      },
      {
        internalType: "uint256",
        name: "initialSupply",
        type: "uint256",
      },
      {
        internalType: "address",
        name: "minterAddress",
        type: "address",
      },
      {
        internalType: "bool",
        name: "ismainChain",
        type: "bool",
      },
    ],
    stateMutability: "nonpayable",
    type: "constructor",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "spender",
        type: "address",
      },
      {
        internalType: "uint256",
        name: "allowance",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "needed",
        type: "uint256",
      },
    ],
    name: "ERC20InsufficientAllowance",
    type: "error",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "sender",
        type: "address",
      },
      {
        internalType: "uint256",
        name: "balance",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "needed",
        type: "uint256",
      },
    ],
    name: "ERC20InsufficientBalance",
    type: "error",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "approver",
        type: "address",
      },
    ],
    name: "ERC20InvalidApprover",
    type: "error",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "receiver",
        type: "address",
      },
    ],
    name: "ERC20InvalidReceiver",
    type: "error",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "sender",
        type: "address",
      },
    ],
    name: "ERC20InvalidSender",
    type: "error",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "spender",
        type: "address",
      },
    ],
    name: "ERC20InvalidSpender",
    type: "error",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "address",
        name: "owner",
        type: "address",
      },
      {
        indexed: true,
        internalType: "address",
        name: "spender",
        type: "address",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "value",
        type: "uint256",
      },
    ],
    name: "Approval",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "address",
        name: "from",
        type: "address",
      },
      {
        indexed: true,
        internalType: "address",
        name: "to",
        type: "address",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "value",
        type: "uint256",
      },
    ],
    name: "Transfer",
    type: "event",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "owner",
        type: "address",
      },
      {
        internalType: "address",
        name: "spender",
        type: "address",
      },
    ],
    name: "allowance",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "spender",
        type: "address",
      },
      {
        internalType: "uint256",
        name: "value",
        type: "uint256",
      },
    ],
    name: "approve",
    outputs: [
      {
        internalType: "bool",
        name: "",
        type: "bool",
      },
    ],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "account",
        type: "address",
      },
    ],
    name: "balanceOf",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "decimals",
    outputs: [
      {
        internalType: "uint8",
        name: "",
        type: "uint8",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "account",
        type: "address",
      },
      {
        internalType: "uint256",
        name: "value",
        type: "uint256",
      },
    ],
    name: "mint",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [],
    name: "name",
    outputs: [
      {
        internalType: "string",
        name: "",
        type: "string",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "symbol",
    outputs: [
      {
        internalType: "string",
        name: "",
        type: "string",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "totalSupply",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "to",
        type: "address",
      },
      {
        internalType: "uint256",
        name: "value",
        type: "uint256",
      },
    ],
    name: "transfer",
    outputs: [
      {
        internalType: "bool",
        name: "",
        type: "bool",
      },
    ],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "from",
        type: "address",
      },
      {
        internalType: "address",
        name: "to",
        type: "address",
      },
      {
        internalType: "uint256",
        name: "value",
        type: "uint256",
      },
    ],
    name: "transferFrom",
    outputs: [
      {
        internalType: "bool",
        name: "",
        type: "bool",
      },
    ],
    stateMutability: "nonpayable",
    type: "function",
  },
]; // Replace with your contract's ABI
export const tokenBytecode =
  "608060405234801561001057600080fd5b50604051610c4c380380610c4c83398101604081905261002f9161029c565b8484600361003d83826103d3565b50600461004a82826103d3565b50505080151560010361006657610061828461007a565b610070565b610070308461007a565b50505050506104b8565b6001600160a01b0382166100a95760405163ec442f0560e01b8152600060048201526024015b60405180910390fd5b6100b5600083836100b9565b5050565b6001600160a01b0383166100e45780600260008282546100d99190610491565b909155506101569050565b6001600160a01b038316600090815260208190526040902054818110156101375760405163391434e360e21b81526001600160a01b038516600482015260248101829052604481018390526064016100a0565b6001600160a01b03841660009081526020819052604090209082900390555b6001600160a01b03821661017257600280548290039055610191565b6001600160a01b03821660009081526020819052604090208054820190555b816001600160a01b0316836001600160a01b03167fddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef836040516101d691815260200190565b60405180910390a3505050565b634e487b7160e01b600052604160045260246000fd5b600082601f83011261020a57600080fd5b81516001600160401b03811115610223576102236101e3565b604051601f8201601f19908116603f011681016001600160401b0381118282101715610251576102516101e3565b60405281815283820160200185101561026957600080fd5b60005b828110156102885760208186018101518383018201520161026c565b506000918101602001919091529392505050565b600080600080600060a086880312156102b457600080fd5b85516001600160401b038111156102ca57600080fd5b6102d6888289016101f9565b602088015190965090506001600160401b038111156102f457600080fd5b610300888289016101f9565b60408801516060890151919650945090506001600160a01b038116811461032657600080fd5b6080870151909250801515811461033c57600080fd5b809150509295509295909350565b600181811c9082168061035e57607f821691505b60208210810361037e57634e487b7160e01b600052602260045260246000fd5b50919050565b601f8211156103ce57806000526020600020601f840160051c810160208510156103ab5750805b601f840160051c820191505b818110156103cb57600081556001016103b7565b50505b505050565b81516001600160401b038111156103ec576103ec6101e3565b610400816103fa845461034a565b84610384565b6020601f821160018114610434576000831561041c5750848201515b600019600385901b1c1916600184901b1784556103cb565b600084815260208120601f198516915b828110156104645787850151825560209485019460019092019101610444565b50848210156104825786840151600019600387901b60f8161c191681555b50505050600190811b01905550565b808201808211156104b257634e487b7160e01b600052601160045260246000fd5b92915050565b610785806104c76000396000f3fe608060405234801561001057600080fd5b506004361061009e5760003560e01c806340c10f191161006657806340c10f191461011857806370a082311461012d57806395d89b4114610156578063a9059cbb1461015e578063dd62ed3e1461017157600080fd5b806306fdde03146100a3578063095ea7b3146100c157806318160ddd146100e457806323b872dd146100f6578063313ce56714610109575b600080fd5b6100ab6101aa565b6040516100b891906105ce565b60405180910390f35b6100d46100cf366004610638565b61023c565b60405190151581526020016100b8565b6002545b6040519081526020016100b8565b6100d4610104366004610662565b610256565b604051601281526020016100b8565b61012b610126366004610638565b61027a565b005b6100e861013b36600461069f565b6001600160a01b031660009081526020819052604090205490565b6100ab610288565b6100d461016c366004610638565b610297565b6100e861017f3660046106c1565b6001600160a01b03918216600090815260016020908152604080832093909416825291909152205490565b6060600380546101b9906106f4565b80601f01602080910402602001604051908101604052809291908181526020018280546101e5906106f4565b80156102325780601f1061020757610100808354040283529160200191610232565b820191906000526020600020905b81548152906001019060200180831161021557829003601f168201915b5050505050905090565b60003361024a8185856102a5565b60019150505b92915050565b6000336102648582856102b7565b61026f85858561033a565b506001949350505050565b6102848282610399565b5050565b6060600480546101b9906106f4565b60003361024a81858561033a565b6102b283838360016103cf565b505050565b6001600160a01b038381166000908152600160209081526040808320938616835292905220546000198114610334578181101561032557604051637dc7a0d960e11b81526001600160a01b038416600482015260248101829052604481018390526064015b60405180910390fd5b610334848484840360006103cf565b50505050565b6001600160a01b03831661036457604051634b637e8f60e11b81526000600482015260240161031c565b6001600160a01b03821661038e5760405163ec442f0560e01b81526000600482015260240161031c565b6102b28383836104a4565b6001600160a01b0382166103c35760405163ec442f0560e01b81526000600482015260240161031c565b610284600083836104a4565b6001600160a01b0384166103f95760405163e602df0560e01b81526000600482015260240161031c565b6001600160a01b03831661042357604051634a1406b160e11b81526000600482015260240161031c565b6001600160a01b038085166000908152600160209081526040808320938716835292905220829055801561033457826001600160a01b0316846001600160a01b03167f8c5be1e5ebec7d5bd14f71427d1e84f3dd0314c0f7b2291e5b200ac8c7c3b9258460405161049691815260200190565b60405180910390a350505050565b6001600160a01b0383166104cf5780600260008282546104c4919061072e565b909155506105419050565b6001600160a01b038316600090815260208190526040902054818110156105225760405163391434e360e21b81526001600160a01b0385166004820152602481018290526044810183905260640161031c565b6001600160a01b03841660009081526020819052604090209082900390555b6001600160a01b03821661055d5760028054829003905561057c565b6001600160a01b03821660009081526020819052604090208054820190555b816001600160a01b0316836001600160a01b03167fddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef836040516105c191815260200190565b60405180910390a3505050565b602081526000825180602084015260005b818110156105fc57602081860181015160408684010152016105df565b506000604082850101526040601f19601f83011684010191505092915050565b80356001600160a01b038116811461063357600080fd5b919050565b6000806040838503121561064b57600080fd5b6106548361061c565b946020939093013593505050565b60008060006060848603121561067757600080fd5b6106808461061c565b925061068e6020850161061c565b929592945050506040919091013590565b6000602082840312156106b157600080fd5b6106ba8261061c565b9392505050565b600080604083850312156106d457600080fd5b6106dd8361061c565b91506106eb6020840161061c565b90509250929050565b600181811c9082168061070857607f821691505b60208210810361072857634e487b7160e01b600052602260045260246000fd5b50919050565b8082018082111561025057634e487b7160e01b600052601160045260246000fdfea2646970667358221220633cc1eb51a590fe249210ebf8d400bbb55831eb225f72747b257065fd14d1ea64736f6c634300081a0033"; // Replace with your contract's bytecode

// Deploy Token Contract
export const deployTokenContract = async (
  name: any,
  symbol: any,
  initialSupply: any,
  walletAddress: any,
  isMainChain: any,
  provider: any
) => {
  const contractFactory = new ethers.ContractFactory(
    tokenAbi,
    tokenBytecode,
    walletAddress
  );

  // Constructor arguments for deploying the token contract
  // const name = "MyOmniToken";               // Token name
  // const symbol = "MOT";                     // Token symbol
  const initialSupplyWithDecimels = ethers.parseUnits("1000000", 18); // 1 million tokens with 18 decimals
  const initialMinterAddress = walletAddress; // Deployer's address
  // const isMainChain = true;                 // Boolean for main chain
  const constructorArgs = [
    name,
    symbol,
    initialSupplyWithDecimels,
    initialMinterAddress,
    isMainChain,
  ];

  // Deploy the contract by passing the constructor arguments
  const contract = await contractFactory.deploy(
    name,
    symbol,
    initialSupply,
    initialMinterAddress,
    isMainChain
  );

  // Wait for the contract deployment transaction to be confirmed
  await contract.waitForDeployment();

  console.log("Token deployed at address:", contract.target); // In ethers.js v6, `contract.target` gets the address
  return contract;
};

// Execute Token Transfer
const executeTransfer = async (
  tokenAddress: any,
  recipient: any,
  amount: any,
  walletAddress: any
) => {
  const tokenContract = new ethers.Contract(
    tokenAddress,
    tokenAbi,
    walletAddress
  );

  // Call the transfer function
  const tx = await tokenContract.transfer(
    recipient,
    ethers.parseUnits(amount.toString(), 18)
  );
  await tx.wait(); // Wait for transaction confirmation

  console.log(`Transferred ${amount} tokens to ${recipient}`);
};

// Execute Token Transfer
const crossexecuteTransfer = async (
  tokenAddress: any,
  recipient: any,
  amount: any,
  walletAddress: any
) => {
  const tokenContract = new ethers.Contract(
    tokenAddress,
    tokenAbi,
    walletAddress
  );
  const fee = "0.001"; // Fee as a string to prevent parsing issues
  const destChain = 17000; // Destination chain ID

  // Parse the amount and fee
  const parsedAmount = ethers.parseUnits(amount.toString(), 18); // Ensure the amount is a BigNumber
  // const parsedFee = ethers.parseEther(fee);  // Parse the fee as a BigNumber
  // const estimateTx = await tokenContract.transfer.estimateGas();
  // Call the transfer function with correct types
  const tx = await tokenContract.transfer(
    destChain,
    tokenAddress,
    recipient,
    parsedAmount,
    {
      value: fee, // Ensure fee is a BigNumber and passed correctly as msg.value
    }
  );

  // Wait for transaction confirmation
  await tx.wait();
  // Wait for transaction confirmation

  console.log(`Transferred ${amount} tokens to ${recipient}`);
};

// Main Flow
// (async () => {
//     try {
//         // Deploy the contract
//         const contract = await deployTokenContract();

//         // Use the deployed contract address for the transfer
//         const tokenAddress = contract.target;
//         const recipientAddress = "0x90A94Bf3Ca7d6824C6c9dE3B6baf52e30abfD4E2";
//         const transferAmount = 100;  // Amount of tokens to transfer

//         // Execute the token transfer
//         await crossexecuteTransfer(tokenAddress, recipientAddress, transferAmount);
//     } catch (error) {
//         console.error(error);
//     }
// })();
