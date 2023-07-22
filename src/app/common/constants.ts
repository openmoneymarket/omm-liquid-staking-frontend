import {Times} from "../models/classes/Times";
import {LockDate} from "../models/enums/LockDate";
import BigNumber from "bignumber.js";
import {Irc2Token} from "../models/classes/Irc2Token";
import {environment} from "../../environments/environment";

// TOKENS

export const ICX = new Irc2Token(18, "ICX", "ICON");

export const OMM = new Irc2Token(18, "OMM", "Omm Tokens");
export const SICX = new Irc2Token(18, "sICX", "Staked ICX");

export const supportedTokens = [ICX, OMM, SICX];

export const DEFAULT_ROUNDING_PRECISION = 2;

export const MAX_PROPOSAL_DESCRIPTION_LENGTH = 500;

export const ICON_BLOCK_INTERVAL = 2; // 2 seconds

export const BLOCK_POOL_INTERVAL_TIME = 10_000 // 10 seconds in milliseconds
export const CURRENT_TIMESTAMP_INTERVAL = 10_000 // 10 seconds in milliseconds

export const BALANCED_DEX_FEE_PERCENTAGE_CONVERSION = 10000;

export const BALANCED_SICX_POOL_ID = 1;

export const SEVEN_DAYS_IN_BLOCK_HEIGHT = 302400;

export const defaultPrepLogoUrl = "assets/img/icon/profile.svg";

export const ommForumDomain = "forum.omm.finance";

export const ommBannerExitKey = "omm-bnr-closed5";

export const contributorsMap = new Map([
    ["hxfba37e91ccc13ec1dab115811f73e429cde44d48", true], // ICX_Station
    ["hx28c08b299995a88756af64374e13db2240bc3142", true], // PARROT9
    ["hx231a795d1c719b9edf35c46b9daa4e0b5a1e83aa", true], // iBriz - ICONOsphere
    ["hx2bbb1b0300f5dc0caa0e1a3ba1701a22e7590763", true] //  Protokol7
]);

export const prepsOfferingIncentiveMap = new Map([
    ["hxe872d22ad693279cd7ff33f51583f4117a4610b3", true], // CODE METAL
    ["hx437e3ce53016ffc71be609a4d1194e41a5d89678", true], // Fomomental
    ["hxca60d4371ad90d624dc7119f81009d799c168aa1", true], // Framd
    ["hx3c58970034d5a923aa95058365450feed28979a2", true], //  Gangstabet
    ["hx9121c5914ce34f59de52fe15efd6f7982c2ab8ae", true], //  IAM
    ["hxc5e0b88cb9092bbd8b004a517996139334752f62", true], //  Inanis Invictus
    ["hxaf33a0c15dbf52b76590422cbb7e2d835034cdf6", true], //  Plan-P
]);

// how much ICX should be left when user is supplying
export const ICX_SUPPLY_BUFFER = 2;

export const LOCKED_UNTIL_DATE_OPTIONS = [LockDate.WEEK, LockDate.MONTH, LockDate.MONTH_3, LockDate.MONTH_6, LockDate.YEAR, LockDate.TWO_YEARS,
    LockDate.FOUR_YEARS];

export const lockedDatesToMilliseconds = new Map([
    [LockDate.WEEK, Times.WEEK_IN_MILLISECONDS],
    [LockDate.MONTH, Times.MONTH_IN_MILLISECONDS],
    [LockDate.MONTH_3, Times.MONTH_IN_MILLISECONDS.multipliedBy(3)],
    [LockDate.MONTH_6, Times.MONTH_IN_MILLISECONDS.multipliedBy(6)],
    [LockDate.YEAR, Times.YEAR_IN_MILLISECONDS],
    [LockDate.TWO_YEARS, Times.TWO_YEARS_IN_MILLISECONDS],
    [LockDate.FOUR_YEARS, Times.FOUR_YEARS_IN_MILLISECONDS],
]);

export function lockedDateTobOmmPerOmm(lockDate: LockDate): BigNumber {
    switch (lockDate) {
        case LockDate.WEEK:
            return new BigNumber("0.0048");
        case LockDate.MONTH:
            return new BigNumber("0.0208333");
        case LockDate.MONTH_3:
            return new BigNumber("0.0625");
        case LockDate.MONTH_6:
            return new BigNumber("0.125");
        case LockDate.YEAR:
            return new BigNumber("0.25");
        case LockDate.TWO_YEARS:
            return new BigNumber("0.5");
        case LockDate.FOUR_YEARS:
            return new BigNumber("1");
    }
}

export function getLockDateFromMilliseconds(milliseconds: BigNumber): LockDate {
    if (milliseconds.lte(Times.WEEK_IN_MILLISECONDS)) { return LockDate.WEEK; }
    else if (milliseconds.lte(Times.MONTH_IN_MILLISECONDS)) { return LockDate.MONTH; }
    else if (milliseconds.lte(Times.MONTH_IN_MILLISECONDS.multipliedBy(3))) { return LockDate.MONTH_3; }
    else if (milliseconds.lte(Times.MONTH_IN_MILLISECONDS.multipliedBy(6))) { return LockDate.MONTH_6; }
    else if (milliseconds.lte(Times.YEAR_IN_MILLISECONDS)) { return LockDate.YEAR; }
    else if (milliseconds.lte(Times.TWO_YEARS_IN_MILLISECONDS)) { return LockDate.TWO_YEARS; }
    else { return LockDate.FOUR_YEARS; }
}

// 1 week = 0.0048 veOMM per 1 OMM staked
// 1 month = 0.0208333 veOMM per 1 OMM staked
// 3 months = 0.0625 veOMM per 1 OMM staked
// 6 months lockup = 0.125 veOMM per 1 OMM staked
// 1 year lockup = 0.25 veOMM per 1 OMM staked
// 2 year lockup = 0.5 veOMM per 1 OMM staked
// 4 year lockup = 1 veOMM per 1 OMM staked
