import {ModalType} from "../enums/ModalType";
import {ModalPayload} from "../Types/ModalTypes";

export interface IModalChange {
    modalType: ModalType;
    payload: ModalPayload | undefined
}
