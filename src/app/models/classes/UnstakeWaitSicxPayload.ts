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

    avgUnstakingTimeInSeconds: BigNumber;
    maxUnstakingTimeInSeconds: BigNumber;

    constructor(unstakeSicxAmount: BigNumber, receiveIcxAmount: BigNumber, avgUnstakingTimeInSeconds: BigNumber, maxUnstakingTimeInSeconds: BigNumber) {
        this.unstakeSicxAmount = unstakeSicxAmount;
        this.receiveIcxAmount = receiveIcxAmount;
        this.avgUnstakingTimeInSeconds = avgUnstakingTimeInSeconds;
        this.maxUnstakingTimeInSeconds = maxUnstakingTimeInSeconds;
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
