import BigNumber from "bignumber.js";

export class StakingAction{
  before: BigNumber;
  after: BigNumber;
  amount: BigNumber;

  constructor(before: BigNumber, after: BigNumber, amount: BigNumber) {
    this.before = before;
    this.after = after;
    this.amount = amount;
  }
}
