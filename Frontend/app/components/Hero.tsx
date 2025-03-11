export default function Hero() {
  return (
    <div className="min-h-screen max-w-5xl bg-none flex flex-col items-center justify-center text-center px-4 sm:px-6 lg:px-8">
      <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-600 mb-6">
        The moon is made of Web3.0
      </h1>
      <p className="text-lg sm:text-xl md:text-2xl text-gray-300 max-w-2xl mx-auto mb-8">
        Trade, earn, and win on the most popular decentralized platform in the
        galaxy
      </p>
      <button className="text-lg px-8 py-4 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-semibold rounded-md transition-all duration-200 ease-in-out transform hover:scale-105">
        Connect Wallet
      </button>
    </div>
  );
}
