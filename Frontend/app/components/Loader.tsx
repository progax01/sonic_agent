import React from "react";

const Loader: React.FC = () => (
  <div className="size-[140px] items-center justify-center flex">
    <div className="loader ">
      <style jsx>{`
        .loader {
          border: 10px solid #686b6e; /* Light grey */
          border-top: 10px solid #297373; /* Blue */
          border-radius: 50%;
          width: 120px;
          height: 120px;
          animation: spin 2s linear infinite;
        }
        @keyframes spin {
          0% {
            transform: rotate(0deg);
          }
          100% {
            transform: rotate(360deg);
          }
        }
      `}</style>
    </div>
  </div>
);

export default Loader;
