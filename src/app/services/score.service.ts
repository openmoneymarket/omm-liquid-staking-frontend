import {Injectable} from '@angular/core';
import {IconApiService} from './icon-api.service';
import log from "loglevel";
import IconService from "icon-sdk-js";
const { IconConverter } = IconService;
import BigNumber from "bignumber.js";
import {PersistenceService} from "./persistence.service";
import {CheckerService} from "./checker.service";
import {environment} from "../../environments/environment";
import {ScoreMethodNames} from "../common/score-method-names";
import {IconTransactionType} from "../models/enums/IconTransactionType";
import {Mapper} from "../common/mapper";
import {hexToNormalisedNumber, hexToBigNumber, timestampNowMicroseconds} from "../common/utils";
import {Irc2Token} from "../models/classes/Irc2Token";
import {PrepList} from "../models/classes/Preps";
import {UnstakeInfo} from "../models/classes/UnstakeInfo";
import {YourPrepVote} from "../models/classes/YourPrepVote";
import {IRewardWorkingTotal} from "../models/interfaces/IRewardWorkingTotal";
import {LockedOmm} from "../models/classes/LockedOmm";
import {Vote, VotersCount} from "../models/classes/Vote";
import {Proposal} from "../models/classes/Proposal";
import {ILockedOmm} from "../models/interfaces/ILockedOmm";
import {DelegationPreference} from "../models/classes/DelegationPreference";
import {AllAddresses} from "../models/interfaces/AllAddresses";


@Injectable({
  providedIn: 'root'
})
export class ScoreService {

  constructor(private iconApiService: IconApiService,
              private persistenceService: PersistenceService,
              private checkerService: CheckerService) {
  }

  /**
   * @description Build tx to claim unstaked ICX
   * @return  Icon Transaction
   */
  public buildClaimUnstakedIcxTx(): any {
    this.checkerService.checkUserLoggedInAndAllAddressesLoaded();

    const tx = this.iconApiService.buildTransaction(this.persistenceService.activeWallet!.address,
        this.persistenceService.allAddresses!.systemContract.Staking, ScoreMethodNames.CLAIM_UNSTAKED_ICX, {}, IconTransactionType.WRITE);

    log.debug("buildClaimUnstakedIcxTx:", tx);

    return tx;
  }

  /**
   * @description Build stake ICX tx
   * @return  Icon Transaction
   */
  public buildStakeIcxTx(amount: BigNumber): any {
    this.checkerService.checkUserLoggedInAndAllAddressesLoaded();

    const stakingScore = this.persistenceService.allAddresses!.systemContract.Staking;
    const tx = this.iconApiService.buildTransaction(this.persistenceService.activeWallet!.address,
        stakingScore, ScoreMethodNames.STAKE_ICX, {}, IconTransactionType.WRITE, amount);

    log.debug("buildStakeIcxTx:", tx);

    return tx;
  }

  /**
   * @description Get Token Distribution per day
   * @return  Token distribution per day in number
   */
  public async getTokenDistributionPerDay(day?: BigNumber | string): Promise<BigNumber> {
    this.checkerService.checkAllAddressesLoaded();

    day = day ? IconConverter.toHex(day) : await this.getRewardsDay();

    const params = {
      _day: day,
    };

    const tx = this.iconApiService.buildTransaction("",  this.persistenceService.allAddresses!.systemContract.RewardWeightController,
      ScoreMethodNames.GET_TOKEN_DISTRIBUTION_PER_DAY, params, IconTransactionType.READ);

    const res = await this.iconApiService.iconService.call(tx).execute();

    log.debug("getTokenDistributionPerDay: ", res);

    return hexToNormalisedNumber(res);
  }

  /**
   * @description Get all SCORE addresses (collateral, oTokens, System Contract, ..)
   * @return  List os collateral, oTokens and System Contract addresses
   */
  public async getAllScoreAddresses(): Promise<AllAddresses> {
    const tx = this.iconApiService.buildTransaction("",  environment.ADDRESS_PROVIDER_SCORE,
        ScoreMethodNames.GET_ALL_ADDRESSES, {}, IconTransactionType.READ);
    return this.iconApiService.iconService.call(tx).execute();
  }

