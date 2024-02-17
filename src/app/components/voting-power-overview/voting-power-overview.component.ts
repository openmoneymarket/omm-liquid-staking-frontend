import { Component, Input, OnDestroy, OnInit } from "@angular/core";
import { CommonModule } from "@angular/common";
import BigNumber from "bignumber.js";
import { StateChangeService } from "../../services/state-change.service";
import { Subscription } from "rxjs";
import { Calculations } from "../../common/calculations";
import { UsFormatPipe } from "../../pipes/us-format.pipe";
import { StoreService } from "../../services/store.service";
import { RndDwnPipePipe } from "../../pipes/round-down.pipe";

@Component({
  selector: "app-voting-power-overview",
  standalone: true,
  imports: [CommonModule, UsFormatPipe, RndDwnPipePipe],
  templateUrl: "./voting-power-overview.component.html",
})
export class VotingPowerOverviewComponent implements OnInit, OnDestroy {
  _userDynamicDelegationWorkingbOmmBalance!: BigNumber;

  @Input({ required: true }) userDelegationWorkingbOmmBalance!: BigNumber;
  @Input({ required: true }) set userDynamicDelegationWorkingbOmmBalance(value: BigNumber) {
    this._userDynamicDelegationWorkingbOmmBalance = value;
    this.refreshValues();
  }
  get userDynamicDelegationWorkingbOmmBalance(): BigNumber {
    return this._userDynamicDelegationWorkingbOmmBalance;
  }
  @Input({ required: true }) lockAdjustActive!: boolean;

  yourVotingPower = new BigNumber(0);
  delegationPower = new BigNumber(0);
  totalOmmDelegationPower = new BigNumber(0);
  bOmmTotalSupply = new BigNumber(0);
  delegationbOmmWorkingTotalSupply = new BigNumber(0);
  totalSicxAmount = new BigNumber(0);
  todaySicxRate: BigNumber = new BigNumber(0);
  undelegatedIcx = new BigNumber(0);

  // Subscriptions
  totalSicxAmountSub?: Subscription;
  todayRateSub?: Subscription;
  delegationOmmTotalWorkingSupplySub?: Subscription;
  bOmmTotalSupplySub?: Subscription;
  afterUserDataReload?: Subscription;
  undelegatedIcxSub?: Subscription;

  constructor(
    private stateChangeService: StateChangeService,
    private scoreService: StoreService,
  ) {}

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
    this.undelegatedIcxSub?.unsubscribe();
  }

  private registerSubscriptions(): void {
    this.subscribeToTotalSicxAmountChange();
    this.subscribeToSicxTodayRateChange();
    this.subscribeToDelegationbOmmTotalWorkingSupplyChange();
    this.subscribeTobOmmTotalSupplyChange();
    this.subscribeToAfterUserDataReload();
    this.subscribeToUndelegatedIcxChange();
  }

  private subscribeToUndelegatedIcxChange(): void {
    this.undelegatedIcxSub = this.stateChangeService.undelegatedIcxChange$.subscribe((value) => {
      this.undelegatedIcx = value;
      this.refreshValues();
    });
  }

  subscribeToAfterUserDataReload(): void {
    this.afterUserDataReload = this.stateChangeService.afterUserDataReload$.subscribe(() => {
      this.refreshValues();
    });
  }

  private subscribeTobOmmTotalSupplyChange(): void {
    this.bOmmTotalSupplySub = this.stateChangeService.bOmmTotalSupplyChange$.subscribe((value) => {
      this.bOmmTotalSupply = value;
      this.refreshValues();
    });
  }

  private subscribeToDelegationbOmmTotalWorkingSupplyChange(): void {
    this.delegationOmmTotalWorkingSupplySub = this.stateChangeService.delegationbOmmTotalWorkingSupplyChange$.subscribe(
      (value) => {
        this.delegationbOmmWorkingTotalSupply = value;
        this.refreshValues();
      },
    );
  }

  private subscribeToTotalSicxAmountChange(): void {
    this.totalSicxAmountSub = this.stateChangeService.totalSicxAmountChange$.subscribe((value) => {
      this.totalSicxAmount = value;
      this.refreshValues();
    });
  }

  private subscribeToSicxTodayRateChange(): void {
    this.todayRateSub = this.stateChangeService.sicxTodayRateChange$.subscribe((todayRate) => {
      this.todaySicxRate = todayRate;
      this.refreshValues();
    });
  }

  private refreshValues(): void {
    this.calculateDelegationPower();
    this.calculateOmmVotingPower();
    this.calculateYourVotingPower();
  }

  private calculateYourVotingPower(): void {
    if (this.scoreService.userLoggedIn() && this.delegationPower.gt(0)) {
      this.yourVotingPower = Calculations.usersVotingPower(
        this.delegationPower,
        this.userDelegationWorkingbOmmBalance,
        this.userDynamicDelegationWorkingbOmmBalance,
      );
    }
  }

  private calculateDelegationPower(): void {
    if (this.undelegatedIcx.gt(0) && this.delegationbOmmWorkingTotalSupply.gt(0)) {
      this.delegationPower = Calculations.delegationPower(this.undelegatedIcx, this.delegationbOmmWorkingTotalSupply);
    }
  }

  private calculateOmmVotingPower(): void {
    if (this.delegationPower.gt(0) && this.delegationbOmmWorkingTotalSupply.gt(0)) {
      this.totalOmmDelegationPower = Calculations.ommTotalDelegationPower(
        this.delegationPower,
        this.delegationbOmmWorkingTotalSupply,
      );
    }
  }

  public userLoggedIn(): boolean {
    return this.scoreService.userLoggedIn();
  }
}
