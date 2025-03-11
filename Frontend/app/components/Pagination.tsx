import { MdKeyboardArrowLeft, MdKeyboardArrowRight } from "react-icons/md";

function Pagination({
  currentPageNo,
  totalPages,
  setCurrentPageNo,
}: {
  currentPageNo: number;
  totalPages: number;
  setCurrentPageNo: (prop: number) => void;
}) {
  return (
    <div className="flex gap-1 items-center justify-center text-prime-gray-200">
      <button
        className="p-2 disabled:opacity-30"
        disabled={currentPageNo === 1}
        onClick={() => setCurrentPageNo(currentPageNo - 1)}
      >
        <MdKeyboardArrowLeft className="size-5" />
      </button>
      <span>
        Page {currentPageNo} of {totalPages}
      </span>
      <button
        className="p-2 disabled:opacity-30"
        disabled={currentPageNo === totalPages}
        onClick={() => setCurrentPageNo(currentPageNo + 1)}
      >
        <MdKeyboardArrowRight className="size-5" />
      </button>
    </div>
  );
}

export default Pagination;
