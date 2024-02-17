import { LiquidStakingStatsData } from "./LiquidStakingStatsData";

export class LiquidStakingStats {
  date: Date;
  data: LiquidStakingStatsData[];

  constructor(date: Date, data: LiquidStakingStatsData[]) {
    this.date = date;
    this.data = data;
  }
}
