import BigNumber from "bignumber.js";

export interface IUserVotingWeightForProposalChange {
    proposalId: string;
    votingWeight: BigNumber;
}
