import { Dispatch, SetStateAction, useState } from "react";
import { RiArrowDropDownLine } from "react-icons/ri";
import TokenModel from "./TokenModel";

interface TokenData {
  logo?: string;
  name?: string;
  symbol?: string;
  [key: string]: any;
}

const SectionInput = ({
  title,
  selectedLiquidity,
  placeholder,
  inputRef,
  setInputValue,
  inputValue,
}: {
  title: "To" | "From" | null;
  selectedLiquidity: TokenData | null;
  placeholder: string;
  inputRef: string;
  setInputValue: Dispatch<SetStateAction<number>>;
  inputValue: number | string;
}) => {
  const [isModelOpen, setIsModelOpen] = useState<boolean>(false);

  return (
    <>
      {isModelOpen && <TokenModel setIsOpen={setIsModelOpen} title={title!} />}
      <div className="relative w-full flex flex-col space-y-2">
        <div className="flex justify-between items-center mb-1">
          <p className="text-sm font-medium text-gray-300">{title}</p>
          {inputValue && Number(inputValue) > 0 && (
            <button
              className="text-xs text-pink-400 hover:text-pink-300 font-medium"
              onClick={() => setInputValue(0)}
            >
              Clear
            </button>
          )}
        </div>
        <div className="relative flex flex-row w-full h-[70px] bg-[#242830] border border-[#39393A] hover:border-pink-500 focus-within:border-pink-500 rounded-lg p-4 transition-all">
          <div className="relative w-[50%] h-full flex items-center justify-center">
            <input
              key={inputRef}
              value={inputValue || ""}
              className="bg-transparent text-white w-full text-lg font-medium !outline-none placeholder:text-gray-500 [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
              placeholder={placeholder}
              type="number"
              onChange={(e) => setInputValue(Number(e.target?.value))}
            />
          </div>
          <div className="flex flex-col h-full overflow-y-visible space-y-1 relative w-[50%]">
            <button
              className="h-full border border-[#39393A] bg-[#1A1D21] hover:bg-[#2A2D31] rounded-lg p-2 flex flex-row items-center justify-between transition-all"
              onClick={() => setIsModelOpen(!isModelOpen)}
            >
              <div className="flex items-center">
                <div
                  className={`rounded-full size-8 flex items-center justify-center ${
                    !selectedLiquidity ? "bg-gray-700" : ""
                  }`}
                >
                  {selectedLiquidity && (
                    <img
                      src={selectedLiquidity.logo}
                      className="relative size-6 object-contain"
                      alt={selectedLiquidity.name || "Token logo"}
                    />
                  )}
                </div>
                <p className="relative text-sm font-medium text-white ml-2 text-nowrap text-ellipsis overflow-x-hidden max-w-[80%]">
                  {!selectedLiquidity
                    ? "Select Token"
                    : selectedLiquidity.symbol || selectedLiquidity.name}
                </p>
              </div>
              <RiArrowDropDownLine className="text-gray-400 size-6" />
            </button>
          </div>
        </div>
        {selectedLiquidity && (
          <p className="text-xs text-gray-400">{selectedLiquidity.name}</p>
        )}
      </div>
    </>
  );
};

export default SectionInput;
