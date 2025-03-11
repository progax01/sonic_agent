"use client";

import React, { useEffect, useRef, useState } from "react";
import { MetaMaskConnector } from "wagmi/connectors/metaMask";
import { sleepTimer } from "../utils/helper";
import Loader from "./Loader";
import Dex from "./Dex";
import { useLoginContext } from "@/contexts/LoginContext";
import BlockchainMarquee from "./HeroMarquee";

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

const Dashboard = () => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const { address, setAddress } = useLoginContext();
  const [loading, setLoading] = useState<boolean>(false);
  const connectMetamask = async () => {
    setLoading(true);
    try {
      const metamaskConnector = new MetaMaskConnector();
      const { account } = await metamaskConnector.connect({
        chainId: 12227332,
      });
      await sleepTimer(1000);
      console.log(account);
      setAddress(account);
      setLoading(false);

      const justProvider =
        ethereum?.providers?.find((e: EthereumProvider) => e?.isMetaMask) ||
        ethereum;
    } catch (error) {
      console.log(error);
    } finally {
    }
  };

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.playbackRate = 0.3; // Adjust the speed (0.5 for slow motion)
    }
  }, []);
  return (
    <>
      {!address ? (
        <div className="relative w-full  h-[100%] flex flex-row justify-center items-center text-lg font-semibold    text-white z-10">
          {/* <div className="relative bg-gradient-to-r from-purple-400 to-pink-600 flex w-[50%] h-full justify-start items-start">
            <div className="absolute size-full object-cover z-[-1]">
              <video
                ref={videoRef}
                id="backgroundVideo"
                autoPlay
                muted
                loop
                className="min-w-[100%] h-[100%] object-cover"
                onLoadedMetadata={(e: any) => (e.target.playbackRate = 0.5)}
              >
                <source
                  src="/backgroundVideo.mp4"
                  type="video/mp4"
                  className="min-w-[100%] h-[100%] object-cover"
                />
              </video>
            </div>
          </div> */}
          <div className="relative bg-gradient-to-r from-purple-400 to-pink-600 flex flex-col space-y-20 w-full h-full  justify-start items-center  px-8 pt-40  ">
            <div className="text-gray-300 text-5xl font-semibold">
              Sonic DEX
            </div>

            {!loading ? (
              <button
                className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white text-base font-normal w-[300px] h-[55px] flex flex-row space-x-3 justify-center items-center rounded-md"
                onClick={connectMetamask}
              >
                <img src="/Metamask.png" alt="Logo" className="size-8" />
                <p>Connect Metamask</p>
              </button>
            ) : (
              <>
                <Loader />
              </>
            )}
          </div>
          <div className="absolute w-full  bottom-0 h-[10%] flex  justify-center items-center text-lg font-semibold    text-white z-20">
            <BlockchainMarquee />
          </div>
        </div>
      ) : (
        <Dex />
      )}
    </>
  );
};
export default Dashboard;
