"use client";

import React from "react";
import { useLoginContext } from "@/contexts/LoginContext";
import Swap from "./Swap";
import Bridge from "./Bridge";
import TokenLauncher from "./TokenLauncher";
import Liquidity from "./Liquidity";
import Chat from "./Chat";
import Header from "./Header";
import DexMarquee from "./DexMarquee";

const MainContent = () => {
  const { selectedLink, setSelectedLink, route, setRoute, address } =
    useLoginContext();

  const routes = [
    { name: "Swap", route: "dex" },
    { name: "Bridge", route: "bridge" },
    { name: "Token Launcher", route: "token" },
    { name: "Liquidity", route: "liquidity" },
  ];

  const Router: { [key: string]: JSX.Element } = {
    dex: <Swap />,
    bridge: <Bridge />,
    token: <TokenLauncher />,
    liquidity: <Liquidity />,
  };

  // Home screen with route options
  const HomeScreen = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-5xl w-full mx-auto py-10">
      {routes.map((item, index) => (
        <button
          key={index}
          className="flex flex-col items-center bg-[#1a1a1a]/80 backdrop-blur-md border border-purple-500/20 rounded-xl p-6 transition-all hover:bg-[#1a1a1a] shadow-lg shadow-pink-500/10"
          onClick={() => {
            setRoute(item.route);
            setSelectedLink(null);
          }}
        >
          <div className="relative mb-4">
            <div className="w-24 h-24 rounded-full bg-[#1e1e1e] flex items-center justify-center">
              {/* Dotted outer circle */}
              <div className="absolute inset-0 rounded-full border-2 border-pink-500 border-dashed animate-spin-slow"></div>
              {/* Inner circle with gradient */}
              <div className="w-20 h-20 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center transform transition-all duration-500 hover:scale-110">
                <div className="w-16 h-16 rounded-full bg-[#1a1a1a] flex items-center justify-center relative">
                  {/* Feature name */}
                  <span className="text-pink-500 font-medium">
                    {item.name.charAt(0)}
                  </span>
                </div>
              </div>
            </div>
          </div>
          <h3 className="text-xl font-semibold text-white mb-2">{item.name}</h3>
          <p className="text-gray-300 text-center text-sm">
            {item.name === "Swap"
              ? "Swap tokens across different chains"
              : item.name === "Bridge"
              ? "Bridge assets between networks"
              : item.name === "Token Launcher"
              ? "Create and launch your own token"
              : "Add and manage liquidity pools"}
          </p>
        </button>
      ))}
    </div>
  );

  // Welcome screen when not connected
  const WelcomeScreen = () => (
    <div className="flex flex-col items-center justify-center h-full w-full p-6">
      <div className="max-w-2xl text-center">
        <h1 className="text-4xl font-bold mb-6 bg-gradient-to-r from-purple-500 to-pink-500 bg-clip-text text-transparent">
          Welcome to Sonic DEX
        </h1>
        <p className="text-gray-300 text-lg mb-8">
          Connect your wallet to access decentralized trading, bridging, and
          token creation tools.
        </p>
      </div>
    </div>
  );

  // Render content based on route or selectedLink
  const renderContent = () => {
    if (!address) {
      return <WelcomeScreen />;
    }

    if (route) {
      return <div className="w-full max-w-full">{Router[route]}</div>;
    }

    if (selectedLink === "home") {
      return <HomeScreen />;
    }

    if (selectedLink === "chat") {
      return (
        <div className="w-full max-w-full">
          <Chat />
        </div>
      );
    }

    return <HomeScreen />;
  };

  return (
    <div className="flex flex-col h-full flex-1 w-full relative">
      <Header />
      <div className="flex-1 overflow-auto bg-gradient-to-r from-gray-900 to-gray-800 w-full pb-12">
        <div className="w-full h-full">{renderContent()}</div>
      </div>
      <div className="absolute bottom-0 left-0 right-0">
        <DexMarquee />
      </div>
    </div>
  );
};

export default MainContent;
