import {Injectable} from '@angular/core';
import {IconApiService} from './icon-api.service';
import log from "loglevel";
import IconService from "icon-sdk-js";
const { IconConverter, IconAmount } = IconService;
import BigNumber from "bignumber.js";
import {StoreService} from "./store.service";
import {CheckerService} from "./checker.service";
import {environment} from "../../environments/environment";
import {ScoreMethodNames} from "../common/score-method-names";
import {IconTransactionType} from "../models/enums/IconTransactionType";
import {Mapper} from "../common/mapper";
import {hexToNormalisedNumber, hexToBigNumber, timestampNowMicroseconds} from "../common/utils";
import {Irc2Token} from "../models/classes/Irc2Token";
import {PrepList} from "../models/classes/Preps";
import {YourPrepVote} from "../models/classes/YourPrepVote";
import {IRewardWorkingTotal} from "../models/interfaces/IRewardWorkingTotal";
import {LockedOmm} from "../models/classes/LockedOmm";
import {Vote, VotersCount} from "../models/classes/Vote";
import {CreateProposal, Proposal} from "../models/classes/Proposal";
import {ILockedOmm} from "../models/interfaces/ILockedOmm";
import {DelegationPreference} from "../models/classes/DelegationPreference";
import {AllAddresses} from "../models/interfaces/AllAddresses";
import {BALANCED_SICX_POOL_ID, OMM, SICX} from "../common/constants";
import {IUserUnstakeInfo} from "../models/interfaces/IUserUnstakeInfo";
import {UserUnstakeInfo} from "../models/classes/UserUnstakeInfo";
import {BalancedDexFees} from "../models/classes/BalancedDexFees";
import {PoolStats, PoolStatsInterface} from "../models/classes/PoolStats";
import {Address, HexString, PrepAddress} from "../models/Types/ModalTypes";
import {OmmTokenBalanceDetails} from "../models/classes/OmmTokenBalanceDetails";


@Injectable({
  providedIn: 'root'
})
export class ScoreService {

  constructor(private iconApiService: IconApiService,
              private storeService: StoreService,
              private checkerService: CheckerService) {
  }

  /**
   * @description Build Icon transaction to update user delegation preferences
   * @return  Icon tx
   */
  public buildUpdateBommDelegationsTx(userDelegations: YourPrepVote[]): any {
    this.checkerService.checkUserLoggedInAndAllAddressesLoaded();

    const delegations: {_address: string, _votes_in_per: string}[] = userDelegations.map(vote => {
      return {
        _address: vote.address,
        _votes_in_per: IconConverter.toHex(IconAmount.of(vote.percentage, 18).toLoop()) // note 1EXA is 100%
      }
    });
    log.debug("delegations:", delegations);

    const params = {
      _delegations: delegations
    };

    return this.iconApiService.buildTransaction(this.storeService.userWalletAddress(),
        this.storeService.allAddresses!.systemContract.Delegation,
        ScoreMethodNames.UPDATE_DELEGATIONS, params, IconTransactionType.WRITE);
  }

  /**
   * @description Build Icon transaction to update user delegation preferences
   * @return  Icon tx
   */
  public buildUpdateSicxDelegationsTx(userDelegations: YourPrepVote[]): any {
    this.checkerService.checkUserLoggedInAndAllAddressesLoaded();

    const delegations: {_address: string, _votes_in_per: string}[] = userDelegations.map(vote => {
      return {
        _address: vote.address,
        _votes_in_per: IconConverter.toHex(IconAmount.of(vote.percentage.multipliedBy(100), 18).toLoop()) // note 1EXA is 1%
      }
    });
    log.debug("delegations:", delegations);

    const params = {
      _user_delegations: delegations
    };

    return this.iconApiService.buildTransaction(this.storeService.userWalletAddress(),
        this.storeService.allAddresses!.systemContract.Staking,
        ScoreMethodNames.DELEGATE, params, IconTransactionType.WRITE);
  }

  /**
   * @description Build Icon transaction to remove all of the users bOmm delegation votes
   * @return Icon tx
   */
  public buildRemoveAllBommVotes(): Promise<any> {
    this.checkerService.checkUserLoggedInAndAllAddressesLoaded();

    const params = {
      _user: this.storeService.userWalletAddress()
    };

    return this.iconApiService.buildTransaction(this.storeService.userWalletAddress(),
        this.storeService.allAddresses!.systemContract.Delegation,
        ScoreMethodNames.CLEAR_PREVIOUS_DELEGATIONS, params, IconTransactionType.WRITE);
  }

