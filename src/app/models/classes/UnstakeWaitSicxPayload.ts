import {IActionPayload} from "../interfaces/IActionPayload";
import {ModalType} from "../enums/ModalType";
import BigNumber from "bignumber.js";
import {
    FAILURE_UNSTAKE_SICX,
    PRE_UNSTAKE_SICX,
    SUCCESS_UNSTAKE_SICX
} from "../../common/messages";

export class UnstakeWaitSicxPayload implements IActionPayload {

    modalType = ModalType.UNSTAKE_WAIT_SICX;

    // amount of ICX being staked
    unstakeSicxAmount: BigNumber;

    // amount of sICX being unstaked
    receiveIcxAmount: BigNumber;

    unstakingTimeInSeconds: BigNumber;

    constructor(unstakeSicxAmount: BigNumber, receiveIcxAmount: BigNumber, unstakingTimeInSeconds: BigNumber) {
        this.unstakeSicxAmount = unstakeSicxAmount;
        this.receiveIcxAmount = receiveIcxAmount;
        this.unstakingTimeInSeconds = unstakingTimeInSeconds;
    }

    sendTxMessage(): string {
        return PRE_UNSTAKE_SICX(this.unstakeSicxAmount);
    }

    successMessage(): string {
        return SUCCESS_UNSTAKE_SICX(this.unstakeSicxAmount);
    }

    errorMessage(): string {
        return FAILURE_UNSTAKE_SICX;
    }
}