  public async getRewardsDay(): Promise<string> {
    this.checkerService.checkAllAddressesLoaded();

    const tx = this.iconApiService.buildTransaction("",  this.persistenceService.allAddresses!.systemContract.RewardWeightController,
      ScoreMethodNames.GET_DAY, {}, IconTransactionType.READ);

    const res = await this.iconApiService.iconService.call(tx).execute();

    log.debug("getRewardsDay: ", res);

    return res;
  }

  /**
   * @description Get reference data (price)
   * @return  Number quoted price (e.g. USD)
   */
  public async getReferenceData(base: string, quote: string = "USD"): Promise<BigNumber> {
    this.checkerService.checkAllAddressesLoaded();

    const params = {
      _base: base,
      _quote: quote
    };

    const tx = this.iconApiService.buildTransaction("",  this.persistenceService.allAddresses!.systemContract.PriceOracle,
      ScoreMethodNames.GET_REFERENCE_DATA, params, IconTransactionType.READ);

    const res = await this.iconApiService.iconService.call(tx).execute();

    log.debug("getReferenceData: ", res);

    return hexToNormalisedNumber(res);
  }

  /**
   * @description Get the un-stake information for a specific user.
   * @return  list of un-staking amounts and block heights
   */
  public async getTheUserUnstakeInfo(): Promise<UnstakeInfo> {
    this.checkerService.checkUserLoggedInAndAllAddressesLoaded();

    const params = {
      _address: this.persistenceService.activeWallet!.address,
    };

    const tx = this.iconApiService.buildTransaction("",  this.persistenceService.allAddresses!.systemContract.LendingPoolDataProvider,
      ScoreMethodNames.GET_USER_UNSTAKE_INFO, params, IconTransactionType.READ);

    const res = await this.iconApiService.iconService.call(tx).execute();

    return Mapper.mapUserIcxUnstakeData(res);
  }

  /**
   * @description Get the claimable ICX amount for user.
   * @return  number
   */
  public async getUserClaimableIcx(): Promise<BigNumber> {
    this.checkerService.checkUserLoggedInAndAllAddressesLoaded();

    const params = {
      _address: this.persistenceService.activeWallet!.address,
    };

    const tx = this.iconApiService.buildTransaction("",  this.persistenceService.allAddresses!.systemContract.Staking,
      ScoreMethodNames.GET_USER_CLAIMABLE_ICX, params, IconTransactionType.READ);

    const res = await this.iconApiService.iconService.call(tx).execute();

    return hexToNormalisedNumber(res);
  }

  /**
   * @description Get total staked Omm
   * @return  total staked Omm normalised number
   */
  public async getTotalStakedOmm(): Promise<BigNumber> {
    this.checkerService.checkAllAddressesLoaded();

    const tx = this.iconApiService.buildTransaction("",  this.persistenceService.allAddresses!.systemContract.OmmToken,
      ScoreMethodNames.GET_TOTAL_STAKED_OMM, {}, IconTransactionType.READ);

    const res = await this.iconApiService.iconService.call(tx).execute();

    log.debug("getTotalStakedOmm (not mapped): ", res);

    return hexToNormalisedNumber(res);
  }

  /**
   * @description Get today sicx to icx conversion rate
   * @return today sICX to ICX conversion rate as number
   */
  public async getTodayRate(): Promise<BigNumber> {
    const tx = this.iconApiService.buildTransaction("",  this.persistenceService.allAddresses!.systemContract.Staking,
      ScoreMethodNames.GET_TODAY_RATE, {}, IconTransactionType.READ);

    const todayRate = hexToNormalisedNumber(await this.iconApiService.iconService.call(tx).execute());
    log.debug(`getTodayRate: ${todayRate}`);

    return todayRate;
  }


  /**
   * @description Get OMM token minimum stake amount
   * @return  Minimum OMM token stake amount
   */
  public async getOmmTokenMinStakeAmount(): Promise<BigNumber> {
    this.checkerService.checkAllAddressesLoaded();

    const tx = this.iconApiService.buildTransaction("",  this.persistenceService.allAddresses!.systemContract.OmmToken,
      ScoreMethodNames.GET_MIN_STAKE, {}, IconTransactionType.READ);

    const res = await this.iconApiService.iconService.call(tx).execute();

    log.debug("getOmmTokenMinStakeAmount: ", res);

    return hexToNormalisedNumber(res);
  }

