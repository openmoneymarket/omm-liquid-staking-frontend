import BigNumber from "bignumber.js";
import {IActionPayload} from "../interfaces/IActionPayload";
import {
  FAILURE_CAST_VOTE,
  PRE_CAST_VOTE,
  SUCCESS_CAST_VOTE,
} from "../../common/messages";
import {ModalType} from "../enums/ModalType";

export class GovernanceVotePayload implements IActionPayload {

  modalType = ModalType.CAST_VOTE;

  proposalId: string;
  approveProposal: boolean;
  userVotingWeight: BigNumber;

  constructor(approveProposal: boolean, proposalId: string, userVotingWeight: BigNumber) {
    this.approveProposal = approveProposal;
    this.proposalId = proposalId;
    this.userVotingWeight = userVotingWeight;
  }

  sendTxMessage(): string {
    return PRE_CAST_VOTE;
  }

  successMessage(): string {
    return SUCCESS_CAST_VOTE;
  }

  errorMessage(): string {
    return FAILURE_CAST_VOTE;
  }
}


