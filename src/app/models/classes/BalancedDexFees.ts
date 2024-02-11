import BigNumber from "bignumber.js";

export class BalancedDexFees {
  icxBalnFee: BigNumber;
  icxConversionFee: BigNumber;
  icxTotal: BigNumber;
  poolBalnFee: BigNumber;
  poolLpFee: BigNumber;
  poolTotal: BigNumber;

  constructor(
    icxBalnFee: BigNumber,
    icxConversionFee: BigNumber,
    icxTotal: BigNumber,
    poolBalnFee: BigNumber,
    poolLpFee: BigNumber,
    poolTotal: BigNumber,
  ) {
    this.icxBalnFee = icxBalnFee;
    this.icxConversionFee = icxConversionFee;
    this.icxTotal = icxTotal;
    this.poolBalnFee = poolBalnFee;
    this.poolLpFee = poolLpFee;
    this.poolTotal = poolTotal;
  }
}
