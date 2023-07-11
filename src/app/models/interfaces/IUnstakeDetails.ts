import {Address} from "../Types/ModalTypes";

export interface IUnstakeDetails {
    nodeId: string;
    unstakeAmount: string;
    key: Address;
    unstakeBlockHeight: string;
    receiverAddress: Address;
}
