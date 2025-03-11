"use client";

import React from "react";
import Sidebar from "./components/Sidebar";
import MainContent from "./components/MainContent";

export default function Home() {
  return (
    <div className="flex h-full w-full overflow-hidden relative">
      <Sidebar />
      <MainContent />
    </div>
  );
}
