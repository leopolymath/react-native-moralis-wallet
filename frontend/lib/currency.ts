import BigNumber from "bignumber.js";

export function toBigNumber(
  amount: string | number,
  decimals: string | number
): BigNumber {
  const bigNumber = new BigNumber(Number(amount));

  return bigNumber.shiftedBy(-Number(decimals));
}