  public async getUserAssetBalance(token: Irc2Token): Promise<BigNumber> {
    let balance: BigNumber;
    if ("ICX" === token.symbol) {
      balance = await this.iconApiService.getIcxBalance(this.persistenceService.activeWallet!.address);
    } else {
      balance = await this.getIRC2TokenBalance(token);
    }

    // set asset balance
    log.debug(`User (${this.persistenceService.activeWallet!.address}) ${token} balance: ${balance}`);

    return balance;
  }

  private async getIRC2TokenBalance(token: Irc2Token): Promise<BigNumber> {
    this.checkerService.checkUserLoggedIn();

    // make sure token address is initialised
    if (!token.addressInitialised()) {
      throw new Error(token.addressError())
    }

    const method = token.symbol === "BALN" ? ScoreMethodNames.AVAILABLE_BALANCE_OF : ScoreMethodNames.BALANCE_OF;

    const tx = this.iconApiService.buildTransaction("",  token.address!,
      method, {
        _owner: this.persistenceService.activeWallet!.address
      }, IconTransactionType.READ);

    const res = await this.iconApiService.iconService.call(tx).execute();
    const balance = hexToNormalisedNumber(res, token.decimals);

    log.debug(`User (${this.persistenceService.activeWallet!.address}) ${token} balance = ${balance}`);

    return balance;
  }


  /**
   * @description Get list of PReps
   * @return  Returns the status of all registered P-Rep candidates in descending order by delegated ICX amount
   */
  public async getListOfPreps(startRanking: number = 1, endRanking: number = 100): Promise<PrepList> {
    const params = {
      startRanking: IconConverter.toHex(startRanking),
      endRanking: IconConverter.toHex(endRanking)
    };

    const tx = this.iconApiService.buildTransaction("",  environment.IISS_API,
      ScoreMethodNames.GET_PREPS, params, IconTransactionType.READ);

    const prepList = await this.iconApiService.iconService.call(tx).execute();


    return Mapper.mapPrepList(prepList);
  }

  /**
   * @description Get user delegation details
   * @return  list of addresses and corresponding delegation detail
   */
  public async getUserDelegationDetails(): Promise<YourPrepVote[]> {
    this.checkerService.checkUserLoggedInAndAllAddressesLoaded();

    const params = {
      _user: this.persistenceService.activeWallet!.address
    };

    const tx = this.iconApiService.buildTransaction("",  this.persistenceService.allAddresses!.systemContract.Delegation,
      ScoreMethodNames.GET_USER_DELEGATION_DETAILS, params, IconTransactionType.READ);

    const res: DelegationPreference[] = await this.iconApiService.iconService.call(tx).execute();

    log.debug("getUserDelegationDetails: ", res);

    return Mapper.mapUserDelegations(res, this.persistenceService.prepList?.prepAddressToNameMap);
  }

  /**
   * @description Get delegation SCORE working total supply of bOMM
   * @return BigNumber - delegations working total supply of bOMM
   */
  public async getDelegationWorkingTotalSupplyOfbOmm(): Promise<BigNumber> {
    this.checkerService.checkAllAddressesLoaded();

    const tx = this.iconApiService.buildTransaction("",  this.persistenceService.allAddresses!.systemContract.Delegation,
      ScoreMethodNames.GET_WORKING_TOTAL_SUPPLY, {}, IconTransactionType.READ);

    const res: string = await this.iconApiService.iconService.call(tx).execute();

    log.debug("getDelegationWorkingTotalSupplyOfbOmm: ", res);

    return hexToNormalisedNumber(res);
  }

  /**
   * @description Get Reward SCORE working total supply of bOMM
   * @return BigNumber - rewards working total supply of bOMM
   */
  public async getRewardsWorkingTotalSupplyOfbOmm(): Promise<BigNumber> {
    this.checkerService.checkAllAddressesLoaded();

    const tx = this.iconApiService.buildTransaction("",  this.persistenceService.allAddresses!.systemContract.Rewards,
      ScoreMethodNames.GET_WORKING_TOTAL, {}, IconTransactionType.READ);

    const res: IRewardWorkingTotal = await this.iconApiService.iconService.call(tx).execute();

    log.debug("getRewardsWorkingTotalSupplyOfbOmm: ", res);

    return hexToNormalisedNumber(res.bOMM);
  }

