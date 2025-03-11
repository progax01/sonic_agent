import { Networks, TokenList } from "@/config";
import { useLoginContext } from "@/contexts/LoginContext";
import { useSwapContext } from "@/contexts/Swapcontext";
import React, { Dispatch, SetStateAction, useState } from "react";
import { IoMdClose } from "react-icons/io";
import { FiSearch } from "react-icons/fi";

interface TokenItem {
  name: string;
  logo: string;
  [key: string]: any;
}

const TokenModel = ({
  setIsOpen,
  title,
}: {
  setIsOpen: Dispatch<SetStateAction<boolean>>;
  title: string;
}) => {
  const [tokenList, setTokenList] = useState<TokenItem[]>(TokenList);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const {
    selectedLiquidity,
    setSelectedLiquidity,
    selectedToLiquidity,
    setSelectedToLiquidity,
    fromLiquidity,
    setFromLiquidity,
    toLiquidity,
    setToLiquidity,
    selectedNetwork,
    setSelectedNetwork,
    route,
  } = useLoginContext();
  const { setSelectedToNetwork } = useSwapContext();

  // Function to check if a token is already selected in the other field
  const isTokenAlreadySelected = (token: TokenItem) => {
    if (title === "From" && selectedToLiquidity?.name === token.name) {
      return true;
    }
    if (title === "To" && selectedLiquidity?.name === token.name) {
      return true;
    }
    return false;
  };

  // Filter tokens based on search query
  const filteredTokens = tokenList.filter(
    (token) =>
      token.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (token.symbol &&
        token.symbol.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div
      className={`flex flex-col space-y-6 absolute ${
        route == "liquidity" ? "top-[60px] h-[400px]" : "top-[160px] h-[470px]"
      } w-[320px] h-[400px] right-0.5 bg-gradient-to-br from-pink-500/10 via-purple-500/10 to-pink-600/20 backdrop-blur-sm bg-black border-[1px] p-6 border-pink-500/30 rounded-xl z-20 shadow-lg shadow-pink-500/10 animate-fadeIn`}
    >
      {/* Close button */}
      <button
        onClick={() => setIsOpen(false)}
        className="absolute top-4 right-4 text-white hover:text-pink-300 transition-colors p-1 rounded-full hover:bg-white/10"
      >
        <IoMdClose size={24} />
      </button>

      <div className="relative flex w-full justify-center items-center text-white text-xl font-medium">
        <span className="bg-gradient-to-r from-purple-400 to-pink-500 bg-clip-text text-transparent">
          Select Token
        </span>
      </div>

      {/* Search input */}
      <div className="relative w-full">
        <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
          <FiSearch className="text-pink-400" />
        </div>
        <input
          type="text"
          placeholder="Search tokens..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full py-2 pl-10 pr-4 bg-black/20 border border-pink-500/30 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-pink-500/50"
        />
      </div>

      {/* Only show network selection for bridge, not for swap */}
      {route === "bridge" && (
        <div className="relative flex flex-row gap-2 w-full">
          {Networks.map((item) => (
            <button
              key={item.name}
              disabled={
                (title == "To" && route != "bridge") ||
                (title == "To" &&
                  selectedNetwork?.name == item.name &&
                  route == "bridge")
              }
              className={`w-[100px] h-[90px] flex justify-center disabled:opacity-30 items-center text-white border border-pink-500/30 rounded-md font-sm font-normal ${
                selectedNetwork?.name == item.name &&
                "border-white bg-pink-500/20"
              } hover:bg-pink-500/10 transition-all`}
              onClick={() => {
                if (route != "bridge") {
                  setSelectedNetwork(item);
                } else {
                  if (title == "To") {
                    setSelectedToNetwork(item);
                  } else {
                    setSelectedNetwork(item);
                    setSelectedToNetwork(null);
                  }
                }
              }}
            >
              {item.name}
            </button>
          ))}
        </div>
      )}

      {/* For swap, we don't need to check selectedNetwork */}
      <div className="flex w-full max-h-[400px] overflow-y-auto scrollbar-thin scrollbar-thumb-pink-500/20 scrollbar-track-transparent pr-1">
        <div className="flex flex-col w-full h-auto space-y-2">
          {filteredTokens.length > 0 ? (
            filteredTokens.map((item) => {
              const isDisabled = isTokenAlreadySelected(item);
              return (
                <button
                  key={item.name}
                  disabled={isDisabled}
                  className={`flex flex-row space-x-3 text-white font-normal text-base hover:bg-pink-500/10 w-full min-h-[50px] rounded-lg items-center px-4 justify-start border border-pink-500/30 transition-all ${
                    isDisabled
                      ? "opacity-40 cursor-not-allowed"
                      : "hover:shadow-md hover:shadow-pink-500/5"
                  }`}
                  onClick={() => {
                    if (title != "To") {
                      setSelectedLiquidity(item);
                    } else {
                      setSelectedToLiquidity(item);
                    }
                    setIsOpen(false);
                  }}
                >
                  <div className="flex items-center justify-center w-8 h-8 rounded-full bg-gradient-to-br from-purple-500/20 to-pink-500/20 p-1">
                    <img
                      src={item.logo}
                      className="w-6 h-6 object-contain"
                      alt={`${item.name} logo`}
                    />
                  </div>
                  <div className="flex flex-col items-start">
                    <p className="text-sm font-medium">{item.name}</p>
                    {item.symbol && (
                      <p className="text-xs text-gray-400">{item.symbol}</p>
                    )}
                  </div>
                  {isDisabled && (
                    <span className="ml-auto text-xs text-pink-300 bg-pink-500/10 px-2 py-1 rounded-full">
                      Already selected
                    </span>
                  )}
                </button>
              );
            })
          ) : (
            <div className="flex flex-col items-center justify-center py-8 text-gray-400">
              <p>No tokens found</p>
              <p className="text-sm mt-2">Try a different search term</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TokenModel;
