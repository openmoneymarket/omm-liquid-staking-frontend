import {IActionPayload} from "../interfaces/IActionPayload";
import {ModalType} from "../enums/ModalType";
import {
    FAILURE_UPDATE_VOTES,
    PRE_UPDATE_VOTES,
    SUCCESS_UPDATE_VOTES,

} from "../../common/messages";
import {YourPrepVote} from "./YourPrepVote";

export class UpdateDelegationPayload implements IActionPayload {

    modalType = ModalType.UPDATE_DELEGATIONS;

    userDelegations: YourPrepVote[];
    isBommDelegation: boolean

    constructor(userDelegations: YourPrepVote[], isBommDelegation: boolean) {
        this.userDelegations = userDelegations;
        this.isBommDelegation = isBommDelegation;
    }

    sendTxMessage(): string {
        return PRE_UPDATE_VOTES;
    }

    successMessage(): string {
        return SUCCESS_UPDATE_VOTES;
    }

    errorMessage(): string {
        return FAILURE_UPDATE_VOTES;
    }
}
