import {Injectable} from '@angular/core';
import {ScoreService} from './score.service';
import {PersistenceService} from './persistence.service';
import {StateChangeService} from "./state-change.service";
import log from "loglevel";
import {OmmService} from "./omm.service";
import {CheckerService} from "./checker.service";
import {ReloaderService} from "./reloader.service";
import {ICX, OMM, supportedTokens} from "../common/constants";
import BigNumber from "bignumber.js";
import {AllAddresses} from "../models/interfaces/AllAddresses";
import {TokenSymbol} from "../models/Types/ModalTypes";

@Injectable({
  providedIn: 'root'
})
export class DataLoaderService {

  constructor(private scoreService: ScoreService,
              private persistenceService: PersistenceService,
              private stateChangeService: StateChangeService,
              private ommService: OmmService,
              private checkerService: CheckerService,
              private reloaderService: ReloaderService) {

  }

  public loadAllScoreAddresses(): Promise<void> {
    return this.scoreService.getAllScoreAddresses().then((allAddresses: AllAddresses) => {
      this.stateChangeService.allAddressesLoadedUpdate(allAddresses);
      log.debug("Loaded all addresses: ", allAddresses);
    });
  }

  public async loadAllUserAssetsBalances(): Promise<void> {
    try {
      await Promise.all(supportedTokens.map(
        async (token) => {
          try {
            const balance = await this.scoreService.getUserAssetBalance(token);
            // commit the change
            this.stateChangeService.updateUserAssetBalance(balance, token);
          } catch (e) {
            log.error("Failed to fetch balance for " + token);
            log.error(e);
          }
      }));
    } catch (e) {
      log.debug("Failed to fetch all user asset balances!");
    }
  }

  public async loadTokenPrices(): Promise<void> {
    try {
      log.debug("loadTokenPrices..");
      const ommPrice = await this.scoreService.getReferenceData(OMM.symbol);
      const icxPrice = await this.scoreService.getReferenceData(ICX.symbol);

      const tokenPrices = new Map<TokenSymbol, BigNumber>();
      tokenPrices.set(OMM.symbol, ommPrice);
      tokenPrices.set(ICX.symbol, icxPrice);

      this.stateChangeService.tokenPricesUpdate(tokenPrices);
    } catch (e) {
      log.debug("Failed to fetch OMM price");
      log.error(e);
    }
  }

  public async loadTodaySicxRate(): Promise<void> {
    try {
      const todaySicxRate: BigNumber = await this.scoreService.getTodayRate();
      this.stateChangeService.sicxTodayRateUpdate(todaySicxRate);
    } catch (e) {
          log.error("Error in loadTodaySicxRate:");
          log.error(e);
    }
  }

  // public async loadUserLockedOmm(): Promise<void> {
  //   try {
  //     const lockedOmm = await this.scoreService.getUserLockedOmmTokens();
  //     this.stateChangeService.userLockedOmmUpdate(lockedOmm);
  //
  //     log.debug("User locked OMM: ", lockedOmm);
  //   } catch (e) {
  //     log.error("Error in loadUserLockedOmm:");
  //     log.error(e);
  //   }
  // }
  //
  // public async loadUserbOmmBalance(): Promise<void> {
  //   try {
  //     const balance = await this.scoreService.getUsersbOmmBalance();
  //     this.stateChangeService.userbOmmBalanceUpdate(balance);
  //
  //     log.debug("User bOMM balance ", balance.toString());
  //   } catch (e) {
  //     log.error("Error in loadUserbOmmBalance:");
  //     log.error(e);
  //   }
  // }
  //
  // public async loadUserDelegationWorkingbOmmBalance(): Promise<void> {
  //   try {
  //     const balance = await this.scoreService.getUserDelegationWorkingSupplyOfbOmm();
  //     this.stateChangeService.userDelegationWorkingbOmmBalanceUpdate(balance);
  //
  //     log.debug("User working bOMM balance ", balance.toString());
  //   } catch (e) {
  //     log.error("Error in loadUserDelegationWorkingbOmmBalance:");
  //     log.error(e);
  //   }
  // }

  // public async loadUserRewardsWorkingbOmmBalance(): Promise<void> {
  //   try {
  //     const balance = await this.scoreService.getUserRewardsWorkingSupplyOfbOmm();
  //     this.stateChangeService.userRewardsWorkingbOmmBalanceUpdate(balance);
  //
  //     log.debug("User working rewards bOMM balance ", balance.toString());
  //   } catch (e) {
  //     log.error("Error in loadUserRewardsWorkingbOmmBalance:");
  //     log.error(e);
  //   }
  // }

