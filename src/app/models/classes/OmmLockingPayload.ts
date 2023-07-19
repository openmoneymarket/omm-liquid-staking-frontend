import BigNumber from "bignumber.js";
import {IActionPayload} from "../interfaces/IActionPayload";
import {
  FAILURE_INCREASE_LOCK_OMM,
  FAILURE_INCREASE_LOCK_TIME,
  FAILURE_INCREASE_LOCK_TIME_AND_AMOUNT,
  FAILURE_LOCK_OMM,
  PRE_LOCK_OMM,
  SUCCESS_INCREASE_LOCK_TIME,
  SUCCESS_INCREASE_LOCK_TIME_AND_AMOUNT,
  SUCCESS_INCREASE_LOCKED_OMM,
  SUCCESS_LOCK_OMM
} from "../../common/messages";
import {ModalType} from "../enums/ModalType";

export class OmmLockingPayload implements IActionPayload {

  modalType: ModalType;
  before: number;
  after: number;
  amount: number;
  lockingTime: BigNumber; // in milliseconds

  constructor(before: number, after: number, amount: number, lockingTime: BigNumber, modalType: ModalType) {
    this.before = before;
    this.after = after;
    this.amount = amount;
    this.lockingTime = lockingTime;
    this.modalType = modalType;
  }

  sendTxMessage(): string {
    return PRE_LOCK_OMM;
  }

  successMessage(): string {
    switch (this.modalType) {
      case ModalType.LOCK_OMM:
        return SUCCESS_LOCK_OMM(this);
      case ModalType.INCREASE_LOCK_TIME:
        return SUCCESS_INCREASE_LOCK_TIME(this);
      case ModalType.INCREASE_LOCK_OMM:
        return SUCCESS_INCREASE_LOCKED_OMM(this);
      case ModalType.INCREASE_LOCK_TIME_AND_AMOUNT:
        return SUCCESS_INCREASE_LOCK_TIME_AND_AMOUNT(this);
      default:
        return SUCCESS_LOCK_OMM(this);
    }
  }

  errorMessage(): string {
    switch (this.modalType) {
      case ModalType.LOCK_OMM:
        return FAILURE_LOCK_OMM;
      case ModalType.INCREASE_LOCK_TIME:
        return FAILURE_INCREASE_LOCK_TIME;
      case ModalType.INCREASE_LOCK_OMM:
        return FAILURE_INCREASE_LOCK_OMM;
      case ModalType.INCREASE_LOCK_TIME_AND_AMOUNT:
        return FAILURE_INCREASE_LOCK_TIME_AND_AMOUNT;
      default:
        return FAILURE_LOCK_OMM;
    }
  }
}
