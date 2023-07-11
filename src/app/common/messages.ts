/**
 * LEGEND:
 * '/n' means new line, similar as <br> tag
 * ${variable} is used to interpolate variable inside string (e.g. ${assetTag} is replaced with e.g. OMM)
 */
import BigNumber from "bignumber.js";
import {numToUsLocaleString, roundDownTo2Decimals, timestampInMillisecondsToPrettyDate} from "./utils";
import {AssetAction} from "../models/classes/AssetAction";
import {LockingAction} from "../models/classes/LockingAction";
import {StakingAction} from "../models/classes/StakingAction";
import {ManageStakedIcxAction} from "../models/classes/ManageStakedIcxAction";

// Copy related messages
export const UNABLE_TO_COPY = "Couldn't copy address.";
export const SUCCESS_COPY = "Address copied.";

// Iconex related messages
export const ICONEX_WALLET_DOES_NOT_EXIST = "Wallet does not exist. Sign in to ICONex and try again.";

// Loading core user data related messages
export const FAILED_LOADING_USER_DATA = "Couldn't load your data. Try again in a moment.";

// Ledger related messages
export const LEDGER_NOT_SUPPORTED = "Couldn't connect to your Ledger device. WebUSB transport is not supported.";
export const LEDGER_WAIT_ADDRESS = "Waiting for you to confirm the address on your Ledger device... (60 seconds timeout)";
export const LEDGER_ERROR = "Couldn't detect your Ledger device. Make sure it's connected and try again.";
export const LEDGER_PLEASE_CONFIRM = "Confirm the transaction on your Ledger device.";
export const LEDGER_UNABLE_TO_SIGN_TX = "Couldn't sign the transaction with your Ledger device. Make sure it's connected and try again.";
export const LEDGER_NOT_DETECTED = "Couldn’t detect a Ledger device.\n Make sure it’s connected and try again.";

/*
 *  NOTIFICATIONS SHOWN WHEN TRANSACTION IS SUBMITTED TO THE BLOCKCHAIN
 */

export const PRE_STAKE_ICX = (amount: BigNumber) => `Staking ${numToUsLocaleString(amount.dp(2))} ICX...`;
export const PRE_UNSTAKE_SICX = (amount: BigNumber) => `Unstaking ${numToUsLocaleString(amount.dp(2))} sICX...`;
export const PRE_UNSTAKE_OMM = "Starting the unstaking process...";
export const PRE_MIGRATE_STAKED_OMM = "Locking up staked OMM...";
export const PRE_INCREASE_LOCKED_OMM = "Locking up OMM...";
export const PRE_INCREASE_LOCKED_PERIOD = "Locking up OMM...";
export const PRE_INCREASE_LOCK_AMOUNT_AND_PERIOD = "Locking up OMM...";
export const PRE_LOCK_OMM = "Locking up OMM...";
export const PRE_WITHDRAW_LOCKED_OMM = "Withdrawing OMM...";
export const PRE_CLAIM_AND_APPLY_BOOST = "Claiming OMM...\nApplying boost...";
export const PRE_CLAIM_OMM = "Claiming rewards...";
export const PRE_APPLY_BOOST = "Applying boost...";
export const PRE_SUBMIT_PROPOSAL = "Submitting proposal...";
export const PRE_CLAIM_ICX = "Claiming ICX...";
export const PRE_UPDATE_VOTES = "Allocating votes...";
export const PRE_REMOVE_ALL_VOTES = "Removing all votes...";
export const PRE_CAST_VOTE = "Casting vote...";
export const PRE_STAKE_LP = "Staking LP tokens...";
export const PRE_UNSTAKE_LP = "Unstaking LP tokens...";

/*
 *  NOTIFICATIONS SHOWN AFTER TRANSACTION SUCCESS
 */

export const SUCCESS_STAKE_ICX = (amount: BigNumber) => `Successfully staked ${numToUsLocaleString(amount.dp(2))} ICX.`
export const SUCCESS_UNSTAKE_SICX = (stakeIcxAmount: BigNumber) => `Successfully unstaked ${numToUsLocaleString(stakeIcxAmount.dp(2))} sICX.`


