import BigNumber from "bignumber.js";
import {Address} from "../Types/ModalTypes";

export class UserUnstakeInfo {
    totalUnstakeAmount: BigNumber;
    lastUnstakeBlockHeight: BigNumber;
    data: UnstakeInfoData[];
    constructor(data: UnstakeInfoData[], totalAmount: BigNumber, lastUnstakeBlockHeight: BigNumber) {
        this.data = data;
        this.totalUnstakeAmount = totalAmount;
        this.lastUnstakeBlockHeight = lastUnstakeBlockHeight;
    }
}

export class UnstakeInfoData {
    amount: BigNumber;
    blockHeight: BigNumber;
    from: Address;
    sender: Address;


    constructor(amount: BigNumber, blockHeight: BigNumber, from: Address, sender: Address) {
        this.amount = amount;
        this.blockHeight = blockHeight;
        this.from = from;
        this.sender = sender;
    }
}