  /**
   * @description Build Icon transaction to remove all of the users votes
   * @return Icon tx
   */
  public buildRemoveAllSicxVotes(): Promise<any> {
    this.checkerService.checkUserLoggedInAndAllAddressesLoaded();

    const params = {
      _user_delegations: []
    };

    return this.iconApiService.buildTransaction(this.storeService.userWalletAddress(),
        this.storeService.allAddresses!.systemContract.Staking,
        ScoreMethodNames.DELEGATE, params, IconTransactionType.WRITE);
  }

  /**
   * @description Build tx to withdraw unlocked OMM
   * @return  Icon Transaction
   */
  public buildWithdrawLockedOmm(): any {
    this.checkerService.checkUserLoggedInAndAllAddressesLoaded();

    return this.iconApiService.buildTransaction(this.storeService.userWalletAddress(),
        this.storeService.allAddresses!.systemContract.bOMM, ScoreMethodNames.WITHDRAW_LOCKED_OMM, {}, IconTransactionType.WRITE);
  }

  /**
   * @description Build tx to claim unstaked ICX
   * @return  Icon Transaction
   */
  public buildClaimUnstakedIcxTx(): any {
    this.checkerService.checkUserLoggedInAndAllAddressesLoaded();

    const tx = this.iconApiService.buildTransaction(this.storeService.userWalletAddress(),
        this.storeService.allAddresses!.systemContract.Staking, ScoreMethodNames.CLAIM_UNSTAKED_ICX, {}, IconTransactionType.WRITE);

    log.debug("buildClaimUnstakedIcxTx:", tx);

    return tx;
  }

  /**
   * @description Build Create a proposal tx
   * @return  Icon transaction
   */
  public buildSubmitProposalTx(proposal: CreateProposal ): any {
    this.checkerService.checkUserLoggedInAndAllAddressesLoaded();

    const to = this.storeService.allAddresses!.systemContract.Governance;
    const value = IconConverter.toHex(IconAmount.of(proposal.voteDefinitionFee, 18).toLoop());
    const dataPayload = `{ "method": "defineVote", "params": { "name": "${
        proposal.title}", "description": "${ // "unique name of the proposal"
        proposal.description}", "forum": "${proposal.forumLink}"${ proposal.transactions ? ', "transactions": ' + JSON.stringify(proposal.transactions) : ''}}}`;
    log.debug("Create proposal data payload:", dataPayload);
    const data = IconConverter.fromUtf8(dataPayload);

    const params = {
      _to: to,
      _value: value,
      _data: data
    };

    const tx =  this.iconApiService.buildTransaction(this.storeService.userWalletAddress(),
        this.storeService.allAddresses!.systemContract.OmmToken,  ScoreMethodNames.TRANSFER, params, IconTransactionType.WRITE);

    log.debug("createProposal tx = ", tx);

    return tx;
  }

  /**
   * @description Cast vote on proposal
   * @return Icon tx
   */
  public buildCastVote(proposalId: BigNumber, approve: boolean): Promise<any> {
    this.checkerService.checkUserLoggedInAndAllAddressesLoaded();

    const params = {
      vote_index: IconConverter.toHex(proposalId),
      vote: approve ? "0x1" : "0x0"
    };

    return this.iconApiService.buildTransaction(this.storeService.userWalletAddress(),
        this.storeService.allAddresses!.systemContract.Governance,
        ScoreMethodNames.CAST_VOTE, params, IconTransactionType.WRITE);
  }

  /**
   * @description Build tx to claim rewards
   * @return  Icon Transaction
   */
  public buildClaimRewardsTx(): any {
    this.checkerService.checkUserLoggedInAndAllAddressesLoaded();

    const tx = this.iconApiService.buildTransaction(this.storeService.userWalletAddress(),
        this.storeService.allAddresses!.systemContract.FeeDistribution, ScoreMethodNames.CLAIM_REWARDS, {}, IconTransactionType.WRITE);

    log.debug("buildClaimRewardsTx:", tx);

    return tx;
  }

  /**
   * @description Build stake ICX tx
   * @return  Icon Transaction
   */
  public buildStakeIcxTx(amount: BigNumber): any {
    this.checkerService.checkUserLoggedInAndAllAddressesLoaded();

    const stakingScore = this.storeService.allAddresses!.systemContract.Staking;
    const tx = this.iconApiService.buildTransaction(this.storeService.userWalletAddress(),
        stakingScore, ScoreMethodNames.STAKE_ICX, {}, IconTransactionType.WRITE, amount);

    log.debug("buildStakeIcxTx:", tx);

    return tx;
  }

