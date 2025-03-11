"use client";

import React, { useEffect } from "react";
import Header from "./Header";

import Swap from "./Swap";
import Liquidity from "./Liquidity";
import Bridge from "./Bridge";
import TokenLauncher from "./TokenLauncher";
import { useLoginContext } from "@/contexts/LoginContext";
import Chat from "./Chat";

const Dex = () => {
  const { selectedLink, setSelectedLink, route, setRoute } = useLoginContext();
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
  useEffect(() => {
    if (selectedLink == "home") {
      setRoute(null);
    }
  }, [selectedLink, setRoute]);
  return (
    <div className="relative w-full  h-full flex flex-col justify-center items-center text-lg font-semibold    text-white bg-gradient-to-r from-blue-900 to-purple-900">
      <Header />
      <div className="relative flex justify-center items-center w-full h-[calc(100vh-7vh)]">
        {route == null ? (
          selectedLink == "home" ? (
            <div className="relative flex flex-row space-x-4 ">
              {routes.map((item, index) => (
                <button
                  key={index}
                  className="flex flex-col items-center"
                  onClick={() => {
                    setRoute(item.route);
                    setSelectedLink(null);
                  }}
                >
                  <div className="relative">
                    <div className="w-40 h-40 rounded-full bg-gray-800 flex items-center justify-center">
                      {/* Dotted outer circle */}
                      <div className="absolute inset-0 rounded-full border-4 border-cyan-500 border-dashed animate-spin-slow"></div>
                      {/* Inner circle with gradient */}
                      <div className="w-32 h-32 rounded-full bg-gradient-to-r from-cyan-500 to-blue-500 flex items-center justify-center transform transition-all duration-500 hover:scale-110">
                        <div className="w-28 h-28 rounded-full bg-gray-900 flex items-center justify-center relative">
                          {/* Step number */}
                          <div className="absolute top-10 left-10 size-8 rounded-full  flex items-center justify-center">
                            <span className="text-sm text-white font-bold ">
                              {item.name}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  <p className="mt-4 text-lg font-medium text-white text-center"></p>
                </button>
              ))}
            </div>
          ) : (
            selectedLink == "chat" && <Chat />
          )
        ) : (
          Router[route as string]
        )}
      </div>
    </div>
  );
};

export default Dex;
