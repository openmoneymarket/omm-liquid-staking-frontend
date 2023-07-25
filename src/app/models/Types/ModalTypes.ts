import {StakeIcxPayload} from "../classes/StakeIcxPayload";
import {UnstakeWaitSicxPayload} from "../classes/UnstakeWaitSicxPayload";
import {UnstakeInstantSicxPayload} from "../classes/UnstakeInstantSicxPayload";
import {ClaimIcxPayload} from "../classes/ClaimIcxPayload";
import {WithdrawLockedOmmPayload} from "../classes/WithdrawLockedOmmPayload";
import {OmmLockingPayload} from "../classes/OmmLockingPayload";
import {GovernanceVotePayload} from "../classes/GovernanceVotePayload";
import {SubmitProposalPayload} from "../classes/SubmitProposalPayload";
import {ClaimRewardsPayload} from "../classes/ClaimRewardsPayload";
import {UpdateDelegationPayload} from "../classes/updateDelegationPayload";
import {RemoveDelegationsPayload} from "../classes/removeDelegationsPayload";

// TODO add all payloads under this type

export type Address = string;
export type PrepAddress = string;
export type HexString = string;
export type TokenSymbol = string;
export type ModalPayload = StakeIcxPayload
    | UnstakeWaitSicxPayload
    | UnstakeInstantSicxPayload
    | ClaimIcxPayload
    | WithdrawLockedOmmPayload
    | OmmLockingPayload
    | GovernanceVotePayload
    | SubmitProposalPayload
    | ClaimRewardsPayload
    | UpdateDelegationPayload
    | RemoveDelegationsPayload;
