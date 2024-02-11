import { IProposalScoreDetails } from "./IProposalScoreDetails";

export interface IProposalScoreDetailsChange {
  proposalId: string;
  proposalScoreDetails: IProposalScoreDetails[];
}
