import {IActionPayload} from "../interfaces/IActionPayload";
import {ModalType} from "../enums/ModalType";
import BigNumber from "bignumber.js";
import {
    FAILURE_CLAIM_ICX,
    PRE_CLAIM_ICX,
    SUCCESS_CLAIM_ICX,

} from "../../common/messages";

export class ClaimIcxPayload implements IActionPayload {

    modalType = ModalType.CLAIM_ICX;

    // amount of ICX being staked
    claimableAmount: BigNumber;
    userIcxBalance: BigNumber;
    afterClaimIcxAmount: BigNumber;

    constructor(claimableAmount: BigNumber, userIcxBalance: BigNumber) {
        this.claimableAmount = claimableAmount;
        this.afterClaimIcxAmount = claimableAmount.plus(userIcxBalance);
        this.userIcxBalance = userIcxBalance;
    }

    sendTxMessage(): string {
        return PRE_CLAIM_ICX;
    }

    successMessage(): string {
        return SUCCESS_CLAIM_ICX(this.claimableAmount);
    }

    errorMessage(): string {
        return FAILURE_CLAIM_ICX();
    }
}