  // public async loadbOmmTotalSupply(): Promise<void> {
  //   try {
  //     const totalSupply = await this.scoreService.getTotalbOmmSupply();
  //     this.stateChangeService.bOmmTotalSupplyUpdate(totalSupply);
  //
  //     log.debug("bOMM total supply ", totalSupply.toString());
  //   } catch (e) {
  //     log.error("Error in loadbOmmTotalSupply:");
  //     log.error(e);
  //   }
  // }

  // public async loadDelegationbOmmWorkingTotalSupply(): Promise<void> {
  //   try {
  //     this.stateChangeService.delegationbOmmTotalWorkingSupplyUpdate((await this.scoreService.getDelegationWorkingTotalSupplyOfbOmm()));
  //   } catch (e) {
  //     log.error("Error in loadDelegationbOmmWorkingTotalSupply:");
  //     log.error(e);
  //   }
  // }
  //
  // public async loadRewardsbOmmWorkingTotalSupply(): Promise<void> {
  //   try {
  //     this.stateChangeService.rewardsbOmmTotalWorkingSupplyUpdate((await this.scoreService.getRewardsWorkingTotalSupplyOfbOmm()));
  //   } catch (e) {
  //     log.error("Error in loadRewardsbOmmWorkingTotalSupply:");
  //     log.error(e);
  //   }
  // }


  // public async loadUserDailyOmmRewards(): Promise<void> {
  //   try {
  //     const ommDailyRewards = await this.ommService.getUserDailyOmmRewards();
  //     this.stateChangeService.userOmmDailyRewardsUpdate(ommDailyRewards);
  //   } catch (e) {
  //     log.error(e);
  //   }
  // }

  // public async loadUserOmmTokenBalanceDetails(): Promise<void> {
  //   try {
  //     const res = await this.ommService.getOmmTokenBalanceDetails();
  //     log.debug("User Omm Token Balance Details: ", res);
  //     this.stateChangeService.updateUserOmmTokenBalanceDetails(res);
  //   } catch (e) {
  //     log.error("loadUserOmmTokenBalanceDetails:");
  //     log.error(e);
  //   }
  // }

  // public async loadUserDelegations(): Promise<void> {
  //   try {
  //     this.persistenceService.yourVotesPrepList = await this.scoreService.getUserDelegationDetails();
  //   } catch (e) {
  //     log.error("Error occurred in loadUserDelegations:");
  //     log.error(e);
  //   }
  // }

  // public loadUserUnstakingInfo(): Promise<void> {
  //   return this.scoreService.getTheUserUnstakeInfo().then(res => {
  //     this.persistenceService.userUnstakingInfo = res;
  //     log.debug("User unstake info:", res);
  //   });
  // }

  // public loadUserClaimableIcx(): Promise<void> {
  //   return this.scoreService.getUserClaimableIcx().then(amount => {
  //     this.persistenceService.userClaimableIcx = amount;
  //     log.debug("User claimable ICX: " + amount);
  //   });
  // }

  // public async loadUsersVotingWeight(): Promise<void> {
  //   try {
  //     this.persistenceService.userVotingWeight = await  this.scoreService.getUserVotingWeight();
  //     log.debug(`Users voting weight = ${this.persistenceService.userVotingWeight}`);
  //   } catch (e) {
  //     log.error("Error in loadUsersVotingWeight", e);
  //   }
  // }

  // public async loadOmmTokenPriceUSD(): Promise<void> {
  //   try {
  //     log.debug("loadOmmTokenPriceUSD..");
  //     const res = await this.scoreService.getReferenceData("OMM");
  //     this.stateChangeService.ommPriceUpdate(res);
  //   } catch (e) {
  //     log.debug("Failed to fetch OMM price");
  //     log.error(e);
  //   }
  // }

  // public async loadTotalStakedOmm(): Promise<void> {
  //   try {
  //     const res = await this.scoreService.getTotalStakedOmm();
  //     log.debug("getTotalStakedOmm (mapped): ", res);
  //
  //     this.stateChangeService.updateTotalStakedOmm(res);
  //   } catch (e) {
  //     log.error("Error in loadTotalStakedOmm:");
  //     log.error(e);
  //   }
  // }

  // public async loadVoteDefinitionFee(): Promise<void> {
  //   try {
  //     const res = await this.scoreService.getVoteDefinitionFee();
  //     log.debug("getVoteDefinitionFee (mapped): ", res);
  //
  //     this.stateChangeService.updateVoteDefinitionFee(res);
  //   } catch (e) {
  //     log.error("Error in loadVoteDefinitionFee:");
  //     log.error(e);
  //   }
  // }

