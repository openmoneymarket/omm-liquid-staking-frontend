import {Component, Input, OnDestroy, OnInit} from '@angular/core';
import { CommonModule } from '@angular/common';
import BigNumber from "bignumber.js";
import {StateChangeService} from "../../services/state-change.service";
import {Subscription} from "rxjs";
import {Calculations} from "../../common/calculations";
import {UsFormatPipe} from "../../pipes/us-format.pipe";
import {PersistenceService} from "../../services/persistence.service";

@Component({
  selector: 'app-voting-power-overview',
  standalone: true,
  imports: [CommonModule, UsFormatPipe],
  templateUrl: './voting-power-overview.component.html'
})
export class VotingPowerOverviewComponent implements OnInit, OnDestroy {

  _userDynamicDelegationWorkingbOmmBalance!: BigNumber

  @Input({ required: true }) userDelegationWorkingbOmmBalance!: BigNumber;
  @Input({ required: true }) set userDynamicDelegationWorkingbOmmBalance(value: BigNumber) {
    this._userDynamicDelegationWorkingbOmmBalance = value;
    this.refreshValues();
  }
  get userDynamicDelegationWorkingbOmmBalance(): BigNumber { return this._userDynamicDelegationWorkingbOmmBalance};
  @Input({ required: true }) lockAdjustActive!: boolean;

  yourVotingPower = new BigNumber(0);
  votingPower = new BigNumber(0);
  ommVotingPower = new BigNumber(0);
  bOmmTotalSupply = new BigNumber(0);
  delegationbOmmWorkingTotalSupply = new BigNumber(0);
  totalSicxAmount = new BigNumber(0);
  todaySicxRate: BigNumber = new BigNumber(0);

  // Subscriptions
  totalSicxAmountSub?: Subscription;
  todayRateSub?: Subscription;
  delegationOmmTotalWorkingSupplySub?: Subscription;
  bOmmTotalSupplySub?: Subscription;
  afterUserDataReload?: Subscription;

  constructor(private stateChangeService: StateChangeService,
              private persistenceService: PersistenceService) {
  }

  ngOnInit(): void {
    this.refreshValues();
    this.registerSubscriptions();
  }

  ngOnDestroy(): void {
    this.totalSicxAmountSub?.unsubscribe();
    this.todayRateSub?.unsubscribe();
    this.delegationOmmTotalWorkingSupplySub?.unsubscribe();
    this.bOmmTotalSupplySub?.unsubscribe();
    this.afterUserDataReload?.unsubscribe();
  }

  private registerSubscriptions(): void {
    this.subscribeToTotalSicxAmountChange();
    this.subscribeToSicxTodayRateChange();
    this.subscribeToDelegationbOmmTotalWorkingSupplyChange();
    this.subscribeTobOmmTotalSupplyChange();
    this.subscribeToAfterUserDataReload();
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

  private refreshValues(): void {
    this.calculateOmmVotingPower();
    this.calculateVotingPower();
    this.calculateYourVotingPower();
  }

  private calculateYourVotingPower(): void {
    if (this.persistenceService.userLoggedIn() && this.votingPower.gt(0)) {
      this.yourVotingPower = Calculations.usersVotingPower(this.ommVotingPower, this.delegationbOmmWorkingTotalSupply,
          this.userDelegationWorkingbOmmBalance, this.userDynamicDelegationWorkingbOmmBalance);
    }
  }

  private calculateVotingPower(): void {
    if (this.ommVotingPower.gt(0)) {
      this.votingPower = Calculations.votingPower(this.ommVotingPower, this.userDelegationWorkingbOmmBalance,
          this.delegationbOmmWorkingTotalSupply, this.userDynamicDelegationWorkingbOmmBalance);
    }
  }

  private calculateOmmVotingPower(): void {
    if (this.todaySicxRate.gt(0) && this.totalSicxAmount.gt(0)) {
      this.ommVotingPower = Calculations.ommVotingPower(this.totalSicxAmount, this.todaySicxRate);
    }
  }

}
