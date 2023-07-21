import BigNumber from "bignumber.js";
import {Vote} from "../classes/Vote";

export interface IUserProposalVoteChange {
    proposalId: string;
    vote: Vote;
}
