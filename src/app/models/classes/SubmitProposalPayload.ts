import {IActionPayload} from "../interfaces/IActionPayload";
import {ModalType} from "../enums/ModalType";
import {FAILURE_SUBMIT_PROPOSAL, PRE_SUBMIT_PROPOSAL, SUCCESS_SUBMIT_PROPOSAL} from "../../common/messages";
import {CreateProposal} from "./Proposal";
import BigNumber from "bignumber.js";

export class SubmitProposalPayload implements IActionPayload {
    modalType = ModalType.SUBMIT_PROPOSAL;

    newProposal: CreateProposal;

    voteDuration: BigNumber;

    constructor(newProposal: CreateProposal, voteDuration: BigNumber) {
        this.newProposal = newProposal;
        this.voteDuration = voteDuration;
    }

    sendTxMessage(): string {
        return PRE_SUBMIT_PROPOSAL;
    }

    successMessage(): string {
        return SUCCESS_SUBMIT_PROPOSAL;
    }

    errorMessage(): string {
        return FAILURE_SUBMIT_PROPOSAL;
    }

}
