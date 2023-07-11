import {StakeIcxPayload} from "../classes/StakeIcxPayload";
import {UnstakeWaitSicxPayload} from "../classes/UnstakeWaitSicxPayload";
import {UnstakeInstantSicxPayload} from "../classes/UnstakeInstantSicxPayload";
import {ClaimIcxPayload} from "../classes/ClaimIcxPayload";

// TODO add all payloads under this type
export type ModalPayload = StakeIcxPayload | UnstakeWaitSicxPayload | UnstakeInstantSicxPayload | ClaimIcxPayload;
export type Address = string;
export type TokenSymbol = string;
