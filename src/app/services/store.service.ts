import { Injectable } from "@angular/core";
import { Wallet } from "../models/classes/Wallet";
import { AllAddresses } from "../models/interfaces/AllAddresses";
import BigNumber from "bignumber.js";
import { PrepList } from "../models/classes/Preps";
import { YourPrepVote } from "../models/classes/YourPrepVote";
import { Irc2Token } from "../models/classes/Irc2Token";
import { ModalPayload, TokenSymbol } from "../models/Types/ModalTypes";
import { UserUnstakeInfo } from "../models/classes/UserUnstakeInfo";
import { Vote } from "../models/classes/Vote";
import { IProposalScoreDetails } from "../models/interfaces/IProposalScoreDetails";

@Injectable({
  providedIn: "root",
})
export class StoreService {
  activeWallet?: Wallet;

  public allAddresses?: AllAddresses;

  public proposalScoreDetailsMap = new Map<string, IProposalScoreDetails[]>();

  public sicxTodayRate = new BigNumber(0);

  public minOmmLockAmount = new BigNumber("1");

  public tokenUsdPrices = new Map<TokenSymbol, BigNumber>();

  public prepList?: PrepList;

  public lastModalPayload?: ModalPayload;

  // USER DATA
  public yourVotesPrepList: YourPrepVote[] = [];
  public userUnstakeInfo?: UserUnstakeInfo;
  public userVotingWeightForProposal = new Map<string, BigNumber>(); // proposalId to voting weight
  public userProposalVotes = new Map<string, Vote>();
  constructor() {}

  public logoutUser(): void {
    // clean up user states

    this.activeWallet = undefined;

    // reset values
    this.yourVotesPrepList = [];
    this.userUnstakeInfo = undefined;
    this.userVotingWeightForProposal = new Map<string, BigNumber>();
    this.userProposalVotes = new Map<string, Vote>();
  }

  public userLoggedIn(): boolean {
    return this.activeWallet != null;
  }

  public userWalletAddress(): string {
    return this.activeWallet?.address ?? "";
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
