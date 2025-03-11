import React from "react";
import { useState } from "react";

import { ethers } from "ethers";
import Dropdown from "./Dropdown";
import { tokenAbi, tokenBytecode } from "../utils/deployToken";
import { addToken } from "@/services/userService";
import { useLoginContext } from "@/contexts/LoginContext";
import { Networks } from "@/config";
import TransactionStatus, { TransactionStatusType } from "./TransactionStatus";
// import { deployTokenContract } from "./deploy";

const TokenLauncher = () => {
  const [formData, setFormData] = useState({
    name: "",
    symbol: "",
    visual: null,
    visualBase64: null,
    totalSupply: "",
    decimals: "",
    chainId: "sonic",
  });

  const chainIdOptions = [{ id: "Sonic", value: "sonic" }];

  const [isDropdown, setIsDropdown] = useState(false);

  const [errors, setErrors] = useState<any>({});
  const [txStatus, setTxStatus] = useState<TransactionStatusType>(null);
  const [statusMessage, setStatusMessage] = useState<string>("");
  const { networkData, switchNetwork } = useLoginContext();

  const resetForm = () => {
    setFormData({
      name: "",
      symbol: "",
      visual: null,
      visualBase64: null,
      totalSupply: "",
      decimals: "",
      chainId: "sonic",
    });
    setErrors({});
  };

  const validateForm = () => {
    const newErrors: any = {};

    if (!formData.name) {
      newErrors.name = "Token Name is required.";
    } else if (formData.name.length > 20) {
      newErrors.name = "Token Name should be under 20 characters.";
    }

    if (!formData.symbol) {
      newErrors.symbol = "Token symbol is required.";
    } else if (formData.symbol.length > 20) {
      newErrors.symbol = "Token symbol should be under 20 characters.";
    }

    if (!formData.visual) {
      newErrors.visual = "Token image is required.";
    }

    if (!formData.totalSupply) {
      newErrors.totalSupply = "Token supply is required.";
    }

    if (!formData.decimals) {
      newErrors.decimals = "Token decimals is required.";
    }

    return newErrors;
  };

  const handleImageUpload = (file: any) => {
    const reader: any = new FileReader();
    reader.onloadend = () => {
      setFormData({
        ...formData,
        visual: file,
        visualBase64: reader.result, // Store the base64 data in the state
      });
    };
    reader.readAsDataURL(file);
  };

  const handleChange = (e: any) => {
    const { name, value, files } = e.target;
    if (name === "visual" && files && files[0]) {
      handleImageUpload(files[0]);
    } else {
      setFormData({
        ...formData,
        [name]: value,
      });
    }
  };

  const deployTokenContract = async () => {
    if (typeof window.ethereum !== "undefined") {
      try {
        // Request MetaMask account access
        await window.ethereum.request({ method: "eth_requestAccounts" });

        // Set up provider and signer
        const provider = new ethers.BrowserProvider(window.ethereum);
        const signer = await provider.getSigner();

        // Create a ContractFactory with the ABI, bytecode, and signer (from MetaMask)
        const contractFactory = new ethers.ContractFactory(
          tokenAbi,
          tokenBytecode,
          signer
        );

        // Token constructor parameters
        const name = "MyOmniToken"; // Replace with desired token name
        const symbol = "MOT"; // Replace with desired token symbol
        const initialSupply = ethers.parseUnits("1000000", 18); // Replace with initial token supply
        const minterAddress = await signer.getAddress(); // Get the connected MetaMask account
        const isMainChain = false; // Set according to your need

        // Deploy the contract
        console.log("Deploying token contract...");
        const contract = await contractFactory.deploy(
          name,
          symbol,
          initialSupply,
          minterAddress,
          isMainChain
        );

        // Wait for the transaction to be confirmed
        console.log("Waiting for deployment transaction to be confirmed...");
        await contract.waitForDeployment();

        // Log contract address
        console.log("Token deployed at address:", contract.target); // Use `contract.target` to get the deployed contract address
        return contract;
      } catch (error) {
        console.error("Failed to deploy contract:", error);
      }
    } else {
      console.error(
        "MetaMask is not installed. Please install MetaMask to use this feature."
      );
    }
  };
  function base64ToBuffer(base64String: string): Uint8Array {
    return Uint8Array.from(Buffer.from(base64String, "base64"));
  }

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    const newErrors = validateForm();
    if (Object.keys(newErrors).length === 0) {
      console.log("Form data:", formData);
      // Handle form submission
      if (!window.ethereum) {
        console.error("Ethereum provider not found");
        return;
      }

      setTxStatus("confirming");
      setStatusMessage("Creating your token...");

      const provider = new ethers.BrowserProvider(window.ethereum);
      try {
        const deploy = await deployTokenContract();
        setTxStatus("success");

        await addToken({
          name: formData.name,
          symbol: formData.symbol,
          visual: base64ToBuffer(formData.visual!) || "/coins/sonic.svg",
          totalSupply: formData.totalSupply,
          decimals: formData.decimals,
          chainId: "sonic", // Always use "sonic" as the chainId
        });

        setStatusMessage("Token created successfully!");
        resetForm(); // Reset the form after successful token creation

        // Clear the success message after 5 seconds
        setTimeout(() => {
          setTxStatus(null);
          setStatusMessage("");
        }, 5000);
      } catch (error) {
        console.error("Failed to add token:", error);
        setTxStatus("failed");
        setStatusMessage("Failed to create token. Please try again later.");
      }
    } else {
      setErrors(newErrors);
    }
  };

  return (
    <div className="relative w-full h-full flex flex-col justify-center items-center p-6 overflow-hidden">
      {/* Background with animated gradient */}
      {/* <div className="absolute inset-0 bg-gradient-to-bl from-[#1a1a1a] via-[#297373]/10 to-[#1a1a1a] z-0"></div> */}
      {/* Hexagon pattern background */}
      {/* <div className="absolute inset-0 bg-[url('/assets/hexagon-pattern.svg')] bg-repeat opacity-5 z-0"></div> */}
      <form
        onSubmit={handleSubmit}
        className="relative z-10 max-w-4xl w-full border border-purple-500/30 bg-[#1a1a1a]/80 backdrop-blur-md rounded-xl p-8 flex flex-col items-start justify-center gap-8 shadow-lg shadow-pink-500/10"
      >
        <h2 className="m-auto border-b border-purple-500/20 w-full text-center pb-6 text-2xl font-semibold">
          <span className="bg-gradient-to-r from-purple-500 to-pink-500 bg-clip-text text-transparent">
            Token Creator
          </span>
        </h2>
        <div className="flex flex-col md:flex-row items-center justify-between gap-8 w-full">
          <div className="w-full flex flex-col gap-4 items-stretch justify-stretch">
            {/* Name Field */}
            <div className="w-full flex flex-col md:flex-row md:justify-between md:items-center gap-2">
              <label htmlFor="name" className="text-pink-500">
                Token Name
              </label>
              <input
                type="text"
                id="name"
                name="name"
                placeholder="eg, TESTZR12"
                className="h-[40px] rounded-md text-white placeholder:text-zinc-400 bg-zinc-800/70 border border-purple-500/30 px-3 focus:border-pink-500 focus:outline-none transition-colors"
                value={formData.name}
                onChange={handleChange}
              />
            </div>
            {errors.name && (
              <span className="text-red-500 text-sm">{errors.name}</span>
            )}

            {/* Symbol Field */}
            <div className="w-full flex flex-col md:flex-row md:justify-between md:items-center gap-2">
              <label htmlFor="symbol" className="text-pink-500">
                Token Symbol
              </label>
              <input
                type="text"
                id="symbol"
                name="symbol"
                placeholder="eg. TRZ12"
                className="h-[40px] rounded-md text-white placeholder:text-zinc-400 bg-zinc-800/70 border border-purple-500/30 px-3 focus:border-pink-500 focus:outline-none transition-colors"
                value={formData.symbol}
                onChange={handleChange}
              />
            </div>
            {errors.symbol && (
              <span className="text-red-500 text-sm">{errors.symbol}</span>
            )}

            {/* Total Supply Field */}
            <div className="w-full flex flex-col md:flex-row md:justify-between md:items-center gap-2">
              <label htmlFor="totalSupply" className="text-pink-500">
                Total Supply
              </label>
              <input
                type="number"
                id="totalSupply"
                name="totalSupply"
                className="h-[40px] rounded-md text-white placeholder:text-zinc-400 bg-zinc-800/70 border border-purple-500/30 px-3 focus:border-pink-500 focus:outline-none transition-colors"
                value={formData.totalSupply}
                onChange={handleChange}
              />
            </div>
            {errors.totalSupply && (
              <span className="text-red-500 text-sm">{errors.totalSupply}</span>
            )}

            {/* Decimals Field */}
            <div className="w-full flex flex-col md:flex-row md:justify-between md:items-center gap-2">
              <label htmlFor="decimals" className="text-pink-500">
                Decimals
              </label>
              <input
                type="number"
                id="decimals"
                name="decimals"
                className="h-[40px] rounded-md text-white placeholder:text-zinc-400 bg-zinc-800/70 border border-purple-500/30 px-3 focus:border-pink-500 focus:outline-none transition-colors"
                value={formData.decimals}
                onChange={handleChange}
              />
            </div>
            {errors.decimals && (
              <span className="text-red-500 text-sm">{errors.decimals}</span>
            )}

            {/* Chain ID Field */}
            <div className="w-full flex flex-col md:flex-row md:justify-between md:items-center gap-2">
              <label htmlFor="chainId" className="text-pink-500">
                Network
              </label>
              <div className="w-full md:w-auto">
                <div className="inline-flex justify-center rounded-md border border-purple-500/30 px-4 py-2 bg-zinc-800/70 text-sm font-medium text-white">
                  <span className="flex items-center">
                    <span className="mr-2 h-2 w-2 rounded-full bg-green-500"></span>
                    Sonic Network
                  </span>
                </div>
              </div>
            </div>
            {errors.chainId && (
              <span className="text-red-500 text-sm">{errors.chainId}</span>
            )}
          </div>

          {/* Visual (Image) Field */}
          <div className="w-full flex flex-col justify-center items-center h-full gap-3">
            <label htmlFor="visual" className="text-pink-500 text-center">
              Token Image
            </label>
            <div className="border-2 border-dashed border-purple-500/40 rounded-lg p-2 hover:border-pink-500 transition-colors">
              {formData.visualBase64 ? (
                <div>
                  <img
                    src={formData.visualBase64}
                    alt="Token Preview"
                    className="size-[200px] object-contain mt-3 rounded-lg"
                  />
                </div>
              ) : (
                <div>
                  <img
                    src="http://loremflickr.com/500/500"
                    alt="Token Preview"
                    className="size-[200px] filter grayscale brightness-50 rounded-lg"
                  />
                </div>
              )}
            </div>
            <input
              type="file"
              id="visual"
              name="visual"
              className="px-4 w-full flex flex-col items-center justify-center text-sm text-pink-500"
              onChange={handleChange}
            />
            {errors.visual && (
              <span className="text-red-500 text-sm">{errors.visual}</span>
            )}
          </div>
        </div>
        <div className="w-full flex flex-col items-center justify-center mt-2">
          {txStatus && (
            <TransactionStatus status={txStatus} message={statusMessage} />
          )}
          {Networks.filter((item: any) => item.code == formData?.chainId)[0]
            .chainId != networkData?.chainId ? (
            <button
              className="text-white h-[50px] w-[220px] m-auto bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 rounded-lg shadow-md transition-all duration-300"
              onClick={() => {
                switchNetwork(
                  Networks.filter((item: any) => item.code == "sonic")[0]
                    .chainId
                );
              }}
            >
              Switch to Sonic Network
            </button>
          ) : (
            <button
              className="text-white h-[50px] w-[220px] m-auto bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 rounded-lg shadow-md transition-all duration-300"
              type="submit"
            >
              Create Token
            </button>
          )}
        </div>
      </form>
    </div>
  );
};

export default TokenLauncher;
