import { Injectable } from '@angular/core';
import {Wallet} from "../models/classes/Wallet";
import {AllAddresses} from "../models/interfaces/AllAddresses";
import {Proposal} from "../models/classes/Proposal";
import BigNumber from "bignumber.js";
import {PrepList} from "../models/classes/Preps";
import {YourPrepVote} from "../models/classes/YourPrepVote";
import {Irc2Token} from "../models/classes/Irc2Token";
import {ModalPayload, TokenSymbol} from "../models/Types/ModalTypes";
import {ModalAction} from "../models/classes/ModalAction";

@Injectable({
  providedIn: 'root'
})
export class PersistenceService {

  activeWallet?: Wallet;

  public allAddresses?: AllAddresses;

  public voteDefinitionFee = new BigNumber("0");
  public voteDefinitionCriterion = new BigNumber("0");
  public proposalList: Proposal[] = [];
  public voteDuration = new BigNumber("-1");

  public sicxTodayRate = new BigNumber(0);

  public minOmmLockAmount = new BigNumber("1");
  public totalStakedOmm = new BigNumber("0");
  public totalSuppliedOmm = new BigNumber("0");
  public bOmmTotalSupply = new BigNumber("0");
  public ommPriceUSD = new BigNumber("-1"); // -1 indicates that ommPriceUSD is not set

  public tokenUsdPrices = new Map<TokenSymbol, BigNumber>();

  public prepList?: PrepList;

  // USER DATA
  public yourVotesPrepList: YourPrepVote[] = [];

  public lastModalPayload?: ModalPayload;

  constructor() { }

  public logoutUser(): void {
    // clean up user states

    this.activeWallet = undefined;

    // reset values
    this.yourVotesPrepList = [];

  }

  public userLoggedIn(): boolean {
    return this.activeWallet != null;
  }

  public getUserTokenBalance(token: Irc2Token): BigNumber {
    return this.activeWallet?.irc2TokenBalancesMap.get(token.symbol) ?? new BigNumber(0);
  }

  public getTokenUsdPrice(token: Irc2Token): BigNumber {
    return this.tokenUsdPrices.get(token.symbol) ?? new BigNumber(0);
  }

  public getLastModalAction(): ModalPayload | undefined {
    return this.lastModalPayload;
  }

}
