export const sleepTimer = async (milliseconds: number): Promise<unknown> =>
  await new Promise((resolve) => setTimeout(resolve, milliseconds));

export function addCommas(number: number): string {
  const parts = number.toString().split(".");
  const integerPart = parts[0];
  const decimalPart = parts[1] || "";

  const reversedInteger: string = integerPart.split("").reverse().join("");
  const commaInteger: string =
    reversedInteger.match(/\d{1,3}/g)?.join(",") || "";

  let result = commaInteger.split("").reverse().join("");
  if (decimalPart !== "") {
    result += "." + decimalPart;
  }

  // Return the final result
  return result;
}

export const ParseEthUtil = (
  amount: number | string,
  decimal: number
): number => {
  const response: number = Number(amount) * 10 ** decimal;
  return response;
};

export const ParseWeiUtil = (
  amount: number | string,
  decimal: number
): number => {
  const response: number = Number(amount) / 10 ** decimal;
  return response;
};

export function formatAddress(
  address?: string | null,
  noOfDigit: number = 4
): string | null {
  if (!address) return null;
  return `${address.slice(0, noOfDigit)}....${address.slice(-noOfDigit)}`;
}

export function numberWithCommas(input: number | string): string {
  // console.log("com", input);
  const firstHalf = input.toString().split(".")[0];
  const secondHalf = input.toString().split(".")[1];
  return [firstHalf.replace(/\B(?=(\d{3})+(?!\d))/g, ","), secondHalf].join("");
}

export function numberToMask(input: number | string): string {
  return input.toString().replace(/\d/g, "X");
}

export function addTrailZeros(
  input: number | string,
  desiredFrontLength: number,
  desiredBackLength: number
): string {
  if (!input) return "0.0";
  const firstHalf = input.toString().split(".")[0];
  const secondHalf = Number(input)
    ?.toFixed(desiredBackLength)
    .toString()
    .split(".")[1];
  return [
    firstHalf.toString().padStart(desiredFrontLength, "0"),
    secondHalf,
  ].join(".");
}
export function abbreviateNumber(
  value: number,
  abbreviateToFullString = false
) {
  const suffixes = abbreviateToFullString
    ? ["", " Thousand", " Million", " Billion", " Trillion"]
    : ["", "K", "M", "B", "T"];
  const order = Math.floor(Math.log10(value) / 3);

  if (order >= suffixes.length) {
    // If the number is too large, return the original value
    return value.toString();
  }

  const suffix = suffixes[order] || "";
  const shortValue = value / Math.pow(10, order * 3) || 0;

  // Format the number with 2 decimal places and add the suffix
  return `${shortValue.toFixed(2)}${suffix}` || 0;
}
