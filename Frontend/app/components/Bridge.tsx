import React from "react";
import SectionInput from "./SectionInput";
import { useLoginContext } from "@/contexts/LoginContext";
import { ethers } from "ethers";
import BridgeAbi from "@/consts/Abis/bridge.json";
import { useSwapContext } from "@/contexts/Swapcontext";

const Bridge = () => {
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
    networkData,
    address,
    selectedNetwork,
  } = useLoginContext();
  const { selectedToNetwork } = useSwapContext();

  const isDisabled =
    buttonText == "Select Token" || buttonText == "Enter Amount";

  const bridgechainMAp: any = {
    bnb: "0x27E11cd7831963101452dbd0f41c1D011F2Fa122",
    arb: "0x0A063b3AD7044a122c4C0b31A5BcB07e9D8498be",
    sonic: "0xE844478Acb6b7714ac1ffb08aFC3E9D13a1E8fB7",
    base: "0x27E11cd7831963101452dbd0f41c1D011F2Fa122",
    eth: "0x41E65e9E6b200eb6cf9af08Fe0A876e2B32E5249",
  };

  const lockCall = async () => {
    try {
      const web3Provider = networkData?.provider as ethers.BrowserProvider;
      const signer = await web3Provider.getSigner(address!);
      let bridgeData = null;

      const bridgeContract = await new ethers.Contract(
        bridgechainMAp[selectedNetwork?.code],
        BridgeAbi,
        signer
      );
      const lockArgs = [
        selectedLiquidity?.address,
        Number(fromAmount),
        selectedToNetwork?.chainId,
        selectedToLiquidity?.address,
      ];
      bridgeData = await bridgeContract.lock(...lockArgs);
    } catch (err) {
      console.log(err);
    }
  };
  return (
    <div className="relative w-full h-[80%] flex flex-col justify-center items-center p-4">
      {/* Bridge Component */}
      <div className="relative z-10 flex flex-col w-[90%] max-w-md h-auto bg-[#1a1a1a]/80 backdrop-blur-md text-white border border-purple-500/30 rounded-xl shadow-lg shadow-pink-500/10">
        <div className="relative flex w-full h-[60px] items-center justify-center text-center text-white text-xl font-semibold border-b border-purple-500/20">
          <span className="bg-gradient-to-r from-purple-500 to-pink-500 bg-clip-text text-transparent">
            Cross-Chain Bridge
          </span>
        </div>
        <div className="relative flex w-full flex-col items-center justify-start space-y-8 px-6 py-10">
          <SectionInput
            title="From"
            selectedLiquidity={selectedLiquidity}
            placeholder="Minimum Amount"
            inputRef="fromAmount"
            setInputValue={setFromAmount}
            inputValue={fromAmount}
          />

          {/* Chain connection indicator */}
          <div className="flex justify-center items-center w-full">
            <div className="relative flex items-center justify-center">
              <div className="h-[2px] w-20 bg-gradient-to-r from-purple-500 to-pink-500"></div>
              <div className="absolute p-2 rounded-full bg-[#1a1a1a] border border-purple-500/30">
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
                    d="M13 10V3L4 14h7v7l9-11h-7z"
                  />
                </svg>
              </div>
            </div>
          </div>

          <SectionInput
            title="To"
            selectedLiquidity={selectedToLiquidity}
            placeholder="Minimum Amount"
            inputRef="toAmount"
            setInputValue={setToAmount}
            inputValue={toAmount}
          />

          <button
            disabled={isDisabled}
            className="text-white text-base font-medium bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 disabled:from-gray-600/60 disabled:to-gray-600/60 text-center rounded-lg w-full h-[50px] transition-all duration-300 shadow-md"
            onClick={lockCall}
          >
            {buttonText}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Bridge;
