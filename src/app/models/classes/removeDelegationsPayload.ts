import {IActionPayload} from "../interfaces/IActionPayload";
import {ModalType} from "../enums/ModalType";
import {
    FAILURE_REMOVE_ALL_VOTES,
    PRE_REMOVE_ALL_VOTES,
    SUCCESS_REMOVE_VOTES,
} from "../../common/messages";

export class RemoveDelegationsPayload implements IActionPayload {

    modalType = ModalType.REMOVE_ALL_DELEGATIONS;

    sendTxMessage(): string {
        return PRE_REMOVE_ALL_VOTES;
    }

    successMessage(): string {
        return SUCCESS_REMOVE_VOTES;
    }

    errorMessage(): string {
        return FAILURE_REMOVE_ALL_VOTES;
    }
}