  /**
   * @description Get user delegation working bOMM supply
   * @return BigNumber - user delegation working bOMM supply
   */
  public async getUserDelegationWorkingSupplyOfbOmm(): Promise<BigNumber> {
    this.checkerService.checkUserLoggedInAndAllAddressesLoaded();

    const tx = this.iconApiService.buildTransaction("",  this.persistenceService.allAddresses!.systemContract.Delegation,
      ScoreMethodNames.GET_USER_WORKING_BALANCE, {
       user: this.persistenceService.activeWallet?.address
      }, IconTransactionType.READ);

    const res: string = await this.iconApiService.iconService.call(tx).execute();

    log.debug("getUserDelegationWorkingSupplyOfbOmm: ", res);

    return hexToNormalisedNumber(res);
  }

  /**
   * @description Get user rewards working bOMM supply
   * @return BigNumber - user rewards working bOMM supply
   */
  public async getUserRewardsWorkingSupplyOfbOmm(): Promise<BigNumber> {
    this.checkerService.checkUserLoggedInAndAllAddressesLoaded();

    const tx = this.iconApiService.buildTransaction("",  this.persistenceService.allAddresses!.systemContract.Rewards,
      ScoreMethodNames.GET_WORKING_BALANCES, {
        user: this.persistenceService.activeWallet?.address
      }, IconTransactionType.READ);

    const res: IRewardWorkingTotal = await this.iconApiService.iconService.call(tx).execute();

    log.debug("getUserRewardsWorkingSupplyOfbOmm: ", res);

    return hexToNormalisedNumber(res.bOMM);
  }

  /**
   * @description Get users locked OMM token amount
   * @return LockedOmm - Locked OMM tokens amount and end
   */
  public async getUserLockedOmmTokens(): Promise<LockedOmm> {
    this.checkerService.checkUserLoggedInAndAllAddressesLoaded();

    const params = { _owner: this.persistenceService.activeWallet!.address};

    const tx = this.iconApiService.buildTransaction("",  this.persistenceService.allAddresses!.systemContract.bOMM,
      ScoreMethodNames.GET_LOCKED_OMM, params, IconTransactionType.READ);

    const res: ILockedOmm = await this.iconApiService.iconService.call(tx).execute();

    return Mapper.mapLockedOmm(res);
  }

  /**
   * @description Get users bOMM balance
   * @return BigNumber - Users bOMM balance as BigNumber
   */
  public async getUsersbOmmBalance(): Promise<BigNumber> {
    this.checkerService.checkUserLoggedInAndAllAddressesLoaded();

    const params = { _owner: this.persistenceService.activeWallet!.address};

    const tx = this.iconApiService.buildTransaction("",  this.persistenceService.allAddresses!.systemContract.bOMM,
      ScoreMethodNames.BALANCE_OF, params, IconTransactionType.READ);

    const res: string = await this.iconApiService.iconService.call(tx).execute();

    return hexToNormalisedNumber(res);
  }

  /**
   * @description Get total bOMM supply
   * @return BigNumber - Total bOMM supply
   */
  public async getTotalbOmmSupply(): Promise<BigNumber> {
    this.checkerService.checkAllAddressesLoaded();

    const tx = this.iconApiService.buildTransaction("",  this.persistenceService.allAddresses!.systemContract.bOMM,
      ScoreMethodNames.TOTAL_SUPPLY, {}, IconTransactionType.READ);

    const res: string = await this.iconApiService.iconService.call(tx).execute();

    return hexToNormalisedNumber(res);
  }

  /**
   * @description Get total amount of token in pool
   * @return  BigNumber
   */
  public async getPoolTotal(poolId: BigNumber, token: string, decimals: number): Promise<BigNumber> {
    const params = {
      _id: IconConverter.toHex(poolId),
      _token: token
    };

    const tx = this.iconApiService.buildTransaction("",  environment.BALANCED_DEX_SCORE,
      ScoreMethodNames.GET_POOL_TOTAL, params, IconTransactionType.READ);

    const res = await this.iconApiService.iconService.call(tx).execute();

    log.debug("getPoolTotal for " + poolId + ":" + token + ":", res);

    return hexToNormalisedNumber(res, decimals);
  }

  /**
   * @description Get the proposal list
   * @return  VotersCount - the numbers represent voters
   */
  public async getProposalList(batchSize?: BigNumber, offset: BigNumber = new BigNumber("0")): Promise<Proposal[]> {
    if (!batchSize) {
      batchSize = await this.getNumberOfProposals();
    }

    const params = {
      batch_size: IconConverter.toHex(batchSize),
      offset: IconConverter.toHex(offset)
    };

    const tx = this.iconApiService.buildTransaction("",  this.persistenceService.allAddresses!.systemContract.Governance,
      ScoreMethodNames.GET_PROPOSALS, params, IconTransactionType.READ);

    const res = await this.iconApiService.iconService.call(tx).execute();

    return Mapper.mapProposalList(res);
  }

