import {StakeIcxPayload} from "../classes/StakeIcxPayload";
import {UnstakeWaitSicxPayload} from "../classes/UnstakeWaitSicxPayload";
import {UnstakeInstantSicxPayload} from "../classes/UnstakeInstantSicxPayload";
import {ClaimIcxPayload} from "../classes/ClaimIcxPayload";
import {WithdrawLockedOmmPayload} from "../classes/WithdrawLockedOmmPayload";
import {OmmLockingPayload} from "../classes/OmmLockingPayload";
import {GovernanceVotePayload} from "../classes/GovernanceVotePayload";
import {SubmitProposalPayload} from "../classes/SubmitProposalPayload";

// TODO add all payloads under this type
export type ModalPayload = StakeIcxPayload | UnstakeWaitSicxPayload | UnstakeInstantSicxPayload | ClaimIcxPayload |
    WithdrawLockedOmmPayload | OmmLockingPayload | GovernanceVotePayload | SubmitProposalPayload;
export type Address = string;
export type TokenSymbol = string;