  /**
   * @description Build unstake sICX tx
   * @param amount - Amount of sICX to un-stake
   * @return  Icon Transaction
   */
  public buildUnstakeSicxTx(amount: BigNumber): any {
    this.checkerService.checkUserLoggedInAndAllAddressesLoaded();

    const dataPayload = '{ "method": "unstake" }';

    const params = {
      _to: this.storeService.allAddresses!.systemContract.Staking,
      _value: IconConverter.toHex(IconAmount.of(amount, SICX.decimals).toLoop()),
      _data: IconConverter.fromUtf8(dataPayload)
    }


    const tx = this.iconApiService.buildTransaction(this.storeService.userWalletAddress(),
        SICX.address!, ScoreMethodNames.TRANSFER, params, IconTransactionType.WRITE);

    log.debug("buildUnstakeSicxTx:", tx);

    return tx;
  }

  /**
   * @description Build instant unstake sICX tx
   * @param amount - Amount of sICX to un-stake
   * @return  Icon Transaction
   */
  public buildInstantUnstakeSicxTx(amount: BigNumber): any {
    this.checkerService.checkUserLoggedInAndAllAddressesLoaded();

    const dataPayload = '{ "method": "_swap_icx" }';

    const params = {
      _to: this.storeService.allAddresses!.systemContract.DEX,
      _value: IconConverter.toHex(IconAmount.of(amount, SICX.decimals).toLoop()),
      _data: IconConverter.fromUtf8(dataPayload)
    };

    const tx = this.iconApiService.buildTransaction(this.storeService.userWalletAddress(),
        SICX.address!, ScoreMethodNames.TRANSFER, params, IconTransactionType.WRITE);

    log.debug("buildInstantUnstakeSicxTx:", tx);

    return tx;
  }

  /**
   * @description Build increase lock OMM amount Icon transaction
   * @param amount - Amount of OMM tokens to lock
   * @return any lock OMM Tokens Icon transaction
   */
  public buildIncreaseLockAmountOmmTx(amount: number): any {
    this.checkerService.checkUserLoggedInAndAllAddressesLoaded();

    log.debug(`Increase Lock Omm amount = ` + amount.toString());

    const params = {
      _to: this.storeService.allAddresses!.systemContract.bOMM,
      _value: IconConverter.toHex(IconAmount.of(amount, OMM.decimals).toLoop()),
      _data: IconConverter.fromUtf8('{ "method": "increaseAmount", "params": { "unlockTime": 0 }}')};

    return this.iconApiService.buildTransaction(this.storeService.userWalletAddress(),
        this.storeService.allAddresses!.systemContract.OmmToken, ScoreMethodNames.TRANSFER, params, IconTransactionType.WRITE);
  }

  /**
   * @description Build increase lock time of locked OMM tokens
   * @param lockPeriod - New lock period
   * @return any increase OMM Tokens lock period Icon transaction
   */
  public buildIncreaseLockTimeOmmTx(lockPeriod: BigNumber): any {
    this.checkerService.checkUserLoggedInAndAllAddressesLoaded();

    log.debug("buildIncreaseLockTimeOmmTx lockPeriod = " + lockPeriod.toString());

    // convert to microseconds
    const unlockTimeMicro = lockPeriod.multipliedBy(1000);
    log.debug(`Increase Lock Omm time for = ` + unlockTimeMicro.toString());

    const params = {
      unlockTime: IconConverter.toHex(unlockTimeMicro)
    };

    return this.iconApiService.buildTransaction(this.storeService.userWalletAddress(),
        this.storeService.allAddresses!.systemContract.bOMM, ScoreMethodNames.INCREASE_UNLOCK_TIME, params, IconTransactionType.WRITE);
  }

