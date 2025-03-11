"use client";

import React from "react";
import { useLoginContext } from "@/contexts/LoginContext";
import { MetaMaskConnector } from "wagmi/connectors/metaMask";
import { sleepTimer } from "../utils/helper";
import Loader from "./Loader";

// Define ethereum interface
interface EthereumProvider {
  isMetaMask?: boolean;
  providers?: EthereumProvider[];
  request: (args: { method: string; params?: any[] }) => Promise<any>;
  on: (event: string, callback: (...args: any[]) => void) => void;
  selectedAddress?: string;
  [key: string]: any;
}

// Extend Window interface
declare global {
  interface Window {
    ethereum?: EthereumProvider;
  }
}

let ethereum: EthereumProvider | null = null;
if (typeof window !== "undefined") {
  ethereum = window?.ethereum || null;
}

const Sidebar = () => {
  const {
    address,
    setAddress,
    selectedLink,
    setSelectedLink,
    setRoute,
    route,
    switchNetwork,
  } = useLoginContext();
  const [loading, setLoading] = React.useState<boolean>(false);
  const [metamaskError, setMetamaskError] = React.useState<string | null>(null);

  // Function to add Sonic chain to MetaMask
  const addSonicChain = async () => {
    try {
      await ethereum?.request({
        method: "wallet_addEthereumChain",
        params: [
          {
            chainId: "0x92", // 146 in hex
            chainName: "Sonic Mainnet",
            nativeCurrency: {
              name: "Sonic",
              symbol: "S",
              decimals: 18,
            },
            rpcUrls: ["https://rpc.soniclabs.com"],
            blockExplorerUrls: ["https://sonicscan.org"],
          },
        ],
      });
      return true;
    } catch (error) {
      console.error("Error adding Sonic chain:", error);
      return false;
    }
  };

  // Function to check and switch to Sonic chain
  const checkAndSwitchToSonicChain = async () => {
    try {
      // Get current chain ID
      const chainId = await ethereum?.request({ method: "eth_chainId" });

      if (chainId !== "0x92") {
        // If not on Sonic chain
        try {
          // Try to switch to Sonic chain
          await ethereum?.request({
            method: "wallet_switchEthereumChain",
            params: [{ chainId: "0x92" }], // 146 in hex
          });
        } catch (switchError: any) {
          // Chain not added yet
          if (switchError.code === 4902) {
            const added = await addSonicChain();
            if (added) {
              // Try switching again after adding
              await ethereum?.request({
                method: "wallet_switchEthereumChain",
                params: [{ chainId: "0x92" }],
              });
            }
          } else {
            throw switchError;
          }
        }
      }
      return true;
    } catch (error) {
      console.error("Error switching to Sonic chain:", error);
      return false;
    }
  };

  const connectMetamask = async () => {
    setLoading(true);
    setMetamaskError(null);

    // Check if MetaMask is installed
    if (
      !ethereum ||
      (!ethereum.isMetaMask &&
        !ethereum.providers?.some((p: EthereumProvider) => p.isMetaMask))
    ) {
      setLoading(false);
      setMetamaskError("MetaMask extension not found");
      return;
    }

    try {
      // First try to add/switch to Sonic chain
      await checkAndSwitchToSonicChain();

      // Then connect with MetaMask
      const metamaskConnector = new MetaMaskConnector();
      const { account } = await metamaskConnector.connect({
        chainId: 146,
      });

      await sleepTimer(1000);
      console.log(account);
      setAddress(account);
      setLoading(false);

      const justProvider =
        ethereum?.providers?.find((e: EthereumProvider) => e?.isMetaMask) ||
        ethereum;
    } catch (error: any) {
      console.log(error);
      setLoading(false);

      // Handle specific errors
      if (error.code === 4902) {
        setMetamaskError("Sonic chain not found. Please add it manually.");
      } else if (error.code === 4001) {
        setMetamaskError("Connection rejected by user");
      } else {
        setMetamaskError("Failed to connect to MetaMask");
      }
    }
  };

  const navLinks = [
    { name: "Home", dex: "home" },
    { name: "SonicAgent", dex: "chat" },
    { name: "Swap", dex: "dex" },
    { name: "Bridge", dex: "bridge" },
    { name: "Token Launcher", dex: "token" },
    { name: "Liquidity", dex: "liquidity" },
  ];

  const handleNavClick = (dex: string) => {
    if (dex === "home" || dex === "chat") {
      setSelectedLink(dex);
      setRoute(null);
    } else {
      setRoute(dex);
      setSelectedLink(null);
    }
  };

  return (
    <div className="h-full w-64 flex-shrink-0 bg-gray-900 border-r border-gray-800 flex flex-col">
      {/* Logo */}
      <div className="p-4 border-b border-gray-800">
        <div className=" text-xl font-semibold bg-gradient-to-r from-purple-500 to-pink-500 bg-clip-text text-transparent">
          Sonic DEX
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4">
        {!address ? (
          <div className="flex flex-col items-center justify-center h-full space-y-4">
            <p className="text-gray-400 text-sm text-center mb-4">
              Connect your wallet to access all features
            </p>
            {metamaskError && (
              <div className="bg-red-500/10 border border-red-500/20 rounded-md p-3 mb-4 w-full">
                <p className="text-red-500 text-sm mb-2">{metamaskError}</p>
                {metamaskError.includes("not found") && (
                  <div className="flex flex-col space-y-2">
                    <a
                      href="https://metamask.io/download/"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-purple-500 hover:text-purple-400 text-sm flex items-center"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-4 w-4 mr-1"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                        />
                      </svg>
                      Download MetaMask Extension
                    </a>
                    <a
                      href="https://chrome.google.com/webstore/detail/metamask/nkbihfbeogaeaoehlefnkodbefgpgknn"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-purple-500 hover:text-purple-400 text-sm flex items-center"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-4 w-4 mr-1"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                        />
                      </svg>
                      Chrome Web Store
                    </a>
                    <a
                      href="https://addons.mozilla.org/en-US/firefox/addon/ether-metamask/"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-purple-500 hover:text-purple-400 text-sm flex items-center"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-4 w-4 mr-1"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                        />
                      </svg>
                      Firefox Add-ons
                    </a>
                  </div>
                )}
              </div>
            )}
            {!loading ? (
              <button
                className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white text-base font-normal w-full py-3 flex flex-row space-x-3 justify-center items-center rounded-md"
                onClick={connectMetamask}
              >
                <img src="/Metamask.png" alt="Logo" className="size-6" />
                <p>Connect Metamask</p>
              </button>
            ) : (
              <Loader />
            )}
          </div>
        ) : (
          <div className="flex flex-col space-y-1">
            {navLinks.map((item) => (
              <button
                key={item.dex}
                className={`w-full text-left px-4 py-3 rounded-md ${
                  (selectedLink === item.dex || route === item.dex) &&
                  item.dex != "chat"
                    ? "bg-gray-800 text-white"
                    : "text-gray-400 hover:bg-gray-800 hover:text-white "
                } ${
                  item.dex == "chat" &&
                  "bg-gradient-to-r from-purple-500 to-pink-500 bg-clip-text text-transparent"
                }`}
                onClick={() => handleNavClick(item.dex)}
              >
                {item.name}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* User info */}
      {address && (
        <div className="p-2.5 border-t border-gray-800">
          <div className="flex items-center space-x-2">
            <div className="w-7 h-7 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center">
              <span className="text-xs text-white">
                {address.substring(0, 2)}
              </span>
            </div>
            <div className="text-gray-400 text-sm truncate">
              {address.substring(0, 6)}...
              {address.substring(address.length - 4)}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Sidebar;
