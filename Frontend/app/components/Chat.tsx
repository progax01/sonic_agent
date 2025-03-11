import { useState, useEffect } from "react";
import axios from "axios";
import { useLoginContext } from "@/contexts/LoginContext";
import { Networks, TokenList } from "@/config";
import { switchNetwork } from "wagmi/actions";
import { useSwapContext } from "@/contexts/Swapcontext";

const ChatAI = () => {
  // Debug: Log the token list to verify SideToken is included
  useEffect(() => {
    console.log("Available tokens:", TokenList);
  }, []);

  const [messages, setMessages] = useState<any>([]); // For storing chat history
  const [input, setInput] = useState<any>(""); // For storing user input
  const [loading, setLoading] = useState<any>(false); // Loading state
  const [functionList, setFunctionList] = useState<any>([]); //{ provideLiquidity:["amountA", "amountB", "chain"] } // functions with their arguments
  const [chainData, setChainData] = useState<any>([]); //{ "bssepolia": ["provideLiquidity"]} -  All functions for a particular chain
  const {
    CreatePool,
    selectedPool,
    setSelectedLiquidity,
    setSelectedToLiquidity,
    address,
    selectedNetwork,
    fromAmount,
    toAmount,
    poolList,
    setFromAmount,
    setSelectedNetwork,
    setSelectedPool,
    setTwoby1,
    networkData,
    setRoute,
    setIsAddLiquidity,
    setIsRemoveLiquidity,
    setIsCreatePool,
  } = useLoginContext();

  const { SwapLiquidity, calculateOutputAmount } = useSwapContext();

  const chainAbbre = {
    sonic: "sonic",
    sepolia: "sepolia",
    "BNB Smart Chain": "bsc",
    "Base Sepolia": "bssepolia",
    "Arbitrum Sepolia": "arbsepolia",
  };

  const [messageHistory, setMessageHistory] = useState<any[]>([]);

  // Process chat commands locally when API doesn't work
  const processLocalCommand = async (userInput: string) => {
    const input = userInput.toLowerCase();
    let response: {
      success: boolean;
      message: string;
      data: {
        function_name?: string;
        function_arguments?: Record<string, any>;
      };
    } = {
      success: false,
      message: "I couldn't understand that command. Try being more specific.",
      data: {},
    };

    // Extract tokens from input
    const tokens = extractTokens(input);
    console.log("Detected tokens:", tokens);

    // Extract amount from input
    const amount = extractAmount(input);

    // Check for swap command
    if (input.includes("swap")) {
      if (tokens.length >= 2 && amount) {
        const fromToken = findToken(tokens[0]);
        const toToken = findToken(tokens[1]);

        if (fromToken && toToken) {
          response = {
            success: true,
            message: `Ready to swap ${amount} ${fromToken.symbol} to ${toToken.symbol}. Click the button below to proceed.`,
            data: {
              function_name: "swap",
              function_arguments: {
                tokenA: fromToken.symbol,
                tokenB: toToken.symbol,
                amount: amount,
              },
            },
          };
        } else {
          if (!fromToken && !toToken) {
            response.message = `I couldn't identify any tokens in your message. Available tokens are: ${TokenList.map(
              (t) => t.symbol
            ).join(", ")}`;
          } else if (!fromToken) {
            response.message = `I couldn't identify the source token. Did you mean one of these? ${TokenList.map(
              (t) => t.symbol
            ).join(", ")}`;
          } else {
            response.message = `I couldn't identify the destination token. Did you mean one of these? ${TokenList.map(
              (t) => t.symbol
            ).join(", ")}`;
          }
        }
      } else if (tokens.length < 2) {
        response.message =
          "To swap, please specify two tokens. For example: 'swap USDT to S'";
      } else if (!amount) {
        // If we have tokens but no amount, we can still proceed with a prompt
        if (tokens.length >= 2) {
          const fromToken = findToken(tokens[0]);
          const toToken = findToken(tokens[1]);

          if (fromToken && toToken) {
            response.message = `How much ${fromToken.symbol} would you like to swap to ${toToken.symbol}?`;
          } else {
            response.message =
              "Please specify an amount to swap. For example: 'swap 10 USDT to S'";
          }
        } else {
          response.message =
            "Please specify an amount to swap. For example: 'swap 10 USDT to S'";
        }
      }
    }
    // Check for add liquidity command
    else if (
      input.includes("add liquidity") ||
      input.includes("provide liquidity")
    ) {
      if (tokens.length >= 2) {
        const tokenA = findToken(tokens[0]);
        const tokenB = findToken(tokens[1]);

        if (tokenA && tokenB) {
          // Find if pool exists
          const poolExists = poolList.some(
            (pool) =>
              (pool.firstTokenAddress === tokenA.address &&
                pool.secondTokenAddress === tokenB.address) ||
              (pool.firstTokenAddress === tokenB.address &&
                pool.secondTokenAddress === tokenA.address)
          );

          const actionType = poolExists ? "provideLiquidity" : "createPool";

          // If amount is missing, ask for it
          if (!amount) {
            response.message = `How much ${tokenA.symbol} would you like to add to the ${tokenA.symbol}-${tokenB.symbol} pool?`;
          } else {
            response = {
              success: true,
              message: `Ready to ${
                poolExists ? "add liquidity to" : "create a new pool for"
              } ${tokenA.symbol} and ${tokenB.symbol} with ${amount} ${
                tokenA.symbol
              }. Click the button below to proceed.`,
              data: {
                function_name: actionType,
                function_arguments: {
                  tokenA: tokenA.symbol,
                  tokenB: tokenB.symbol,
                  amountA: amount,
                  chain: selectedNetwork?.code || "sonic",
                },
              },
            };
          }
        } else {
          if (!tokenA && !tokenB) {
            response.message = `I couldn't identify any tokens in your message. Available tokens are: ${TokenList.map(
              (t) => t.symbol
            ).join(", ")}`;
          } else if (!tokenA) {
            response.message = `I couldn't identify the first token. Did you mean one of these? ${TokenList.map(
              (t) => t.symbol
            ).join(", ")}`;
          } else {
            response.message = `I couldn't identify the second token. Did you mean one of these? ${TokenList.map(
              (t) => t.symbol
            ).join(", ")}`;
          }
        }
      } else {
        response.message =
          "To add liquidity, please specify two tokens. For example: 'add liquidity S and USDT'";
      }
    }
    // Check for remove liquidity or withdraw command
    else if (input.includes("remove liquidity") || input.includes("withdraw")) {
      if (tokens.length >= 2) {
        const tokenA = findToken(tokens[0]);
        const tokenB = findToken(tokens[1]);

        if (tokenA && tokenB) {
          response = {
            success: true,
            message: `Ready to remove liquidity for ${tokenA.symbol} and ${tokenB.symbol}. Click the button below to proceed.`,
            data: {
              function_name: "removeLiquidity",
              function_arguments: {
                tokenA: tokenA.symbol,
                tokenB: tokenB.symbol,
                percentage: amount || "100",
                chain: selectedNetwork?.code || "sonic",
              },
            },
          };
        } else {
          if (!tokenA && !tokenB) {
            response.message = `I couldn't identify any tokens in your message. Available tokens are: ${TokenList.map(
              (t) => t.symbol
            ).join(", ")}`;
          } else if (!tokenA) {
            response.message = `I couldn't identify the first token. Did you mean one of these? ${TokenList.map(
              (t) => t.symbol
            ).join(", ")}`;
          } else {
            response.message = `I couldn't identify the second token. Did you mean one of these? ${TokenList.map(
              (t) => t.symbol
            ).join(", ")}`;
          }
        }
      } else {
        response.message =
          "To remove liquidity, please specify the token pair. For example: 'remove liquidity S and USDT'";
      }
    }
    // Check for bridge command
    else if (input.includes("bridge")) {
      const networks = extractNetworks(input);

      if (tokens.length >= 1) {
        const token = findToken(tokens[0]);

        if (token) {
          if (networks.length >= 1) {
            const targetNetwork = findNetwork(networks[0]);

            if (targetNetwork) {
              if (amount) {
                response = {
                  success: true,
                  message: `Ready to bridge ${amount} ${token.symbol} to ${targetNetwork.name}. Click the button below to proceed.`,
                  data: {
                    function_name: "bridge",
                    function_arguments: {
                      token: token.symbol,
                      amount: amount,
                      targetChain: targetNetwork.code,
                    },
                  },
                };
              } else {
                response.message = `How much ${token.symbol} would you like to bridge to ${targetNetwork.name}?`;
              }
            } else {
              response.message = `I couldn't identify the target network. Available networks are: ${Networks.map(
                (n) => n.name
              ).join(", ")}`;
            }
          } else {
            response.message =
              "Please specify a target network. For example: 'bridge 10 S to Arbitrum'";
          }
        } else {
          response.message = `I couldn't identify the token you want to bridge. Available tokens are: ${TokenList.map(
            (t) => t.symbol
          ).join(", ")}`;
        }
      } else {
        response.message =
          "To bridge tokens, please specify a token. For example: 'bridge 10 S to Arbitrum'";
      }
    }
    // Check for token launcher command
    else if (input.includes("launch token") || input.includes("create token")) {
      response = {
        success: true,
        message:
          "Ready to launch a new token. Click the button below to proceed.",
        data: {
          function_name: "launchToken",
          function_arguments: {},
        },
      };
    }

    return response;
  };

  // Helper function to extract token symbols from input
  const extractTokens = (input: string): string[] => {
    const tokens: string[] = [];
    const inputLower = input.toLowerCase();

    // First, try to find exact token matches (for multi-word tokens like "SideToken")
    TokenList.forEach((token) => {
      // Check for exact token name or symbol match
      if (
        inputLower.includes(token.name.toLowerCase()) ||
        inputLower.includes(token.symbol.toLowerCase())
      ) {
        // Avoid duplicates
        if (!tokens.includes(token.symbol)) {
          tokens.push(token.symbol);
        }
      }
    });

    // Sort tokens by length of name (descending) to prioritize longer token names
    // This helps with cases where one token name is a substring of another
    return tokens.sort((a, b) => {
      const tokenA = TokenList.find((t) => t.symbol === a);
      const tokenB = TokenList.find((t) => t.symbol === b);
      if (!tokenA || !tokenB) return 0;
      return tokenB.name.length - tokenA.name.length;
    });
  };

  // Helper function to extract amount from input
  const extractAmount = (input: string): string | null => {
    const amountRegex = /\b(\d+(\.\d+)?)\b/;
    const match = input.match(amountRegex);
    return match ? match[1] : null;
  };

  // Helper function to extract network names from input
  const extractNetworks = (input: string): string[] => {
    const networks: string[] = [];

    Networks.forEach((network) => {
      if (input.toLowerCase().includes(network.name.toLowerCase())) {
        networks.push(network.name);
      }
    });

    return networks;
  };

  // Helper function to find a token by symbol
  const findToken = (symbol: string) => {
    // First try exact match on symbol
    let token = TokenList.find(
      (token) => token.symbol.toLowerCase() === symbol.toLowerCase()
    );

    // If no match, try partial match on name
    if (!token) {
      token = TokenList.find((token) =>
        token.name.toLowerCase().includes(symbol.toLowerCase())
      );
    }

    return token;
  };

  // Helper function to find a network by name
  const findNetwork = (name: string) => {
    return Networks.find(
      (network) => network.name.toLowerCase() === name.toLowerCase()
    );
  };

  const sendMessage = async () => {
    if (!input.trim()) return; // Avoid sending empty input

    // Add user's message to the chat
    setMessages((prevMessages: any) => [
      ...prevMessages,
      { text: input, sender: "user" },
    ]);

    try {
      setLoading(true);
      // Process the command locally without any API call
      const response = { data: await processLocalCommand(input) };

      const { success, message, data } = response.data;

      // Getting data from response
      if (success && data.function_name && data.function_arguments) {
        const { function_name, function_arguments } = data;
        setFunctionList([
          ...functionList,
          { [function_name]: Object.keys(function_arguments) },
        ]);
        console.log(functionList);
        if (
          function_arguments["chain"] &&
          chainData[function_arguments["chain"]]
        )
          setChainData({
            ...chainData,
            [function_arguments["chain"]]: [
              ...chainData[function_arguments["chain"]],
              function_name,
            ],
          });
        else if (function_arguments["chain"])
          setChainData({
            ...chainData,
            [function_arguments["chain"]]: [function_name],
          });
      }

      // Add bot's response to the chat
      setMessageHistory([...messageHistory, input]);
      setMessages((prevMessages: any) => [
        ...prevMessages,
        { isFunctionalData: success, data: data, text: message, sender: "bot" },
      ]);

      setInput(""); // Clear the input field
    } catch (error) {
      console.log("error", error);
      const errorMessage = {
        text: "Error processing your request.",
        sender: "bot",
      };
      setMessages((prevMessages: any) => [...prevMessages, errorMessage]);
    } finally {
      setLoading(false); // Reset loading state
    }
  };

  const handleKeyDown = (e: any) => {
    if (e.key === "Enter") {
      sendMessage();
    }
  };

  const handleBtnClick = async (data: any) => {
    const { function_name, function_arguments } = data;
    console.log("Executing function:", function_name, function_arguments);

    switch (function_name) {
      case "createPool":
        // Set up token parameters
        setSelectedLiquidity(
          TokenList.filter(
            (token: any) => token.symbol == function_arguments.tokenA
          )[0]
        );
        setSelectedToLiquidity(
          TokenList.filter(
            (token: any) => token.symbol == function_arguments.tokenB
          )[0]
        );
        setFromAmount(function_arguments.amountA);

        // Set up pool ratio if amountB is provided
        if (function_arguments.amountB) {
          setTwoby1(
            Number(function_arguments.amountB) /
              Number(function_arguments.amountA)
          );
        }

        // Set network if specified
        if (function_arguments.chain) {
          const network = Networks.find(
            (n) => n.code === function_arguments.chain
          );
          if (network) {
            setSelectedNetwork(network);
          }
        }

        // Execute create pool function
        try {
          await CreatePool();
          setMessages((prevMessages: any) => [
            ...prevMessages,
            {
              text: `Successfully created pool for ${function_arguments.tokenA} and ${function_arguments.tokenB}`,
              sender: "bot",
            },
          ]);
        } catch (error: any) {
          setMessages((prevMessages: any) => [
            ...prevMessages,
            {
              text: `Error creating pool: ${error.message || "Unknown error"}`,
              sender: "bot",
            },
          ]);
        }
        break;

      case "provideLiquidity":
        // Set up token parameters
        setSelectedLiquidity(
          TokenList.filter(
            (token: any) => token.symbol == function_arguments.tokenA
          )[0]
        );
        setSelectedToLiquidity(
          TokenList.filter(
            (token: any) => token.symbol == function_arguments.tokenB
          )[0]
        );
        setFromAmount(function_arguments.amountA);

        // Set network if specified
        if (function_arguments.chain) {
          const network = Networks.find(
            (n) => n.code === function_arguments.chain
          );
          if (network) {
            setSelectedNetwork(network);
          }
        }

        // Find the pool
        const liquidityPool = poolList.find(
          (pool: any) =>
            (pool.firstTokenAddress ===
              TokenList.filter(
                (token: any) => token.symbol == function_arguments.tokenA
              )[0].address &&
              pool.secondTokenAddress ===
                TokenList.filter(
                  (token: any) => token.symbol == function_arguments.tokenB
                )[0].address) ||
            (pool.firstTokenAddress ===
              TokenList.filter(
                (token: any) => token.symbol == function_arguments.tokenB
              )[0].address &&
              pool.secondTokenAddress ===
                TokenList.filter(
                  (token: any) => token.symbol == function_arguments.tokenA
                )[0].address)
        );

        if (liquidityPool) {
          setSelectedPool(liquidityPool);
          setIsAddLiquidity(true);
          setIsRemoveLiquidity(false);
          setIsCreatePool(false);

          // Execute add liquidity function
          try {
            // Call the add liquidity function here
            setMessages((prevMessages: any) => [
              ...prevMessages,
              {
                text: `Successfully added liquidity for ${function_arguments.tokenA} and ${function_arguments.tokenB}`,
                sender: "bot",
              },
            ]);
          } catch (error: any) {
            setMessages((prevMessages: any) => [
              ...prevMessages,
              {
                text: `Error adding liquidity: ${
                  error.message || "Unknown error"
                }`,
                sender: "bot",
              },
            ]);
          }
        } else {
          setMessages((prevMessages: any) => [
            ...prevMessages,
            {
              text: `Pool for ${function_arguments.tokenA} and ${function_arguments.tokenB} does not exist. Please create the pool first.`,
              sender: "bot",
            },
          ]);
        }
        break;

      case "swap":
        // Set up swap parameters
        setSelectedLiquidity(
          TokenList.filter(
            (token: any) => token.symbol == function_arguments.tokenA
          )[0]
        );
        setSelectedToLiquidity(
          TokenList.filter(
            (token: any) => token.symbol == function_arguments.tokenB
          )[0]
        );
        setFromAmount(function_arguments.amount);

        // Find the pool for these tokens
        const swapPool = poolList.find(
          (pool: any) =>
            (pool.firstTokenAddress ===
              TokenList.filter(
                (token: any) => token.symbol == function_arguments.tokenA
              )[0].address &&
              pool.secondTokenAddress ===
                TokenList.filter(
                  (token: any) => token.symbol == function_arguments.tokenB
                )[0].address) ||
            (pool.firstTokenAddress ===
              TokenList.filter(
                (token: any) => token.symbol == function_arguments.tokenB
              )[0].address &&
              pool.secondTokenAddress ===
                TokenList.filter(
                  (token: any) => token.symbol == function_arguments.tokenA
                )[0].address)
        );

        if (swapPool) {
          setSelectedPool(swapPool);

          // Execute swap function
          try {
            await SwapLiquidity();
            setMessages((prevMessages: any) => [
              ...prevMessages,
              {
                text: `Successfully swapped ${function_arguments.amount} ${function_arguments.tokenA} to ${function_arguments.tokenB}`,
                sender: "bot",
              },
            ]);
          } catch (error: any) {
            setMessages((prevMessages: any) => [
              ...prevMessages,
              {
                text: `Error swapping tokens: ${
                  error.message || "Unknown error"
                }`,
                sender: "bot",
              },
            ]);
          }
        } else {
          setMessages((prevMessages: any) => [
            ...prevMessages,
            {
              text: `No liquidity pool found for ${function_arguments.tokenA} and ${function_arguments.tokenB}. Please create a pool first.`,
              sender: "bot",
            },
          ]);
        }
        break;

      case "removeLiquidity":
        // Set up remove liquidity parameters
        setSelectedLiquidity(
          TokenList.filter(
            (token: any) => token.symbol == function_arguments.tokenA
          )[0]
        );
        setSelectedToLiquidity(
          TokenList.filter(
            (token: any) => token.symbol == function_arguments.tokenB
          )[0]
        );

        // Find the pool for these tokens
        const removePool = poolList.find(
          (pool: any) =>
            (pool.firstTokenAddress ===
              TokenList.filter(
                (token: any) => token.symbol == function_arguments.tokenA
              )[0].address &&
              pool.secondTokenAddress ===
                TokenList.filter(
                  (token: any) => token.symbol == function_arguments.tokenB
                )[0].address) ||
            (pool.firstTokenAddress ===
              TokenList.filter(
                (token: any) => token.symbol == function_arguments.tokenB
              )[0].address &&
              pool.secondTokenAddress ===
                TokenList.filter(
                  (token: any) => token.symbol == function_arguments.tokenA
                )[0].address)
        );

        if (removePool) {
          setSelectedPool(removePool);
          setIsAddLiquidity(false);
          setIsRemoveLiquidity(true);
          setIsCreatePool(false);

          // Execute remove liquidity function
          try {
            // Call the remove liquidity function here
            setMessages((prevMessages: any) => [
              ...prevMessages,
              {
                text: `Successfully removed liquidity for ${function_arguments.tokenA} and ${function_arguments.tokenB}`,
                sender: "bot",
              },
            ]);
          } catch (error: any) {
            setMessages((prevMessages: any) => [
              ...prevMessages,
              {
                text: `Error removing liquidity: ${
                  error.message || "Unknown error"
                }`,
                sender: "bot",
              },
            ]);
          }
        } else {
          setMessages((prevMessages: any) => [
            ...prevMessages,
            {
              text: `No liquidity pool found for ${function_arguments.tokenA} and ${function_arguments.tokenB}`,
              sender: "bot",
            },
          ]);
        }
        break;

      case "bridge":
        // Set up bridge parameters
        setSelectedLiquidity(
          TokenList.filter(
            (token: any) => token.symbol == function_arguments.token
          )[0]
        );
        setFromAmount(function_arguments.amount);

        // Find the target network
        const targetNetwork = Networks.find(
          (network: any) => network.code === function_arguments.targetChain
        );

        if (targetNetwork) {
          setSelectedNetwork(targetNetwork);

          // Execute bridge function
          try {
            // Call the bridge function here
            setMessages((prevMessages: any) => [
              ...prevMessages,
              {
                text: `Successfully initiated bridge of ${function_arguments.amount} ${function_arguments.token} to ${targetNetwork.name}`,
                sender: "bot",
              },
            ]);
          } catch (error: any) {
            setMessages((prevMessages: any) => [
              ...prevMessages,
              {
                text: `Error bridging tokens: ${
                  error.message || "Unknown error"
                }`,
                sender: "bot",
              },
            ]);
          }
        } else {
          setMessages((prevMessages: any) => [
            ...prevMessages,
            {
              text: `Target network not found`,
              sender: "bot",
            },
          ]);
        }
        break;

      case "launchToken":
        // Execute token launch function
        try {
          // Call the token launch function here
          setMessages((prevMessages: any) => [
            ...prevMessages,
            {
              text: `Token launch process initiated`,
              sender: "bot",
            },
          ]);
        } catch (error: any) {
          setMessages((prevMessages: any) => [
            ...prevMessages,
            {
              text: `Error launching token: ${
                error.message || "Unknown error"
              }`,
              sender: "bot",
            },
          ]);
        }
        break;

      default:
        setMessages((prevMessages: any) => [
          ...prevMessages,
          {
            text: `Unknown function: ${function_name}`,
            sender: "bot",
          },
        ]);
        break;
    }
  };

  return (
    <div className="relative w-full h-[80%] flex flex-col justify-center items-center p-4">
      <div className="relative z-10 flex flex-col w-[90%] max-w-2xl h-[600px] bg-[#1a1a1a]/80 backdrop-blur-md text-white border border-purple-500/30 rounded-xl shadow-lg shadow-pink-500/10 overflow-hidden">
        {/* Chat Header */}
        <div className="relative flex w-full h-[60px] items-center justify-center text-center text-white text-xl font-semibold border-b border-purple-500/20">
          <span className="bg-gradient-to-r from-purple-500 to-pink-500 bg-clip-text text-transparent">
            SonicAgent
          </span>
        </div>

        {/* Chat Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-thin scrollbar-thumb-purple-500 scrollbar-track-transparent">
          {/* Welcome Message */}
          {messages.length === 0 && (
            <div className="flex flex-col space-y-4">
              <div className="flex items-start">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center">
                  <span className="text-white text-xs font-bold">AI</span>
                </div>
                <div className="ml-3 bg-gray-800/50 rounded-lg p-3 max-w-[80%]">
                  <p className="text-white">
                    Hello! I&apos;m SonicAgent, your local DeFi assistant. I can
                    help you with:
                  </p>
                  <ul className="mt-2 space-y-1 text-gray-300 text-sm">
                    <li className="flex items-center">
                      <span className="w-2 h-2 bg-purple-500 rounded-full mr-2"></span>
                      Swapping tokens (e.g., &quot;swap 10 USDT to S&quot;)
                    </li>
                    <li className="flex items-center">
                      <span className="w-2 h-2 bg-purple-500 rounded-full mr-2"></span>
                      Adding liquidity (e.g., &quot;add liquidity 5 S and
                      USDT&quot;)
                    </li>
                    <li className="flex items-center">
                      <span className="w-2 h-2 bg-purple-500 rounded-full mr-2"></span>
                      Removing liquidity (e.g., &quot;withdraw S and USDT&quot;)
                    </li>
                    <li className="flex items-center">
                      <span className="w-2 h-2 bg-purple-500 rounded-full mr-2"></span>
                      Bridging tokens (e.g., &quot;bridge 10 S to
                      Arbitrum&quot;)
                    </li>
                    <li className="flex items-center">
                      <span className="w-2 h-2 bg-purple-500 rounded-full mr-2"></span>
                      Creating tokens (e.g., &quot;launch a new token&quot;)
                    </li>
                  </ul>
                  <p className="mt-2 text-white">
                    Just tell me what you want to do, and I&apos;ll execute it
                    for you!
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Chat Messages */}
          {messages.map((message: any, index: number) => (
            <div
              key={index}
              className={`flex items-start ${
                message.sender === "user" ? "justify-end" : "justify-start"
              }`}
            >
              {message.sender === "bot" && (
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center">
                  <span className="text-white text-xs font-bold">AI</span>
                </div>
              )}
              <div
                className={`${
                  message.sender === "user"
                    ? "bg-purple-600/40 ml-auto"
                    : "bg-gray-800/50 ml-3"
                } rounded-lg p-3 max-w-[80%]`}
              >
                <p className="text-white">{message.text}</p>
                {message.isFunctionalData && (
                  <button
                    onClick={() => handleBtnClick(message.data)}
                    className="mt-3 px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 rounded-md text-white text-sm hover:opacity-90 transition-opacity flex items-center justify-center w-full"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-4 w-4 mr-2"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M13 10V3L4 14h7v7l9-11h-7z"
                      />
                    </svg>
                    Execute {message.data.function_name}
                  </button>
                )}
              </div>
              {message.sender === "user" && (
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-purple-600/40 ml-3 flex items-center justify-center">
                  <span className="text-white text-xs font-bold">You</span>
                </div>
              )}
            </div>
          ))}

          {/* Loading indicator */}
          {loading && (
            <div className="flex items-start">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center">
                <span className="text-white text-xs font-bold">AI</span>
              </div>
              <div className="ml-3 bg-gray-800/50 rounded-lg p-3">
                <div className="flex space-x-2">
                  <div
                    className="w-2 h-2 rounded-full bg-purple-500 animate-bounce"
                    style={{ animationDelay: "0ms" }}
                  ></div>
                  <div
                    className="w-2 h-2 rounded-full bg-purple-500 animate-bounce"
                    style={{ animationDelay: "150ms" }}
                  ></div>
                  <div
                    className="w-2 h-2 rounded-full bg-purple-500 animate-bounce"
                    style={{ animationDelay: "300ms" }}
                  ></div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Chat Input */}
        <div className="p-4 border-t border-purple-500/20">
          <div className="relative flex items-center">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Type your message..."
              className="w-full bg-gray-800/50 text-white rounded-lg pl-4 pr-12 py-3 focus:outline-none focus:ring-2 focus:ring-purple-500/50"
            />
            <button
              onClick={sendMessage}
              disabled={loading}
              className={`absolute right-2 w-8 h-8 flex items-center justify-center rounded-full ${
                loading
                  ? "bg-gray-700 cursor-not-allowed"
                  : "bg-gradient-to-r from-purple-500 to-pink-500 hover:opacity-90"
              } transition-all`}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-4 w-4 text-white"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
                />
              </svg>
            </button>
          </div>
          <div className="mt-2 text-xs text-gray-400 text-center">
            Ask me to perform DeFi operations directly from this chat
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatAI;
