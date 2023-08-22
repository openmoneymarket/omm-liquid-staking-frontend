import {IActionPayload} from "../interfaces/IActionPayload";
import {ModalType} from "../enums/ModalType";
import BigNumber from "bignumber.js";
import {
    FAILURE_CLAIM_REWARDS,
    PRE_CLAIM_REWARDS,
    SUCCESS_CLAIM_REWARDS,

} from "../../common/messages";

export class ClaimRewardsPayload implements IActionPayload {

    modalType = ModalType.CLAIM_REWARDS;

    // amount of ICX being staked
    claimableAmount: BigNumber;

    afterClaimIcxAmount: BigNumber;

    userIcxBalance: BigNumber

    constructor(claimableAmount: BigNumber, userIcxBalance: BigNumber) {
        this.claimableAmount = claimableAmount;
        this.afterClaimIcxAmount = claimableAmount.plus(userIcxBalance);
        this.userIcxBalance = userIcxBalance;
    }

    sendTxMessage(): string {
        return PRE_CLAIM_REWARDS;
    }

    successMessage(): string {
        return SUCCESS_CLAIM_REWARDS(this.claimableAmount);
    }

    errorMessage(): string {
        return FAILURE_CLAIM_REWARDS;
    }
}
