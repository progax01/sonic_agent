import axios from "axios";
import { headers } from "next/headers";

export const baseURL = "https://b9e9-103-173-92-134.ngrok-free.app";

//To Get transaction history for a user////////
export const getTransactionStatus = async (hash: string | undefined) => {
  try {
    let res = await axios.get(`${baseURL}/bridge/transaction/${hash}`, {
      headers: {
        "Content-Type": "application/json",
        "ngrok-skip-browser-warning": "true",
      },
    });
    console.log("Response", res);

    return res;
  } catch (error: any) {
    console.log("Wallet Assets & Balance ERROR", error);
    return error;
  }
};

export const createPool = async (request: {
  poolAddress: string;
  chainId: string;
  walletAddress: string;
}) => {
  try {
    let res = await axios.post(`${baseURL}/api/pool/new`, request);
    return res;
  } catch (error: any) {
    console.log("Wallet Assets & Balance ERROR", error);
    return error;
  }
};
export const getPoolLists = async (page: any, items: any) => {
  try {
    let res = await axios.get(`${baseURL}/api/pool/pools`, {
      params: { page, items },
      headers: {
        "Content-Type": "application/json",
        "ngrok-skip-browser-warning": "true",
      },
    });
    console.log(res);
    return res;
  } catch (error: any) {
    console.log("Wallet Assets & Balance ERROR", error);
  }
};
export const addLedger = async (request: {
  walletAddress: string;
  poolAddress: string;
  withdrawl: number | undefined;
  addedLiquidity: number | undefined;
  chainId: string;
  swap: any | undefined;
}) => {
  try {
    let res = await axios.post(`${baseURL}/api/ledger/new`, request);
    return res;
  } catch (error: any) {
    console.log("Wallet Assets & Balance ERROR", error);
    return error;
  }
};
export const addToken = async (request: any) => {
  try {
    let res = await axios.post(`${baseURL}/api/token/new/token`, request);
    return res;
  } catch (error: any) {
    console.log("Wallet Assets & Balance ERROR", error);
    return error;
  }
};
