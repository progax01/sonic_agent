"use client";

import { useLoginContext } from "@/contexts/LoginContext";
import React from "react";

export default function Header() {
  const { address } = useLoginContext();

  return (
    <div className="flex justify-between items-center w-full h-[3.8rem] px-6 bg-gray-900 py-2  border-b border-gray-800">
      {/* <div className="text-gray-300 text-xl font-semibold">NEO DEX</div> */}

      {address && (
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center">
            <span className="text-xs text-white">
              {address.substring(0, 2)}
            </span>
          </div>
          <div className="text-gray-400 text-sm">
            {address.substring(0, 6)}...{address.substring(address.length - 4)}
          </div>
        </div>
      )}
    </div>
  );
}
