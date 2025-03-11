import React from "react";

export default function BlockchainMarquee() {
  const blockchains = [
    "Sonic",
    "Strealer",
    "Arbitrum",
    "Base",
    "Sonic",
    "Stellar",
    "Arbitrum",
    "Base",
    "Sonic",
    "Stellar",
    "Arbitrum",
    "Base",
    "Sonic",
    "Strealler",
    "Arbitrum",
    "Base",
  ];

  return (
    <div className="overflow-hidden bg-blue-600 p-10 transform -rotate-3 -translate-y-36 w-full">
      <div className="flex animate-marquee whitespace-nowrap">
        {[...Array(2)].map((_, i) => (
          <React.Fragment key={i}>
            {blockchains.map((chain, index) => (
              <span
                key={index}
                className="text-white text-4xl opacity-85 font-bold mx-8 transform rotate-4"
              >
                {chain}
              </span>
            ))}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
}
