import {IActionPayload} from "../interfaces/IActionPayload";
import {ModalType} from "../enums/ModalType";
import BigNumber from "bignumber.js";
import {
    FAILURE_STAKE_ICX, FAILURE_WITHDRAW_LOCKED_OMM,
    PRE_STAKE_ICX,
    PRE_WITHDRAW_LOCKED_OMM,
    SUCCESS_STAKE_ICX,
    SUCCESS_WITHDRAW_LOCKED_OMM
} from "../../common/messages";

export class WithdrawLockedOmmPayload implements IActionPayload {

    modalType = ModalType.WITHDRAW_LOCKED_OMM;

    before: BigNumber;
    after: BigNumber;
    amount: BigNumber;

    constructor(before: BigNumber, after: BigNumber, amount: BigNumber) {
        this.before = before;
        this.after = after;
        this.amount = amount;
    }

    sendTxMessage(): string {
        return PRE_WITHDRAW_LOCKED_OMM;
    }

    successMessage(): string {
        return SUCCESS_WITHDRAW_LOCKED_OMM(this.amount);
    }

    errorMessage(): string {
        return FAILURE_WITHDRAW_LOCKED_OMM;
    }
}
