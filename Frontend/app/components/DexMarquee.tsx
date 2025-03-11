import React from "react";

export default function DexMarquee() {
  const dexQuotes = [
    "Trade with confidence, anytime, anywhere",
    "Your gateway to decentralized finance",
    "Seamless swaps, limitless possibilities",
    "Empowering financial freedom through blockchain",
    "Trade directly, no intermediaries needed",
    "Secure, transparent, and efficient trading",
    "The future of finance is decentralized",
    "Your keys, your crypto, your control",
    "Connecting traders across the blockchain",
    "Swap, bridge, and launch with ease",
  ];

  return (
    <div className="w-full overflow-hidden bg-gray-900 py-3 border-t border-gray-800 z-10">
      <div className="flex animate-marquee whitespace-nowrap">
        {[...Array(2)].map((_, i) => (
          <React.Fragment key={i}>
            {dexQuotes.map((quote, index) => (
              <span
                key={index}
                className="text-gray-300 text-sm md:text-base font-medium mx-8"
              >
                <span className="text-gradient bg-gradient-to-r from-cyan-500 to-blue-500 inline-block mr-2">
                  •
                </span>{" "}
                {quote}
              </span>
            ))}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
}