  /**
   * @description Build increase lock amount and unlock period OMM Tokens Icon transaction
   * **Note**: Lock period is timestamp in microseconds. The lock period should be an integer/long, not a string.
   * @param amount - Amount of OMM tokens to lock
   * @param unlockTime - lock time in milliseconds that needs to be converted to microseconds
   * @return any lock OMM Tokens Icon transaction
   */
  public buildIncreaseLockPeriodAndAmountOmmTx(amount: number, unlockTime: BigNumber): any {
    this.checkerService.checkUserLoggedInAndAllAddressesLoaded();

    // convert to microseconds
    const unlockTimeMicro = unlockTime.multipliedBy(1000);
    log.debug(`Lock Omm amount = ` + amount.toString());
    log.debug(`unlockTime = ` + unlockTime.toString());
    const decimals = 18;
    const dataPayload = '{ "method": "increaseAmount", "params": { "unlockTime":' + unlockTimeMicro.toFixed() + '}}';
    log.debug("Data payload = ", dataPayload);

    const params = {
      _to: this.storeService.allAddresses!.systemContract.bOMM,
      _value: IconConverter.toHex(IconAmount.of(amount, decimals).toLoop()),
      _data: IconConverter.fromUtf8(dataPayload)};

    return this.iconApiService.buildTransaction(this.storeService.userWalletAddress(),
        this.storeService.allAddresses!.systemContract.OmmToken, ScoreMethodNames.TRANSFER, params, IconTransactionType.WRITE);
  }

  /**
   * @description Build lock OMM Tokens Icon transaction
   * **Note**: Lock period is timestamp in microseconds. The lock period should be an integer/long, not a string.
   * @param amount - Amount of OMM tokens to lock
   * @param unlockTime - lock time in milliseconds that needs to be converted to microseconds
   * @return any lock OMM Tokens Icon transaction
   */
  public buildLockOmmTx(amount: number, unlockTime: BigNumber): any {
    this.checkerService.checkUserLoggedInAndAllAddressesLoaded();

    // convert to microseconds
    const unlockTimeMicro = unlockTime.multipliedBy(1000);
    log.debug(`Lock Omm amount = ` + amount.toString());
    log.debug(`unlockTime = ` + unlockTime.toString());
    const decimals = 18;
    const dataPayload = '{ "method": "createLock", "params": { "unlockTime":' + unlockTimeMicro.toFixed() + '}}';
    log.debug("Data payload = ", dataPayload);

    const params = {
      _to: this.storeService.allAddresses!.systemContract.bOMM,
      _value: IconConverter.toHex(IconAmount.of(amount, decimals).toLoop()),
      _data: IconConverter.fromUtf8(dataPayload)};

    return this.iconApiService.buildTransaction(this.storeService.userWalletAddress(),
        this.storeService.allAddresses!.systemContract.OmmToken, ScoreMethodNames.TRANSFER, params, IconTransactionType.WRITE);
  }


  /**
   * @description Get user accumulated OMM rewards amount
   * @return BigNumber
   */
  public async getUserAccumulatedOmmRewards(): Promise<BigNumber> {
    this.checkerService.checkUserLoggedInAndAllAddressesLoaded();
    log.debug("Executing getUserAccumulatedOmmRewards...");

    const params = {
      address: this.storeService.userWalletAddress(),
    };

    const tx = this.iconApiService.buildTransaction("",  this.storeService.allAddresses!.systemContract.FeeDistribution,
        ScoreMethodNames.GET_ACCUMULATED_FEE, params, IconTransactionType.READ);

    const res = await this.iconApiService.iconService.call(tx).execute();

    log.debug("getUserAccumulatedOmmRewards: ", res);

    return hexToNormalisedNumber(res);
  }

  /**
   * @description Get logged in user (validator) collected/earned rewards
   * @return BigNumber
   */
  public async getUserCollectedFees(): Promise<BigNumber> {
    this.checkerService.checkUserLoggedInAndAllAddressesLoaded();

    const params = {
      address: this.storeService.userWalletAddress(),
    };

    const tx = this.iconApiService.buildTransaction("",  this.storeService.allAddresses!.systemContract.FeeDistribution,
        ScoreMethodNames.GET_COLLECTED_FEE, params, IconTransactionType.READ);

    const res = await this.iconApiService.iconService.call(tx).execute();

    log.debug("getUserCollectedFees: ", res);

    return hexToNormalisedNumber(res);
  }

  /**
   * @description Get Balanced DEX fees
   * @return BalancedDexFees
   */
  public async getBalancedDexFees(): Promise<BalancedDexFees> {
    this.checkerService.checkAllAddressesLoaded();

    const tx = this.iconApiService.buildTransaction("",  this.storeService.allAddresses!.systemContract.DEX,
        ScoreMethodNames.GET_FEES, {}, IconTransactionType.READ);

    const res = await this.iconApiService.iconService.call(tx).execute();

    log.debug("getBalnDexFees: ", res);

    return Mapper.mapBalancedFees(res);
  }

