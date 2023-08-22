export class LiquidStakingStatsData {
  totalUnstakingRequestSum: number;
  stakingApr: number;


  constructor(totalUnstakingRequestSum: number, stakingApr: number) {
    this.totalUnstakingRequestSum = totalUnstakingRequestSum;
    this.stakingApr = stakingApr;
  }
}
