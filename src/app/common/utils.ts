import BigNumber from "bignumber.js";
import {DEFAULT_ROUNDING_PRECISION, ICON_BLOCK_INTERVAL} from "./constants";
import {environment} from "../../environments/environment";
import {UserUnstakeData} from "../models/classes/UserUnstakeInfo";
import IconService from "icon-sdk-js";

export function numToUsLocaleString(num: BigNumber | string): string {
    const dp = new BigNumber(num).dp() ?? 0;
    if (typeof num === "string") {
        return (+num).toLocaleString('en-US', {
            minimumFractionDigits: dp < DEFAULT_ROUNDING_PRECISION ? dp : DEFAULT_ROUNDING_PRECISION,
            maximumFractionDigits: DEFAULT_ROUNDING_PRECISION
        });
    } else {
        return num.toNumber().toLocaleString('en-US', {
            minimumFractionDigits: dp < DEFAULT_ROUNDING_PRECISION ? dp : DEFAULT_ROUNDING_PRECISION,
            maximumFractionDigits: DEFAULT_ROUNDING_PRECISION
        });
    }
}

export function toDollarUSLocaleString(num?: BigNumber | string, defaultZero = false): string {
    if (!num || !(new BigNumber(num).isFinite()) || (+num) <= 0) { return defaultZero ? "0" : "-"; }
    return `$${numToUsLocaleString(num)}`;
}

export function timestampInMillisecondsToPrettyDate(timestamp: BigNumber): string {
    const date = new Date(timestamp.toNumber());
    return date.toLocaleDateString('en-GB', {
        day: 'numeric', month: 'short', year: 'numeric'
    });
}

export function isBrowserTabActive(): boolean {
    return !document.hidden
}

export function addSecondsToTimestamp(timestamp: BigNumber, seconds: number): BigNumber {
    const microSecond = new BigNumber("1000000");
    return timestamp.plus(microSecond.multipliedBy(seconds));
}

export function normalisedAmountToBaseAmountString(amount: BigNumber, decimals = 18): string {
    return amount.multipliedBy(new BigNumber("10").pow(decimals)).toFixed();
}

export function roundDownTo2Decimals(value: BigNumber | number | string | undefined): string {
    if (!value || !(new BigNumber(value).isFinite())) {
        return "0";
    } else if (value instanceof BigNumber) {
        return value.toFixed(2, BigNumber.ROUND_DOWN);
    } else {
        return new BigNumber(value).toFixed(2, BigNumber.ROUND_DOWN);
    }
}

export function isAddress(address: string): boolean {
    if (!address) { return false; }
    return IconService.IconValidator.isAddress(address);
}

export function textContainsDomain(domain: string, text: string): boolean {
    const regExp = new RegExp('^(?:https?:\\/\\/)?(?:[^@\\/\\n]+@)?(?:www\\.)?([^:\\/?\\n]+)');
    const res = regExp.exec(text);
    return res ? res[0].includes(domain) : false;
}

export function isPositiveNumeric(value: string) {
    return /^\d+$/.test(value);
}

export function extractTxFailureMessage(tx: any): string {
    return tx?.failure?.message ?? "";
}

export function isHex(value: any): boolean {
    if (isString(value)) {
        return /^(0x)[0-9a-f]+$/g.test(value);
    }

    return false;
}

export function isString(value: any): boolean {
    return (typeof value === 'string' || value instanceof String);
}

export function hexToBigNumber(value: string | BigNumber): BigNumber {
    if (!value || !(new BigNumber(value).isFinite())) {
        return new BigNumber("0");
    } else if (typeof value === "string") {
        return new BigNumber(value, 16);
    } else {
        return new BigNumber(value);
    }
}

export function dateToDateOnlyIsoString(date: Date): string {
    return date.toISOString().split("T")[0];
}

export function timestampNowMicroseconds(): BigNumber {
    return new BigNumber(Date.now()).multipliedBy(new BigNumber("1000"));
}

export function timestampNowMilliseconds(): BigNumber {
    return new BigNumber(Date.now());
}

// Returns number divided by the 10^decimals
export function hexToNormalisedNumber(value: BigNumber | string, decimals: number | BigNumber = 18): BigNumber {
    if (!value || !(new BigNumber(value).isFinite())) {
        return new BigNumber("0");
    } else if (typeof value === "string") {
        return new BigNumber(value, 16).dividedBy(new BigNumber("10").pow(decimals));
    } else {
        return value.dividedBy(new BigNumber("10").pow(decimals));
    }
}

