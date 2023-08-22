import log from "loglevel";
import {OmmTokenBalanceDetails} from "../models/classes/OmmTokenBalanceDetails";
import {Prep, PrepList} from "../models/classes/Preps";
import {YourPrepVote} from "../models/classes/YourPrepVote";
import {BigNumber} from "bignumber.js";
import {Vote, VotersCount} from "../models/classes/Vote";
import {Proposal} from "../models/classes/Proposal";
import {LockedOmm} from "../models/classes/LockedOmm";
import {ILockedOmm} from "../models/interfaces/ILockedOmm";
import {hexToNormalisedNumber, hexToBigNumber, multiply, uriDecodeIfEncodedUri} from "./utils";
import {DelegationPreference} from "../models/classes/DelegationPreference";
import {IScoreParameter, IScorePayloadParameter, scoreParamToPayloadParam} from "../models/interfaces/IScoreParameter";
import {IUserUnstakeInfo} from "../models/interfaces/IUserUnstakeInfo";
import {UserUnstakeData, UserUnstakeInfo} from "../models/classes/UserUnstakeInfo";
import {BALANCED_DEX_FEE_PERCENTAGE_CONVERSION, SICX} from "./constants";
import {IBalancedDexFees} from "../models/interfaces/IBalnDexFees";
import {BalancedDexFees} from "../models/classes/BalancedDexFees";
import {PoolStats, PoolStatsInterface} from "../models/classes/PoolStats";
import {Address, HexString, PrepAddress} from "../models/Types/ModalTypes";
import {UnstakeInfoData} from "../models/classes/UnstakeInfoData";
import {LiquidStakingStats} from "../models/classes/LiquidStakingStats";

export abstract class Mapper {

  public static mapLiquidStakingStats(liquidStakingStats: LiquidStakingStats[]): LiquidStakingStats[] {
    liquidStakingStats.forEach(el => {
      el.date = new Date(el.date);
    });

    return liquidStakingStats;
  }

  public static mapPrepDelegationsRecordToMap(actualPrepDelegations: Record<PrepAddress, HexString>): Map<PrepAddress, BigNumber> {
    const res = new Map<PrepAddress, BigNumber>();

    for (const prepAddress in actualPrepDelegations) {
      res.set(prepAddress, hexToNormalisedNumber(actualPrepDelegations[prepAddress]));
    }

    return res;
  }

  public static mapUnstakeInfo(value: Array<Array<HexString>>): Map<Address, UnstakeInfoData[]> {
    const res = new Map<Address, UnstakeInfoData[]>();


    let unstakeInfoData;
    let currUnstakeDataArray;

    value.forEach(unstakeinfo => {
      unstakeInfoData = new UnstakeInfoData(
          hexToBigNumber(unstakeinfo[0]).toNumber(),
          hexToNormalisedNumber(unstakeinfo[1]),
          hexToBigNumber(unstakeinfo[3]),
          unstakeinfo[2],
          unstakeinfo[4]
      );

      currUnstakeDataArray = res.get(unstakeInfoData.from);

      // if array already exists, push new value next to it
      if (currUnstakeDataArray) {
        res.set(unstakeInfoData.from, [unstakeInfoData, ...currUnstakeDataArray]);
      } else {
        res.set(unstakeInfoData.from, [unstakeInfoData]);
      }
    });

    return res;
  }

  public static mapUserSicxDelegationsRecordToMap(actualPrepDelegations: Record<PrepAddress, HexString>): Map<PrepAddress, BigNumber> {
    const res = new Map<PrepAddress, BigNumber>();

    for (const prepAddress in actualPrepDelegations) {
      res.set(prepAddress, hexToNormalisedNumber(actualPrepDelegations[prepAddress]).dividedBy(100));
    }

    return res;
  }

  public static mapPoolStats(poolStats: PoolStatsInterface): PoolStats {
    const baseDecimals = hexToBigNumber(poolStats.base_decimals);
    const quoteDecimals = hexToBigNumber(poolStats.quote_decimals);

    return new PoolStats(
        hexToNormalisedNumber(poolStats.base, baseDecimals),
        hexToNormalisedNumber(poolStats.quote, quoteDecimals),
        poolStats.base_token,
        poolStats.quote_token,
        hexToNormalisedNumber(poolStats.total_supply, PoolStats.getPoolPrecision(baseDecimals, quoteDecimals)),
        hexToNormalisedNumber(poolStats.price, quoteDecimals),
        poolStats.name,
        baseDecimals,
        quoteDecimals,
        hexToBigNumber(poolStats.min_quote)
    );
  }

  public static mapBalancedFees(value: IBalancedDexFees): BalancedDexFees {
    return new BalancedDexFees(
        hexToBigNumber(value.icx_baln_fee).dividedBy(BALANCED_DEX_FEE_PERCENTAGE_CONVERSION),
        hexToBigNumber(value.icx_conversion_fee).dividedBy(BALANCED_DEX_FEE_PERCENTAGE_CONVERSION),
        hexToBigNumber(value.icx_total).dividedBy(BALANCED_DEX_FEE_PERCENTAGE_CONVERSION),
        hexToBigNumber(value.pool_baln_fee).dividedBy(BALANCED_DEX_FEE_PERCENTAGE_CONVERSION),
        hexToBigNumber(value.pool_lp_fee).dividedBy(BALANCED_DEX_FEE_PERCENTAGE_CONVERSION),
        hexToBigNumber(value.pool_total).dividedBy(BALANCED_DEX_FEE_PERCENTAGE_CONVERSION),
    );
  }

