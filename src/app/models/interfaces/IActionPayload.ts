import { ModalType } from "../enums/ModalType";

export interface IActionPayload {
  modalType: ModalType;

  sendTxMessage(): string;
  successMessage(): string;
  errorMessage(): string;
}
