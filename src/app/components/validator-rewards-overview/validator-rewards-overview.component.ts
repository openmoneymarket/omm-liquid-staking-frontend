import {Component, Input, OnDestroy, OnInit} from '@angular/core';
import { CommonModule } from '@angular/common';
import {Subscription} from "rxjs";
import {StateChangeService} from "../../services/state-change.service";
import BigNumber from "bignumber.js";
import {UsFormatPipe} from "../../pipes/us-format.pipe";
import {HideElementPipe} from "../../pipes/hide-element-pipe";
import {ModalType} from "../../models/enums/ModalType";
import {StoreService} from "../../services/store.service";
import {ClaimRewardsPayload} from "../../models/classes/ClaimRewardsPayload";
import {ICX} from "../../common/constants";
import {Calculations} from "../../common/calculations";
import {PrepAddress} from "../../models/Types/ModalTypes";
import {convertICXTosICX} from "../../common/utils";

@Component({
  selector: 'app-validator-rewards-overview',
  standalone: true,
  imports: [CommonModule, UsFormatPipe, HideElementPipe],
  templateUrl: './validator-rewards-overview.component.html'
})
export class ValidatorRewardsOverviewComponent implements OnInit, OnDestroy {

  userAccumulatedFee = new BigNumber(0);
  userValidatorPrepBommDelegation = new BigNumber(0);
  votingPower = new BigNumber(0);
  ommVotingPower = new BigNumber(0);
  bOmmTotalSupply = new BigNumber(0);
  delegationbOmmWorkingTotalSupply = new BigNumber(0);
  totalSicxAmount = new BigNumber(0);
  todaySicxRate: BigNumber = new BigNumber(0);
  bOMMdelegationIcx = new BigNumber(0);
  userDelegationWorkingbOmmBalance = new BigNumber(0);
  sicxDelegation = new BigNumber(0);
  icxDelegation = new BigNumber(0);
  actualPrepDelegations = new Map<PrepAddress, BigNumber>(); // prep address to ICX delegated

  // Subscriptions
  userAccumulatedFeeSub?: Subscription;
  loginChangeSub?: Subscription;
  userValidatorPrepBommDelegationSub?: Subscription;
  totalSicxAmountSub?: Subscription;
  todayRateSub?: Subscription;
  delegationOmmTotalWorkingSupplySub?: Subscription;
  bOmmTotalSupplySub?: Subscription;
  afterUserDataReload?: Subscription;
  userDelegationWorkingbOmmSub?: Subscription;
  actualPrepDelegationsSub?: Subscription;
  constructor(private stateChangeService: StateChangeService,
              private storeService: StoreService) {
  }

  // TODO reset user values in all components on logout

  ngOnInit(): void {
    this.registerSubscriptions()
  }

  ngOnDestroy(): void {
    this.userAccumulatedFeeSub?.unsubscribe();
    this.loginChangeSub?.unsubscribe();
    this.userValidatorPrepBommDelegationSub?.unsubscribe();
    this.totalSicxAmountSub?.unsubscribe();
    this.todayRateSub?.unsubscribe();
    this.delegationOmmTotalWorkingSupplySub?.unsubscribe();
    this.bOmmTotalSupplySub?.unsubscribe();
    this.afterUserDataReload?.unsubscribe();
    this.userDelegationWorkingbOmmSub?.unsubscribe();
    this.actualPrepDelegationsSub?.unsubscribe();
  }

  private registerSubscriptions(): void {
    this.subscribeToUserAccumulatedFeeChange();
    this.subscribeToLoginChange();
    this.subscribeToUserValidatorPrepBommDelegationChange();
    this.subscribeToTotalSicxAmountChange();
    this.subscribeToSicxTodayRateChange();
    this.subscribeToDelegationbOmmTotalWorkingSupplyChange();
    this.subscribeTobOmmTotalSupplyChange();
    this.subscribeToAfterUserDataReload();
    this.subscribeToUserDelegationWorkingbOmmChange();
    this.subscribeToActualPrepDelegationsChange();
  }

  private resetUserStateValues(): void {
    this.userAccumulatedFee = new BigNumber(0);
  }

  private subscribeToActualPrepDelegationsChange(): void {
    this.actualPrepDelegationsSub = this.stateChangeService.actualPrepDelegationsChange$.subscribe(value => {
      this.actualPrepDelegations = value;
      this.refreshValues();
    })
  }

