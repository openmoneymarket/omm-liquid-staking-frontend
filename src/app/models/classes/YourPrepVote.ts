import BigNumber from "bignumber.js";

export class YourPrepVote {
  address: string;
  name: string;
  percentage: BigNumber;

  constructor(address: string, name: string, percentage: BigNumber) {
    this.address = address;
    this.name = name;
    this.percentage = percentage;
  }

  public clone(): YourPrepVote {
    return new YourPrepVote(this.address, this.name, new BigNumber(this.percentage.toString()));
  }

  equal(other: YourPrepVote) {
    return this.address === other.address && this.name === other.name && this.percentage.eq(other.percentage);
  }
}