export const SUCCESS_CLAIM_ICX = (amount: BigNumber) => `${numToUsLocaleString(amount.dp(2))} ICX claimed.`;
export const SUCCESS_CLAIM_OMM = (amount: BigNumber) => `${numToUsLocaleString(amount.dp(2))} OMM claimed.`;
export const SUCCESS_WITHDRAW_LOCKED_OMM = (amount: BigNumber) => `Withdrew ${numToUsLocaleString(amount.dp(2))} OMM.`;

export const SUCCESS_UPDATE_VOTES = "Votes allocated.";
export const SUCCESS_REMOVE_VOTES = "Votes removed.";
export const SUCCESS_SUBMIT_PROPOSAL = "Proposal submitted.";
export const SUCCESS_CAST_VOTE = "Vote cast.";
export const SUCCESS_LOCK_OMM = (lockingAction: LockingAction) => `${lockingAction.amount} OMM locked until ${timestampInMillisecondsToPrettyDate(lockingAction.lockingTime)}.`;
export const SUCCESS_INCREASE_LOCK_TIME = (lockingAction: LockingAction) => `OMM locked until ${timestampInMillisecondsToPrettyDate(lockingAction.lockingTime)}.`;
export const SUCCESS_INCREASE_LOCKED_OMM = (lockingAction: LockingAction) => `${lockingAction.amount} OMM locked until ${timestampInMillisecondsToPrettyDate(lockingAction.lockingTime)}.`;
export const SUCCESS_INCREASE_LOCK_TIME_AND_AMOUNT = (lockingAction: LockingAction) => `${lockingAction.amount} OMM locked until ${timestampInMillisecondsToPrettyDate(lockingAction.lockingTime)}.`;
export const SUCCESS_CLAIM_AND_APPLY_BOMM_BOOST = (ommClaimed: BigNumber | number) => `Claimed ${numToUsLocaleString(roundDownTo2Decimals(ommClaimed))} OMM. \nbOMM boost applied.`;
export const SUCCESS_APPLY_BOMM_BOOST = "bOMM boost applied.";
export const SUCCESS_UNSTAKE_OMM = (stakingAction: StakingAction | ManageStakedIcxAction) => `${stakingAction.amount} OMM unstaking.`;

/*
 *  NOTIFICATIONS SHOWN AFTER TRANSACTION FAILURE
 */

export const FAILURE_STAKE_ICX = "Couldn't stake ICX. Please try again in a moment."
export const FAILURE_UNSTAKE_SICX = "Couldn't unstake sICX. Please try again in a moment."

export const FAILURE_CLAIM_ICX = () => `Couldn't claim ICX. Please try again in a moment.`;
export const FAILURE_CLAIM_OMM = (failedTxMessage: string) => `Couldn't claim rewards. ${failedTxMessage}`;
export const FAILURE_WITHDRAW_LOCKED_OMM = (failedTxMessage: string) => `Couldn't withdraw locked OMM. ${failedTxMessage}`;
export const FAILURE_CLAIM_AND_APPLY_BOMM_BOOST = "Couldn't apply boost. Claim rewards to try again.";
export const FAILURE_APPLY_BOMM_BOOST = "Couldn't apply boost. Claim rewards to try again.";
export const FAILURE_UNSTAKE_OMM = (failedTxMessage: string) => `Couldn't unstake OMM. ${failedTxMessage}`;

export const FAILURE_UPDATE_VOTES = (failedTxMessage: string) => `Couldn't allocate votes. ${failedTxMessage}`;
export const FAILURE_REMOVE_ALL_VOTES = (failedTxMessage: string) => `Couldn't remove votes. ${failedTxMessage}`;
export const FAILURE_SUBMIT_PROPOSAL = (failedTxMessage: string) => `Couldn't submit proposal. ${failedTxMessage}`;
export const FAILURE_CAST_VOTE = (failedTxMessage: string) => `Couldn't cast vote. ${failedTxMessage}`;
export const FAILURE_LOCK_OMM = (failedTxMessage: string) => `Couldn't lock up OMM. ${failedTxMessage}`;
export const FAILURE_INCREASE_LOCK_TIME = (failedTxMessage: string) => `Couldn't increase the lock-up period. ${failedTxMessage}`;
export const FAILURE_INCREASE_LOCK_OMM = (failedTxMessage: string) => `Couldn't lock up OMM. ${failedTxMessage}`;
export const FAILURE_INCREASE_LOCK_TIME_AND_AMOUNT = (failedTxMessage: string) => `Couldn't lock up OMM or increase the lock-up period. ${failedTxMessage}`;