  subscribeToUserDelegationWorkingbOmmChange(): void {
    this.userDelegationWorkingbOmmSub = this.stateChangeService.userDelegationWorkingbOmmChange$.subscribe(value => {
      this.userDelegationWorkingbOmmBalance = value;
      this.refreshValues();
    })
  }

  subscribeToAfterUserDataReload(): void {
    this.afterUserDataReload = this.stateChangeService.afterUserDataReload$.subscribe(() => {
      this.refreshValues();
    });
  }

  private subscribeTobOmmTotalSupplyChange(): void {
    this.bOmmTotalSupplySub = this.stateChangeService.bOmmTotalSupplyChange$.subscribe(value => {
      this.bOmmTotalSupply = value;
      this.refreshValues();
    });
  }

  private subscribeToDelegationbOmmTotalWorkingSupplyChange(): void {
    this.delegationOmmTotalWorkingSupplySub = this.stateChangeService.delegationbOmmTotalWorkingSupplyChange$.subscribe(value => {
      this.delegationbOmmWorkingTotalSupply = value;
      this.refreshValues();
    })
  }

  private subscribeToTotalSicxAmountChange(): void {
    this.totalSicxAmountSub = this.stateChangeService.totalSicxAmountChange$.subscribe(value => {
      this.totalSicxAmount = value;
      this.refreshValues();
    });
  }

  private subscribeToSicxTodayRateChange(): void {
    this.todayRateSub = this.stateChangeService.sicxTodayRateChange$.subscribe(todayRate => {
      this.todaySicxRate = todayRate;
      this.refreshValues();
    });
  }

  private subscribeToUserValidatorPrepBommDelegationChange(): void {
    this.userValidatorPrepBommDelegationSub = this.stateChangeService.prepBommDelegationChange$.subscribe(value => {
      this.userValidatorPrepBommDelegation = value;
    });
  }

  subscribeToLoginChange(): void {
    this.loginChangeSub = this.stateChangeService.loginChange$.subscribe((wallet) => {
      // logout
      if (!wallet) {
        this.resetUserStateValues();
      }
    });
  }

  private subscribeToUserAccumulatedFeeChange(): void {
    this.userAccumulatedFeeSub = this.stateChangeService.userAccumulatedFeeChange$.subscribe(fee => {
      this.userAccumulatedFee = fee;
    })
  }

  private refreshValues(): void {
    this.calculateOmmVotingPower();
    this.calculateVotingPower();
    this.calculateBommDelegationIcx();
    this.calculateIcxAndSicxDelegation();
  }

  private calculateIcxAndSicxDelegation(): void {
    if (this.userLoggedIn() && this.actualPrepDelegations.size > 0) {
      this.icxDelegation = this.actualPrepDelegations.get(this.storeService.userWalletAddress()) ?? new BigNumber(0);
      this.sicxDelegation = convertICXTosICX(this.icxDelegation, this.todaySicxRate);
    }
  }

  private calculateBommDelegationIcx(): void {
    if (this.votingPower.gt(0) && this.userValidatorPrepBommDelegation.gt(0)) {
      this.bOMMdelegationIcx = this.userValidatorPrepBommDelegation.multipliedBy(this.votingPower);
    }
  }

  private calculateVotingPower(): void {
    if (this.ommVotingPower.gt(0)) {
      this.votingPower = Calculations.votingPower(this.ommVotingPower, this.userDelegationWorkingbOmmBalance, this.delegationbOmmWorkingTotalSupply);
    }
  }

  private calculateOmmVotingPower(): void {
    if (this.todaySicxRate.gt(0) && this.totalSicxAmount.gt(0)) {
      this.ommVotingPower = Calculations.ommVotingPower(this.totalSicxAmount, this.todaySicxRate);
    }
  }

  onClaimRewardsClick(e: MouseEvent): void {
    e.stopPropagation();

    if (this.userLoggedIn() && this.userAccumulatedFee.gt(0)) {
      this.stateChangeService.modalUpdate(ModalType.CLAIM_ICX, new ClaimRewardsPayload(this.userAccumulatedFee, this.storeService.getUserTokenBalance(ICX)));
    }
  }

  public userLoggedIn(): boolean {
    return this.storeService.userLoggedIn();
  }
}
