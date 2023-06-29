import log from "loglevel";
import {OmmTokenBalanceDetails} from "../models/classes/OmmTokenBalanceDetails";
import {Prep, PrepList} from "../models/classes/Preps";
import {YourPrepVote} from "../models/classes/YourPrepVote";
import {UnstakeIcxData, UnstakeInfo} from "../models/classes/UnstakeInfo";
import {BigNumber} from "bignumber.js";
import {Vote, VotersCount} from "../models/classes/Vote";
import {Proposal} from "../models/classes/Proposal";
import {LockedOmm} from "../models/classes/LockedOmm";
import {ILockedOmm} from "../models/interfaces/ILockedOmm";
import {hexToNormalisedNumber, hexToBigNumber, multiply, uriDecodeIfEncodedUri} from "./utils";
import {DelegationPreference} from "../models/classes/DelegationPreference";
import {IScoreParameter, IScorePayloadParameter, scoreParamToPayloadParam} from "../models/interfaces/IScoreParameter";

export abstract class Mapper {

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
        multiply(hexToNormalisedNumber(delegation._votes_in_per), new BigNumber("100"))));
    });

    return res;
  }

  public static mapUserIcxUnstakeData(unstakeIcxData: UnstakeIcxData[]): UnstakeInfo {
    let totalAmount = new BigNumber("0");
    unstakeIcxData.forEach(u => totalAmount = totalAmount.plus(hexToNormalisedNumber(u.amount)));
    return new UnstakeInfo(totalAmount, unstakeIcxData);
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
        hexToBigNumber(proposal.id),
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