  public static mapScoreParamsToPayloadArray(params: IScoreParameter[], values: string[]): IScorePayloadParameter[] {
    return params.map((param, index) => {
      return {
        type: scoreParamToPayloadParam(param.type),
        value: values[index]
      }
    });
  }

  public static mapLockedOmm(lockedOmm: ILockedOmm): LockedOmm {
    return new LockedOmm(
      hexToNormalisedNumber(lockedOmm.amount),
      hexToBigNumber(lockedOmm.end)
    );
  }

  public static mapUserOmmTokenBalanceDetails(ommTokenBalanceDetails: OmmTokenBalanceDetails): OmmTokenBalanceDetails {
    log.debug("mapUserOmmTokenBalanceDetails before: ", ommTokenBalanceDetails);
    const res = new OmmTokenBalanceDetails(
      hexToNormalisedNumber(ommTokenBalanceDetails.totalBalance),
      hexToNormalisedNumber(ommTokenBalanceDetails.availableBalance),
      hexToNormalisedNumber(ommTokenBalanceDetails.stakedBalance),
      hexToNormalisedNumber(ommTokenBalanceDetails.unstakingBalance),
      hexToBigNumber(ommTokenBalanceDetails.unstakingTimeInMills)
    );
    log.debug("mapUserOmmTokenBalanceDetails after: ", res);

    return res;
  }

  public static mapPrepList(prepList: PrepList): PrepList {
    log.debug("prepList before: ", prepList);

    const preps: Prep[] = [];

    let totalPower = new BigNumber("0");

    prepList.preps.forEach(prep => {
      const power = hexToNormalisedNumber(prep.power);
      totalPower = totalPower.plus(power);

      preps.push(new Prep(
        prep.address,
        prep.name,
        hexToNormalisedNumber(prep.stake),
        hexToNormalisedNumber(prep.delegated),
        hexToNormalisedNumber(prep.irep),
        prep.details,
        power
      ));
    });

    let stakeIrepSum = new BigNumber("0");
    let total = new BigNumber("0");

    preps.slice(0, 22).forEach(prep => {
      stakeIrepSum = stakeIrepSum.plus(prep.irep.multipliedBy(prep.delegated));
      total = total.plus(prep.delegated);
    });

    const avgIRep = stakeIrepSum.dividedBy(total);

    const res = new PrepList(
      hexToNormalisedNumber(prepList.totalDelegated),
      hexToNormalisedNumber(prepList.totalStake),
      preps,
      avgIRep,
      totalPower
    );

    log.debug("prepList after: ", res);

    return res;
  }

  public static mapPrep(prep: Prep): Prep {
    return new Prep(
      prep.address,
      prep.name,
      hexToNormalisedNumber(prep.stake),
      hexToNormalisedNumber(prep.delegated),
      hexToNormalisedNumber(prep.irep),
      prep.details,
      hexToNormalisedNumber(prep.power)
    );
  }

  public static mapUserDelegations(delegations: DelegationPreference[], prepAddressToNameMap?: Map<string, string>): YourPrepVote[] {
    const res: YourPrepVote[] = [];

    delegations.forEach(delegation => {
      res.push(new YourPrepVote(
        delegation._address,
  prepAddressToNameMap?.get(delegation._address) ?? "Unknown",
        hexToNormalisedNumber(delegation._votes_in_per)));
    });

    return res;
  }

  public static mapUserUnstakeInfo(userUnstakeInfo: IUserUnstakeInfo[]): UserUnstakeInfo {
    let totalAmount = new BigNumber(0);
    const data: UserUnstakeData[] = [];

    userUnstakeInfo.forEach(u => {
      totalAmount = totalAmount.plus(hexToNormalisedNumber(u.amount, SICX.decimals));

      const unstkData = new UserUnstakeData(
          hexToNormalisedNumber(u.amount, SICX.decimals),
          hexToBigNumber(u.blockHeight),
          u.from,
          u.sender
      );

      data.push(unstkData);


    });

    return new UserUnstakeInfo(data, totalAmount);
  }


  public static mapUserVote(vote: any): Vote {
    return new Vote(
      hexToNormalisedNumber(vote.against),
      hexToNormalisedNumber(vote.for)
    );
  }

  public static mapVotersCount(votersCount: any): VotersCount {
    return new VotersCount(
      hexToNormalisedNumber(votersCount.against_voters),
      hexToNormalisedNumber(votersCount.for_voters)
    );
  }

  public static mapProposalList(proposals: any[]): Proposal[] {
    return proposals.map(proposal => {
      return new Proposal(
        hexToNormalisedNumber(proposal.against),
        hexToBigNumber(proposal.against_voter_count),
        uriDecodeIfEncodedUri(proposal.description),
        hexToBigNumber(proposal["end day"]),
        hexToNormalisedNumber(proposal.for),
        hexToBigNumber(proposal.for_voter_count),
        hexToBigNumber(proposal.id).toString(),
        hexToNormalisedNumber(proposal.majority),
        proposal.name,
        proposal.proposer,
        hexToNormalisedNumber(proposal.quorum),
        hexToBigNumber(proposal["start day"]),
        proposal.status,
        hexToBigNumber(proposal["vote snapshot"]),
        decodeURI(proposal.forum),
        proposal.transactions ? JSON.parse(proposal.transactions) : undefined
      );
    }).sort((a, b) => b.startDay.minus(a.startDay).toNumber());
  }
}
