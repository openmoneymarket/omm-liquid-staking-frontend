import BigNumber from "bignumber.js";

export class Vote {
  against: BigNumber;
  "for": BigNumber;

  constructor(against: BigNumber, forVote: BigNumber) {
    this.against = against;
    this.for = forVote;
  }

  public voteIsEmpty(): boolean {
    return !(this.against.isGreaterThan(0) || this.for.isGreaterThan(0));
  }
}

export class VotersCount {
  againstVoters: BigNumber;
  forVoters: BigNumber;

  constructor(againstVoters: BigNumber, forVoters: BigNumber) {
    this.againstVoters = againstVoters;
    this.forVoters = forVoters;
  }
}
