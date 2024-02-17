import { LiquidStakingStats } from "./LiquidStakingStats";

export class LiquidStakingStatsPersist {
  from: string;
  to: string;
  data: LiquidStakingStats[];

  constructor(from: string, to: string, data: LiquidStakingStats[]) {
    this.from = from;
    this.to = to;
    this.data = data;
  }
}