  /**
   * @description Get voters count for vote
   * @return  VotersCount - the numbers represent voters
   */
  public async getVotersCount(voteIndex: BigNumber): Promise<VotersCount> {
    const params = {
      vote_index: IconConverter.toHex(voteIndex),
    };

    const tx = this.iconApiService.buildTransaction("",  this.persistenceService.allAddresses!.systemContract.Governance,
      ScoreMethodNames.GET_VOTERS_COUNT, params, IconTransactionType.READ);

    const res = await this.iconApiService.iconService.call(tx).execute();

    log.debug(`getVotersCount = ${res}`);

    return Mapper.mapVotersCount(res);
  }

  /**
   * @description Get votes of users
   * @return  Vote - the numbers represents OMM tokens in EXA
   */
  public async getVotesOfUsers(proposalId?: BigNumber): Promise<Vote> {
    this.checkerService.checkUserLoggedInAndAllAddressesLoaded();

    const params = {
      vote_index: IconConverter.toHex(proposalId ?? 0),
      user: this.persistenceService.activeWallet!.address
    };

    const tx = this.iconApiService.buildTransaction("",  this.persistenceService.allAddresses!.systemContract.Governance,
      ScoreMethodNames.GET_VOTES_OF_USER, params, IconTransactionType.READ);

    const res = await this.iconApiService.iconService.call(tx).execute();

    return Mapper.mapUserVote(res);
  }

  /**
   * @description Get users voting weight
   * @return  BigNumber
   */
  public async getUsersVotingWeight(day: BigNumber | number = Date.now()): Promise<BigNumber> {
    // for day provide timestamp in microseconds
    const params = {
      day: IconConverter.toHex(day),
      address: this.persistenceService.activeWallet!.address
    };

    const tx = this.iconApiService.buildTransaction("",  this.persistenceService.allAddresses!.systemContract.Governance,
      ScoreMethodNames.GET_USERS_VOTING_WEIGHT, params, IconTransactionType.READ);

    const res = await this.iconApiService.iconService.call(tx).execute();

    log.debug(`getUsersVotingWeight = ${res}`);

    return hexToNormalisedNumber(res);
  }

  /**
   * @description Get number of proposals
   * @return  BigNumber
   */
  public async getNumberOfProposals(day: BigNumber | number = Date.now()): Promise<BigNumber> {
    const tx = this.iconApiService.buildTransaction("",  this.persistenceService.allAddresses!.systemContract.Governance,
      ScoreMethodNames.GET_PROPOSAL_COUNT, {}, IconTransactionType.READ);

    const res = await this.iconApiService.iconService.call(tx).execute();

    log.debug(`getNumberOfProposals = ${res}`);

    return hexToBigNumber(res);
  }

  /**
   * @description Get vote definition fee
   * @return  BigNumber - amount of omm as  fee required for creating a proposal
   */
  public async getVoteDefinitionFee(): Promise<BigNumber> {
    const tx = this.iconApiService.buildTransaction("",  this.persistenceService.allAddresses!.systemContract.Governance,
      ScoreMethodNames.GET_VOTE_DEFINITION_FEE, {}, IconTransactionType.READ);

    const res = await this.iconApiService.iconService.call(tx).execute();

    log.debug(`getVoteDefinitionFee = ${res}`);

    return hexToNormalisedNumber(res);
  }

  /**
   * @description Get vote definition criteria
   * @return  BigNumber - percentage representing vote definition criteria
   */
  public async getBoostedOmmVoteDefinitionCriteria(): Promise<BigNumber> {
    const tx = this.iconApiService.buildTransaction("",  this.persistenceService.allAddresses!.systemContract.Governance,
      ScoreMethodNames.GET_BOOSTED_OMM_VOTE_DEFINITION_CRITERION, {}, IconTransactionType.READ);

    const res = await this.iconApiService.iconService.call(tx).execute();

    log.debug(`getBoostedOmmVoteDefinitionCriteria = ${res}`);

    return hexToNormalisedNumber(res);
  }

