import React from "react";
import { FiCheck, FiX, FiLoader } from "react-icons/fi";

export type TransactionStatusType = "confirming" | "success" | "failed" | null;

interface TransactionStatusProps {
  status: TransactionStatusType;
  message?: string;
}

const TransactionStatus: React.FC<TransactionStatusProps> = ({
  status,
  message,
}) => {
  if (!status) return null;

  const getStatusConfig = () => {
    switch (status) {
      case "confirming":
        return {
          bgColor: "bg-yellow-500/10",
          borderColor: "border-yellow-500/30",
          textColor: "text-yellow-500",
          icon: <FiLoader className="animate-spin" />,
          defaultMessage: "Transaction confirming...",
        };
      case "success":
        return {
          bgColor: "bg-green-500/10",
          borderColor: "border-green-500/30",
          textColor: "text-green-500",
          icon: <FiCheck />,
          defaultMessage: "Transaction successful!",
        };
      case "failed":
        return {
          bgColor: "bg-red-500/10",
          borderColor: "border-red-500/30",
          textColor: "text-red-500",
          icon: <FiX />,
          defaultMessage: "Transaction failed",
        };
      default:
        return {
          bgColor: "bg-gray-500/10",
          borderColor: "border-gray-500/30",
          textColor: "text-gray-500",
          icon: null,
          defaultMessage: "",
        };
    }
  };

  const { bgColor, borderColor, textColor, icon, defaultMessage } =
    getStatusConfig();
  const displayMessage = message || defaultMessage;

  return (
    <div
      className={`w-full px-4 py-3 ${bgColor} rounded-lg border ${borderColor} mb-4 transition-all duration-300 ease-in-out`}
    >
      <div className="flex items-center">
        <div className={`mr-2 ${textColor}`}>{icon}</div>
        <span className={`text-sm font-medium ${textColor}`}>
          {displayMessage}
        </span>
      </div>
    </div>
  );
};

export default TransactionStatus;
