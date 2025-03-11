import type { Metadata } from "next";
import "./globals.css";
import LoginProvider from "@/contexts/LoginContext";
import SwapProvider from "@/contexts/Swapcontext";

export const metadata: Metadata = {
  title: "EasyChainCoders",
  description: "One click solution for SonicDEX",
  icons: {
    icon: "/favicon.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full w-full">
      <LoginProvider>
        <SwapProvider>
          <body className="w-full h-full overflow-hidden bg-[#121212] text-white">
            {/* Main background with subtle gradient */}
            <div className="fixed inset-0 bg-gradient-to-br from-[#121212] via-[#1a1a1a] to-[#121212] z-[-2]"></div>

            {/* Subtle pattern overlay */}
            <div className="fixed inset-0 bg-[url('/assets/grid-pattern.svg')] bg-repeat opacity-5 z-[-1]"></div>

            {/* <Header /> */}
            {children}
          </body>
        </SwapProvider>
      </LoginProvider>
    </html>
  );
}
