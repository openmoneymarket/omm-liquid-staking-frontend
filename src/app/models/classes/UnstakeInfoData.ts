import BigNumber from "bignumber.js";
import {Address} from "../Types/ModalTypes";

export class UnstakeInfoData {
    orderNumber: number;
    amount: BigNumber;
    blockHeight: BigNumber;
    from: Address;
    sender: Address;

    constructor(orderNumber: number, amount: BigNumber, blockHeight: BigNumber, from: Address, sender: Address) {
        this.orderNumber = orderNumber;
        this.amount = amount;
        this.blockHeight = blockHeight;
        this.from = from;
        this.sender = sender;
    }
}