  // public async loadVoteDefinitionCriterion(): Promise<void> {
  //   try {
  //     const res = await this.scoreService.getBoostedOmmVoteDefinitionCriteria();
  //     log.debug("loadVoteDefinitionCriterion (mapped): ", res);
  //
  //     this.stateChangeService.updateVoteDefinitionCriterion(res);
  //   } catch (e) {
  //     log.error("Error in loadVoteDefinitionCriterion:");
  //     log.error(e);
  //   }
  // }

  // public async loadTotalOmmSupply(): Promise<void> {
  //   try {
  //     const res = await this.scoreService.getTotalOmmSupply();
  //     log.debug("loadTotalOmmSupply (mapped): ", res);
  //
  //     this.persistenceService.totalSuppliedOmm = res;
  //   } catch (e) {
  //     log.error("Error in loadTotalOmmSupply:");
  //     log.error(e);
  //   }
  // }

  // public async loadVoteDuration(): Promise<void> {
  //   try {
  //     const res = await this.scoreService.getVoteDuration();
  //     log.debug("loadVoteDuration (mapped): ", res);
  //
  //     this.persistenceService.voteDuration = res;
  //   } catch (e) {
  //     log.error("Error in loadVoteDuration:");
  //     log.error(e);
  //   }
  // }

  // public async loadProposalList(): Promise<void> {
  //   try {
  //     const res = await this.scoreService.getProposalList();
  //     this.stateChangeService.updateProposalsList(res);
  //   } catch (e) {
  //     log.error("Error in loadProposalList:");
  //     log.error(e);
  //   }
  // }

  // public async loadUserProposalVotes(): Promise<void> {
  //   await Promise.all(this.persistenceService.proposalList.map( async (proposal) => {
  //     try {
  //       if (!proposal.proposalIsOver(this.reloaderService)) {
  //         try {
  //           const votingWeight = await this.scoreService.getUserVotingWeight(proposal.voteSnapshot);
  //           this.persistenceService.userVotingWeightForProposal.set(proposal.id, votingWeight);
  //         } catch (e) {
  //           log.error(e);
  //         }
  //       }
  //
  //       const vote: Vote = await this.scoreService.getVotesOfUsers(proposal.id);
  //
  //       if (vote.against.isGreaterThan(Utils.ZERO) || vote.for.isGreaterThan(Utils.ZERO)) {
  //         this.stateChangeService.userProposalVotesUpdate(proposal.id, vote);
  //       }
  //     } catch (e) {
  //       log.error("Failed to get user vote for proposal ", proposal);
  //       log.error(e);
  //     }
  //   }));
  // }


  // public async loadPrepList(start: number = 1, end: number = 100): Promise<void> {
  //   try {
  //     const prepList = await this.scoreService.getListOfPreps(start, end);
  //
  //     // set logos
  //     try {
  //       let logoUrl;
  //       prepList.preps?.forEach(prep => {
  //         logoUrl = environment.production ? `https://iconwat.ch/logos/${prep.address}.png` : "assets/img/logo/icx.svg";
  //         prepList.prepAddressToLogoUrlMap.set(prep.address, logoUrl);
  //         prep.setLogoUrl(logoUrl);
  //       });
  //     } catch (e) {
  //       log.debug("Failed to fetch all logos");
  //     }
  //
  //     this.persistenceService.prepList = prepList;
  //   } catch (e) {
  //     log.error("Failed to load prep list... Details:");
  //     log.error(e);
  //   }
  // }

  private refreshBridgeBalances(): void {
    window.dispatchEvent(new CustomEvent("bri.widget", {
      detail: {
        action: 'refreshBalance'
      }
    }));
  }


  public async afterUserActionReload(): Promise<void> {

    // TODO

    // reload all reserves and user asset-user reserve data
    await Promise.all([

    ]);

    this.stateChangeService.coreDataReloadUpdate();

    await this.loadUserSpecificData();
  }

  public async loadCoreData(): Promise<void> {
    this.loadCoreAsyncData();

    // TODO

    await Promise.all([
        this.loadTodaySicxRate(),
        this.loadTokenPrices(),
      // this.loadTotalOmmSupply(),
      // this.loadVoteDuration(),

    ]);

    // emit event indicating that core data was loaded
    this.stateChangeService.coreDataReloadUpdate();
  }

  public async loadUserSpecificData(): Promise<void> {
    await Promise.all([
      this.loadAllUserAssetsBalances(),
      // this.loadUserDelegations(),
    ]);

    // TODO

    // emit event that user data load has been completed
    this.stateChangeService.userDataReloadUpdate();
  }

  /**
   * Load core data async without waiting
   */
  public loadCoreAsyncData(): void {

    // TODO
    // this.loadInterestHistory();
  }
}
