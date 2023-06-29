import {IActionPayload} from "../interfaces/IActionPayload";
import {ModalType} from "../enums/ModalType";
import BigNumber from "bignumber.js";
import {FAILURE_STAKE_ICX, PRE_STAKE_ICX, SUCCESS_STAKE_ICX} from "../../common/messages";

export class StakeIcxPayload implements IActionPayload {

    modalType = ModalType.STAKE_ICX;

    // amount of ICX being staked
    stakeIcxAmount: BigNumber;

    // amount of sICX being unstaked
    receiveSIcxAmount: BigNumber;

    constructor(stakeIcxAmount: BigNumber, receiveSIcxAmount: BigNumber) {
        this.stakeIcxAmount = stakeIcxAmount;
        this.receiveSIcxAmount = receiveSIcxAmount;
    }

    sendTxMessage(): string {
        return PRE_STAKE_ICX(this.stakeIcxAmount);
    }

    successMessage(): string {
        return SUCCESS_STAKE_ICX(this.stakeIcxAmount);
    }

    errorMessage(): string {
        return FAILURE_STAKE_ICX;
    }
}