  /**
   * @description Get users voting weight
   * @return  BigNumber - Users voting weight in OMM token number denomination
   */
  public async getUserVotingWeight(proposalBlockHeight: BigNumber): Promise<BigNumber> {

    const params = {
      _block: proposalBlockHeight,
      _address: this.persistenceService.activeWallet?.address
    };

    const tx = this.iconApiService.buildTransaction("",  this.persistenceService.allAddresses!.systemContract.Governance,
      ScoreMethodNames.MY_VOTING_WEIGHT, params, IconTransactionType.READ);

    const res = await this.iconApiService.iconService.call(tx).execute();

    log.debug(`getUserVotingWeight = ${res}`);

    return hexToNormalisedNumber(res);
  }

  /**
   * @description Get vote duration
   * @return  BigNumber - Vote duration number
   */
  public async getVoteDuration(): Promise<BigNumber> {
    this.checkerService.checkAllAddressesLoaded();

    const tx = this.iconApiService.buildTransaction("",  this.persistenceService.allAddresses!.systemContract.Governance,
      ScoreMethodNames.GET_VOTE_DURATION, {}, IconTransactionType.READ);

    const res = await this.iconApiService.iconService.call(tx).execute();

    log.debug(`getVoteDuration = ${res}`);

    return hexToBigNumber(res);
  }

  /**
   * @description Get total staked OMM at certain timestamp
   * @return  BigNumber - Users voting weight in OMM token number denomination
   */
  public async getTotalStakedOmmAt(timestamp: BigNumber = timestampNowMicroseconds()): Promise<BigNumber> {
    this.checkerService.checkAllAddressesLoaded();

    const params = {
      _timestamp: timestamp,
    };

    const tx = this.iconApiService.buildTransaction("",  this.persistenceService.allAddresses!.systemContract.Governance,
      ScoreMethodNames.TOTAL_STAKED_OMM_AT, params, IconTransactionType.READ);

    const res = await this.iconApiService.iconService.call(tx).execute();

    log.debug(`getTotalStakedOmmAt = ${res}`);

    return hexToNormalisedNumber(res);
  }

  public async getTotalOmmSupply(): Promise<BigNumber> {
    this.checkerService.checkAllAddressesLoaded();

    const tx = this.iconApiService.buildTransaction("",  this.persistenceService.allAddresses!.systemContract.OmmToken,
      ScoreMethodNames.TOTAL_SUPPLY, {}, IconTransactionType.READ);

    const res = await this.iconApiService.iconService.call(tx).execute();

    return hexToNormalisedNumber(res);
  }

  /**
   * @description Get auto-execution (governance) supported contracts list
   * @return  List of contract address
   */
  public async getGovernanceSupportedContracts(): Promise<string[]> {
    this.checkerService.checkAllAddressesLoaded();

    const tx = this.iconApiService.buildTransaction("",  this.persistenceService.allAddresses!.systemContract.Governance,
      ScoreMethodNames.GET_SUPPORTED_CONTRACTS, {}, IconTransactionType.READ);

    const res = await this.iconApiService.iconService.call(tx).execute();

    log.debug(`getGovernanceSupportedContracts = ${res}`);

    return res;
  }

  /**
   * @description Get auto-execution (governance) supported contracts list
   * @return  Names of methods of contract, that can be called via governance proposal
   */
  public async getGovernanceSupportedContractMethods(contract: string): Promise<string[]> {
    this.checkerService.checkAllAddressesLoaded();

    const tx = this.iconApiService.buildTransaction("",  this.persistenceService.allAddresses!.systemContract.Governance,
      ScoreMethodNames.GET_SUPPORTED_METHODS_OF_CONTRACT, { contract }, IconTransactionType.READ);

    const res = await this.iconApiService.iconService.call(tx).execute();

    log.debug(`getGovernanceSupportedContractMethods = ${res}`);

    return res;
  }

  /**
   * @description Get name of the contract
   * @return  Name of the contract
   */
  public async getContractName(contract: string): Promise<string> {
    this.checkerService.checkAllAddressesLoaded();

    const tx = this.iconApiService.buildTransaction("",  contract,
      ScoreMethodNames.GET_NAME, {}, IconTransactionType.READ);

    const res = await this.iconApiService.iconService.call(tx).execute();

    log.debug(`getContractName ${contract} = ${res}`);

    return res;
  }

}