export function toNDecimalRoundedDownPercentString(num?: BigNumber | string | number, decimals = 0, defaultZero = false): string {
    if (!num || !(new BigNumber(num).isFinite()) || (+num) <= 0) { return defaultZero ? "0%" : "-"; }

    // convert in to percentage
    num = new BigNumber(num).multipliedBy(new BigNumber("100"));

    if (num.isLessThan(1)) {
        return defaultZero ? "0%" : "-";
    }

    return `${(numToUsLocaleString(num.toFixed(decimals, BigNumber.ROUND_DOWN)))}%`;
}

export function hexToBoolean(value: any): boolean {
    if (typeof value === "string") {
        return value !== "0x0";
    } else if (value instanceof BigNumber) {
        return value.isEqualTo(1);
    } else {
        return value;
    }
}

export function formatIconAddressToShort(address: string, n = 7): string {
    const length = address.length;
    return address.substring(0, n) + "..." + address.substring(length - n, length);
}

export function uriDecodeIfEncodedUri(uri: string): string {
    uri = uri || '';

    let isStringUriEncoded;
    try {
        isStringUriEncoded =  uri !== decodeURIComponent(uri);
    } catch {
        isStringUriEncoded = false;
    }

    if (isStringUriEncoded) {
        return decodeURIComponent(uri);
    } else {
        return uri;
    }
}

export function subtract(val1: BigNumber, val2: BigNumber): BigNumber {
    return val1.minus(val2);
}

export function add(val1: BigNumber, val2: BigNumber): BigNumber {
    return val1.plus(val2);
}

export function divide(val1: BigNumber, val2: BigNumber): BigNumber {
    return val1.dividedBy(val2);
}

export function multiply(val1: BigNumber, val2: BigNumber): BigNumber {
    return val1.multipliedBy(val2);
}

export function convertICXTosICX(value: BigNumber, todayRate: BigNumber): BigNumber {
    if (value.isZero() || todayRate.isZero()) return new BigNumber(0);

    return value.dividedBy(todayRate);
}

export function convertICXToSICXPrice(icxPrice: BigNumber, sICXRate: BigNumber): BigNumber {
    if (icxPrice.isZero() || sICXRate.isZero()) return new BigNumber(0);

    return icxPrice.multipliedBy(sICXRate);
}

export function convertSICXToICX(sICXvalue: BigNumber, sIcxToIcxRate: BigNumber): BigNumber {
    if (sICXvalue.isZero() || sIcxToIcxRate.isZero()) return new BigNumber(0);

    return sICXvalue.multipliedBy(sIcxToIcxRate);
}

export function constructTxHashLink(txhash: string): string {
    return `${environment.trackerUrl}/transaction/${txhash}`;
}

export function getPrettyTimeForBlockHeightDiff(currentBlockHeight: BigNumber, targetBlockHeight: BigNumber): string | undefined {
    const secondsUntilTargetBlock = (targetBlockHeight.minus(currentBlockHeight)).multipliedBy(ICON_BLOCK_INTERVAL);

    if (secondsUntilTargetBlock.isNegative()) return undefined;

    return convertSecondsToDHM(secondsUntilTargetBlock.toNumber());
}

export function getPrettyUntilBlockHeightTime(userUnstakeInfo: UserUnstakeData | undefined, currentBlockHeight?: BigNumber): string | undefined {
    if (userUnstakeInfo && currentBlockHeight) {
        return getPrettyTimeForBlockHeightDiff(currentBlockHeight, userUnstakeInfo.blockHeight);
    } else {
        return undefined;
    }
}

export function convertSecondsToDHM(seconds: number): string {
    let res = "";

    const days = Math.floor(seconds / (24 * 60 * 60));
    seconds -= days * 24 * 60 * 60;

    if (days > 0) res += `${days}d`;

    const hours = Math.floor(seconds / (60 * 60));
    seconds -= hours * 60 * 60;

    if (hours > 0) res += ` ${hours}h`;

    const minutes = Math.floor(seconds / 60);
    seconds -= minutes * 60;

    if (hours > 0) res += ` ${minutes}m`;

    return res;
}

export function convertSecondsToDays(seconds: number, roundUp = false): number {
    if (roundUp) {
        return Math.ceil(seconds / (24 * 60 * 60));
    } else {
        return Math.floor(seconds / (24 * 60 * 60));
    }
}





