import BigNumber from "bignumber.js";
import { Address } from "../Types/ModalTypes";

export class UserUnstakeInfo {
  totalUnstakeAmount: BigNumber;
  lastUnstakeBlockHeight: BigNumber;
  data: UserUnstakeData[];
  constructor(data: UserUnstakeData[], totalAmount: BigNumber) {
    this.data = data;
    this.totalUnstakeAmount = totalAmount;
    this.lastUnstakeBlockHeight = data.reduce(
      (max, current) => (current.blockHeight.gt(max) ? current.blockHeight : max),
      new BigNumber(0),
    );
  }
}

export class UserUnstakeData {
  amount: BigNumber;
  blockHeight: BigNumber;
  from: Address;
  sender: Address;
  sicxBefore: BigNumber;

  constructor(
    amount: BigNumber,
    blockHeight: BigNumber,
    from: Address,
    sender: Address,
    sicxBefore = new BigNumber(0),
  ) {
    this.amount = amount;
    this.blockHeight = blockHeight;
    this.from = from;
    this.sender = sender;
    this.sicxBefore = sicxBefore;
  }

  setSicxBefore(value: BigNumber): void {
    this.sicxBefore = value;
  }
}
