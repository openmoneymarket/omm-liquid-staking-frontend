import BigNumber from "bignumber.js";
import {divide, timestampNowMilliseconds} from "./utils";
import {Times} from "../models/classes/Times";
import {LockDate} from "../models/enums/LockDate";
import {lockedDatesToMilliseconds} from "./constants";

export abstract class Calculations {
    public static calculateNewbOmmBalance(newLockedOmmAmount: BigNumber, selectedLockTime: BigNumber, currentUnlockTime: BigNumber): BigNumber {
        const now = timestampNowMilliseconds();

        let newUnlockTime;

        if (currentUnlockTime.isZero()) {
            // user has no locked OMM
            newUnlockTime = this.recalculateLockPeriodEnd(now.plus(selectedLockTime));
        } else {
            const difference = now.plus(selectedLockTime).minus(currentUnlockTime);
            newUnlockTime = this.recalculateLockPeriodEnd(currentUnlockTime.plus(difference));
        }

        const slope = this.calculatebOmmSlope(newLockedOmmAmount);

        return this.calculatebOmmValue(slope, newUnlockTime, now);
    }

    // (Given expiration timestamp in milliseconds // 1 week in milliseconds ) * 1 week in milliseconds
    public static recalculateLockPeriodEnd(lockPeriod: BigNumber): BigNumber {
        return lockPeriod.dividedBy(Times.WEEK_IN_MILLISECONDS).dp(0, BigNumber.ROUND_DOWN)
            .multipliedBy(Times.WEEK_IN_MILLISECONDS);
    }

    // slope = locked OMM / four years in milliseconds
    public static calculatebOmmSlope(lockedOmm: BigNumber): BigNumber {
        return lockedOmm.dividedBy(Times.FOUR_YEARS_IN_MILLISECONDS);
    }

    // bOMM value at any timestamp = slope * (unlockTime timestamp - current timestamp)
    public static calculatebOmmValue(slope: BigNumber, unlockTime: BigNumber, currentTimestamp: BigNumber): BigNumber {
        return slope.multipliedBy(unlockTime.minus(currentTimestamp));
    }

    public static getAvailableLockPeriods(currentLockPeriodEndInMilliseconds: BigNumber): LockDate[] | undefined {
        const lockDates = Object.values(LockDate);
        const lockPeriods = [];

        for (const lockDate of lockDates) {
            const lockDateInMilli = lockedDatesToMilliseconds.get(lockDate)!;
            const currentLockPeriod = currentLockPeriodEndInMilliseconds.minus(timestampNowMilliseconds());

            // if current lock period is smaller than lock date
            if (lockDateInMilli.gt(currentLockPeriod)) {
                lockPeriods.push(lockDate);
            }
        }

        return lockPeriods.length > 0 ? lockPeriods : undefined;
    }

    /** Formulae: Omm's Voting Power/Total bOMM balance * user’s bOMM balance */
    public static usersVotingPower(
        ommVotingPower: BigNumber,
        delegationbOmmWorkingTotalSupply: BigNumber,
        userDelegationWorkingbOmmBalance: BigNumber,
        userDynamicDelegationWorkingbOmmBalance: BigNumber
    ): BigNumber {
        console.log("usersVotingPower...");
        const userWorkingbOmmBalance = userDynamicDelegationWorkingbOmmBalance.gt(userDelegationWorkingbOmmBalance) ? userDynamicDelegationWorkingbOmmBalance : userDelegationWorkingbOmmBalance;
        const userbOmmDiff = userDynamicDelegationWorkingbOmmBalance.lte(userDelegationWorkingbOmmBalance) ? new BigNumber(0) : userDynamicDelegationWorkingbOmmBalance.minus(
            userDelegationWorkingbOmmBalance);
        const totalWorkingbOmmBalance = delegationbOmmWorkingTotalSupply.plus(userbOmmDiff);

        return (ommVotingPower.dividedBy(totalWorkingbOmmBalance).multipliedBy(userWorkingbOmmBalance)).dp(2);
    }

    /** Formulae: Omm's Voting Power/Total staked OMM tokens */
    public static votingPower(
        ommVotingPower: BigNumber,
        userDelegationWorkingbOmmBalance: BigNumber,
        delegationbOmmWorkingTotalSupply: BigNumber,
        userNewWorkingbOmmBalance: BigNumber = new BigNumber(0)
    ): BigNumber {
        const userbOmmDiff = userNewWorkingbOmmBalance.isZero() ? new BigNumber(0) : userNewWorkingbOmmBalance.minus(
            userDelegationWorkingbOmmBalance);
        const totalWorkingbOmmBalance = delegationbOmmWorkingTotalSupply.plus(userbOmmDiff);

        if (ommVotingPower.isZero() || totalWorkingbOmmBalance.isZero()) {
            return new BigNumber("0");
        }

        return divide(ommVotingPower, totalWorkingbOmmBalance).dp(2);
    }

    /** totalLiquidity of sICX * (sICX/ICX ratio) */
    public static ommVotingPower(totalLiquiditySicx: BigNumber, sIcxIcxRatio: BigNumber): BigNumber {
        return ((totalLiquiditySicx).multipliedBy(sIcxIcxRatio)).dp(2);
    }

}
