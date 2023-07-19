import {StakeIcxPayload} from "../classes/StakeIcxPayload";
import {UnstakeWaitSicxPayload} from "../classes/UnstakeWaitSicxPayload";
import {UnstakeInstantSicxPayload} from "../classes/UnstakeInstantSicxPayload";
import {ClaimIcxPayload} from "../classes/ClaimIcxPayload";
import {WithdrawLockedOmmPayload} from "../classes/WithdrawLockedOmmPayload";
import {OmmLockingPayload} from "../classes/OmmLockingPayload";

// TODO add all payloads under this type
export type ModalPayload = StakeIcxPayload | UnstakeWaitSicxPayload | UnstakeInstantSicxPayload | ClaimIcxPayload | WithdrawLockedOmmPayload | OmmLockingPayload;
export type Address = string;
export type TokenSymbol = string;