  /**
   * @description Get ICX/sICX pool stats
   * @return  PoolStats
   */
  public async getIcxSicxPoolStats(): Promise<PoolStats> {
    const params = {
      _id: IconConverter.toHex(BALANCED_SICX_POOL_ID)
    };

    const tx = this.iconApiService.buildTransaction("",  environment.BALANCED_DEX_SCORE,
        ScoreMethodNames.GET_POOL_STATS, params, IconTransactionType.READ);

    const res: PoolStatsInterface = await this.iconApiService.iconService.call(tx).execute();

    // log.debug("getPoolStats for " + poolId + ":", res);

    return Mapper.mapPoolStats(res);
  }

  /**
   * @description Get Token Distribution per day
   * @return  Token distribution per day in number
   */
  public async getTokenDistributionPerDay(day?: BigNumber | string): Promise<BigNumber> {
    this.checkerService.checkAllAddressesLoaded();

    day = day ? IconConverter.toHex(new BigNumber(day)) : await this.getRewardsDay();

    const params = {
      _day: day,
    };

    const tx = this.iconApiService.buildTransaction("",  this.storeService.allAddresses!.systemContract.RewardWeightController,
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

    const tx = this.iconApiService.buildTransaction("",  this.storeService.allAddresses!.systemContract.RewardWeightController,
      ScoreMethodNames.GET_DAY, {}, IconTransactionType.READ);

    const res = await this.iconApiService.iconService.call(tx).execute();

    log.debug("getRewardsDay: ", res);

    return res;
  }

  /**
   * @description Get reference data (price)
   * @return  Number quoted price (e.g. USD)
   */
  public async getReferenceData(base: string, quote = "USD"): Promise<BigNumber> {
    this.checkerService.checkAllAddressesLoaded();

    const params = {
      _base: base,
      _quote: quote
    };

    const tx = this.iconApiService.buildTransaction("",  this.storeService.allAddresses!.systemContract.PriceOracle,
      ScoreMethodNames.GET_REFERENCE_DATA, params, IconTransactionType.READ);

    const res = await this.iconApiService.iconService.call(tx).execute();

    log.debug("getReferenceData: ", res);

    return hexToNormalisedNumber(res);
  }

  /**
   * @description Get the un-stake information for a specific user.
   * @return  list of un-staking amounts and block heights
   */
  public async getUserUnstakeInfo(): Promise<UserUnstakeInfo> {
    this.checkerService.checkUserLoggedInAndAllAddressesLoaded();

    const params = {
      _address: this.storeService.userWalletAddress(),
    };

    const tx = this.iconApiService.buildTransaction("",  this.storeService.allAddresses!.systemContract.Staking,
      ScoreMethodNames.GET_USER_UNSTAKE_INFO, params, IconTransactionType.READ);

    const res: IUserUnstakeInfo[] = await this.iconApiService.iconService.call(tx).execute();

    return Mapper.mapUserUnstakeInfo(res);
  }

  /**
   * @description Get the claimable ICX amount for user.
   * @return  number
   */
  public async getUserClaimableIcx(): Promise<BigNumber> {
    this.checkerService.checkUserLoggedInAndAllAddressesLoaded();

    const params = {
      _address: this.storeService.userWalletAddress(),
    };

    const tx = this.iconApiService.buildTransaction("",  this.storeService.allAddresses!.systemContract.Staking,
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

    const tx = this.iconApiService.buildTransaction("",  this.storeService.allAddresses!.systemContract.OmmToken,
      ScoreMethodNames.GET_TOTAL_STAKED_OMM, {}, IconTransactionType.READ);

    const res = await this.iconApiService.iconService.call(tx).execute();

    log.debug("getTotalStakedOmm (not mapped): ", res);

    return hexToNormalisedNumber(res);
  }

  /**
   * @description Get total staked ICX
   * @return  total staked ICX normalised number
   */
  public async getTotalStakedIcx(): Promise<BigNumber> {
    this.checkerService.checkAllAddressesLoaded();

    const tx = this.iconApiService.buildTransaction("",  this.storeService.allAddresses!.systemContract.Staking,
        ScoreMethodNames.GET_TOTAL_STAKE, {}, IconTransactionType.READ);

    const res = await this.iconApiService.iconService.call(tx).execute();

    log.debug("getTotalStakedIcx (not mapped): ", res);

    return hexToNormalisedNumber(res);
  }

  /**
   * @description Get today sicx to icx conversion rate
   * @return today sICX to ICX conversion rate as number
   */
  public async getTodayRate(): Promise<BigNumber> {
    const tx = this.iconApiService.buildTransaction("",  this.storeService.allAddresses!.systemContract.Staking,
      ScoreMethodNames.GET_TODAY_RATE, {}, IconTransactionType.READ);

    const todayRate = hexToNormalisedNumber(await this.iconApiService.iconService.call(tx).execute());
    log.debug(`getTodayRate: ${todayRate}`);

    return todayRate;
  }

  /**
   * @description Get total sICX amount
   * @return total sICX amount normalised
   */
  public async getTotalSicxAmount(): Promise<BigNumber> {
    const tx = this.iconApiService.buildTransaction("",  this.storeService.allAddresses!.collateral.sICX,
        ScoreMethodNames.TOTAL_SUPPLY, {}, IconTransactionType.READ);

    const res = hexToNormalisedNumber(await this.iconApiService.iconService.call(tx).execute());
    log.debug(`getTotalSicxAmount: ${res}`);

    return res;
  }


  /**
   * @description Get OMM token minimum stake amount
   * @return  Minimum OMM token stake amount
   */
  public async getOmmTokenMinStakeAmount(): Promise<BigNumber> {
    this.checkerService.checkAllAddressesLoaded();

    const tx = this.iconApiService.buildTransaction("",  this.storeService.allAddresses!.systemContract.OmmToken,
      ScoreMethodNames.GET_MIN_STAKE, {}, IconTransactionType.READ);

    const res = await this.iconApiService.iconService.call(tx).execute();

    log.debug("getOmmTokenMinStakeAmount: ", res);

    return hexToNormalisedNumber(res);
  }

  public async getUserTokenBalance(token: Irc2Token): Promise<BigNumber> {
    this.checkerService.checkUserLoggedIn();

    return this.getTokenBalance(token, this.storeService.userWalletAddress())
  }

  public async getTokenBalance(token: Irc2Token, address: Address): Promise<BigNumber> {
    let balance: BigNumber;
    if ("ICX" === token.symbol) {
      balance = await this.iconApiService.getIcxBalance(address);
    } else {
      balance = await this.getIRC2TokenBalance(token, address);
    }

    // set asset balance
    log.debug(`${address} ${token.symbol} balance: ${balance}`);

    return balance;
  }

  private async getIRC2TokenBalance(token: Irc2Token, address: Address): Promise<BigNumber> {
    // make sure token address is initialised
    if (!token.addressInitialised()) {
      throw new Error(token.addressError())
    }

    const method = token.symbol === "BALN" ? ScoreMethodNames.AVAILABLE_BALANCE_OF : ScoreMethodNames.BALANCE_OF;

    const tx = this.iconApiService.buildTransaction("",  token.address!,
      method, {
        _owner: address
      }, IconTransactionType.READ);

    const res = await this.iconApiService.iconService.call(tx).execute();
    const balance = hexToNormalisedNumber(res, token.decimals);

    return balance;
  }

  /**
   * @description Get total validator reward
   * @return  Total validator reward amount in BigNumber
   */
  public async getTotalValidatorRewards(): Promise<BigNumber> {
    this.checkerService.checkAllAddressesLoaded()

    const tx = this.iconApiService.buildTransaction("",  this.storeService.allAddresses?.systemContract.FeeDistribution!,
        ScoreMethodNames.GET_VALIDATOR_COLLECTED_FEE, {}, IconTransactionType.READ);

    const amount = await this.iconApiService.iconService.call(tx).execute();

    return hexToNormalisedNumber(amount);
  }


  /**
   * @description Get total number of bOmm holders
   * @return number of bOmm holders in BigNumber
   */
  public async getBommHoldersCount(): Promise<BigNumber> {
    this.checkerService.checkAllAddressesLoaded()

    const tx = this.iconApiService.buildTransaction("",  this.storeService.allAddresses?.systemContract.bOMM!,
        ScoreMethodNames.ACTIVE_USERS_COUNT, {}, IconTransactionType.READ);

    const amount = await this.iconApiService.iconService.call(tx).execute();

    return hexToBigNumber(amount);
  }

  /**
   * @description Get actual prep delegations
   * @return Map of prep address to the votes in ICX
   */
  public async getActualPrepDelegations(): Promise<Map<PrepAddress, BigNumber>> {
    this.checkerService.checkAllAddressesLoaded()

    const tx = this.iconApiService.buildTransaction("",  this.storeService.allAddresses?.systemContract.Staking!,
        ScoreMethodNames.GET_ACTUAL_PREP_DELEGATIONS, {}, IconTransactionType.READ);

    const res: Record<PrepAddress, HexString> = await this.iconApiService.iconService.call(tx).execute();

    return Mapper.mapPrepDelegationsRecordToMap(res);
  }

  /**
   * @description Get actual user prep delegations
   * @return Map of user prep address to the votes in ICX
   */
  public async getActualUserDelegationPercentage(): Promise<Map<PrepAddress, BigNumber>> {
    this.checkerService.checkAllAddressesLoaded()

    const params = {
      user: this.storeService.userWalletAddress()
    }

    const tx = this.iconApiService.buildTransaction("",  this.storeService.allAddresses?.systemContract.Staking!,
        ScoreMethodNames.GET_ACTUAL_USER_PREP_DELEGATIONS, params, IconTransactionType.READ);

    const res: Record<PrepAddress, HexString> = await this.iconApiService.iconService.call(tx).execute();

    return Mapper.mapUserSicxDelegationsRecordToMap(res);
  }

  /**
   * @description Get prep bOmm delegations
   * @return Map of user prep address to the votes in ICX
   */
  public async getAllPrepsBommDelegations(): Promise<Map<PrepAddress, BigNumber>> {
    this.checkerService.checkAllAddressesLoaded();

    const tx = this.iconApiService.buildTransaction("",  this.storeService.allAddresses?.systemContract.Staking!,
        ScoreMethodNames.GET_BOMM_DELEGATIONS, {}, IconTransactionType.READ);

    const res: Record<PrepAddress, HexString> = await this.iconApiService.iconService.call(tx).execute();

    return Mapper.mapPrepDelegationsRecordToMap(res);
  }

  /**
   * @description Get bOmm votes delegated to validator address
   * @return BigNumber
   */
  public async getPrepBommDelegation(): Promise<BigNumber> {
    this.checkerService.checkUserLoggedInAndAllAddressesLoaded();

    const params = {
      _prep: this.storeService.userWalletAddress()
    };

    const tx = this.iconApiService.buildTransaction("",  this.storeService.allAddresses?.systemContract.Delegation!,
        ScoreMethodNames.PREP_VOTES, params, IconTransactionType.READ);

    const amount = await this.iconApiService.iconService.call(tx).execute();

    return hexToNormalisedNumber(amount);
  }




  /**
   * @description Get list of PReps
   * @return  Returns the status of all registered P-Rep candidates in descending order by delegated ICX amount
   */
  public async getListOfPreps(startRanking = 1, endRanking = 100): Promise<PrepList> {
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
      _user: this.storeService.userWalletAddress()
    };

    const tx = this.iconApiService.buildTransaction("",  this.storeService.allAddresses!.systemContract.Delegation,
      ScoreMethodNames.GET_USER_DELEGATION_DETAILS, params, IconTransactionType.READ);

    const res: DelegationPreference[] = await this.iconApiService.iconService.call(tx).execute();

    log.debug("getUserDelegationDetails: ", res);

    return Mapper.mapUserDelegations(res, this.storeService.prepList?.prepAddressToNameMap);
  }

  /**
   * @description Get delegation SCORE working total supply of bOMM
   * @return BigNumber - delegations working total supply of bOMM
   */
  public async getDelegationWorkingTotalSupplyOfbOmm(): Promise<BigNumber> {
    this.checkerService.checkAllAddressesLoaded();

    const tx = this.iconApiService.buildTransaction("",  this.storeService.allAddresses!.systemContract.Delegation,
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

    const tx = this.iconApiService.buildTransaction("",  this.storeService.allAddresses!.systemContract.Rewards,
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

    const tx = this.iconApiService.buildTransaction("",  this.storeService.allAddresses!.systemContract.Delegation,
      ScoreMethodNames.GET_USER_WORKING_BALANCE, {
       user: this.storeService.userWalletAddress()
      }, IconTransactionType.READ);

    const res: string = await this.iconApiService.iconService.call(tx).execute();

    log.debug("getUserDelegationWorkingSupplyOfbOmm: ", res);

    return hexToNormalisedNumber(res);
  }

  /**
   * @description Get users locked OMM token amount
   * @return LockedOmm - Locked OMM tokens amount and end
   */
  public async getUserLockedOmmTokens(): Promise<LockedOmm> {
    this.checkerService.checkUserLoggedInAndAllAddressesLoaded();

    const params = {
      _owner: this.storeService.userWalletAddress()
    };

    const tx = this.iconApiService.buildTransaction("",  this.storeService.allAddresses!.systemContract.bOMM,
      ScoreMethodNames.GET_LOCKED_OMM, params, IconTransactionType.READ);

    const res: ILockedOmm = await this.iconApiService.iconService.call(tx).execute();

    return Mapper.mapLockedOmm(res);
  }

  /**
   * @description Get OMM token balance details
   * @return OmmTokenBalanceDetails - Omm token balance details
   */
  public async getOmmTokenBalanceDetails(): Promise<OmmTokenBalanceDetails> {
    this.checkerService.checkUserLoggedInAndAllAddressesLoaded();

    const params = {
      _owner: this.storeService.userWalletAddress(),
    };

    const tx = this.iconApiService.buildTransaction("",  this.storeService.allAddresses!.systemContract.OmmToken,
        ScoreMethodNames.GET_OMM_TOKEN_BALANCE_DETAILS, params, IconTransactionType.READ);

    log.debug("Executing getOmmTokenBalanceDetails tx: ", tx);
    try {
      const res = await this.iconApiService.iconService.call(tx).execute();
      log.debug("getOmmTokenBalanceDetails: ", res);

      return Mapper.mapUserOmmTokenBalanceDetails(res);
    } catch (e) {
      log.error(e);
      throw e;
    }
  }

  /**
   * @description Get users bOMM balance
   * @return BigNumber - Users bOMM balance as BigNumber
   */
  public async getUsersbOmmBalance(): Promise<BigNumber> {
    this.checkerService.checkUserLoggedInAndAllAddressesLoaded();

    const params = {
      _owner: this.storeService.userWalletAddress() }
    ;

    const tx = this.iconApiService.buildTransaction("",  this.storeService.allAddresses!.systemContract.bOMM,
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

    const tx = this.iconApiService.buildTransaction("",  this.storeService.allAddresses!.systemContract.bOMM,
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

    const tx = this.iconApiService.buildTransaction("",  this.storeService.allAddresses!.systemContract.Governance,
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

    const tx = this.iconApiService.buildTransaction("",  this.storeService.allAddresses!.systemContract.Governance,
      ScoreMethodNames.GET_VOTERS_COUNT, params, IconTransactionType.READ);

    const res = await this.iconApiService.iconService.call(tx).execute();

    log.debug(`getVotersCount = ${res}`);

    return Mapper.mapVotersCount(res);
  }

  /**
   * @description Get votes of users
   * @return  Vote - the numbers represents OMM tokens in EXA
   */
  public async getVotesOfUsers(proposalId?: string): Promise<Vote> {
    this.checkerService.checkUserLoggedInAndAllAddressesLoaded();

    const params = {
      vote_index: IconConverter.toHex(proposalId ? parseInt(proposalId) : 0),
      user: this.storeService.userWalletAddress()
    };

    const tx = this.iconApiService.buildTransaction("",  this.storeService.allAddresses!.systemContract.Governance,
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
      address: this.storeService.userWalletAddress()
    };

    const tx = this.iconApiService.buildTransaction("",  this.storeService.allAddresses!.systemContract.Governance,
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
    const tx = this.iconApiService.buildTransaction("",  this.storeService.allAddresses!.systemContract.Governance,
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
    const tx = this.iconApiService.buildTransaction("",  this.storeService.allAddresses!.systemContract.Governance,
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
    const tx = this.iconApiService.buildTransaction("",  this.storeService.allAddresses!.systemContract.Governance,
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
      _address: this.storeService.userWalletAddress()
    };

    const tx = this.iconApiService.buildTransaction("",  this.storeService.allAddresses!.systemContract.Governance,
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

    const tx = this.iconApiService.buildTransaction("",  this.storeService.allAddresses!.systemContract.Governance,
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

    const tx = this.iconApiService.buildTransaction("",  this.storeService.allAddresses!.systemContract.Governance,
      ScoreMethodNames.TOTAL_STAKED_OMM_AT, params, IconTransactionType.READ);

    const res = await this.iconApiService.iconService.call(tx).execute();

    log.debug(`getTotalStakedOmmAt = ${res}`);

    return hexToNormalisedNumber(res);
  }

  public async getTotalOmmSupply(): Promise<BigNumber> {
    this.checkerService.checkAllAddressesLoaded();

    const tx = this.iconApiService.buildTransaction("",  this.storeService.allAddresses!.systemContract.OmmToken,
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

    const tx = this.iconApiService.buildTransaction("",  this.storeService.allAddresses!.systemContract.Governance,
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

    const tx = this.iconApiService.buildTransaction("",  this.storeService.allAddresses!.systemContract.Governance,
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
