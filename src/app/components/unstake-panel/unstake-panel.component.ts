import {Component, ElementRef, Input, OnDestroy, OnInit, ViewChild} from '@angular/core';
import { CommonModule } from '@angular/common';
import {UsFormatPipe} from "../../pipes/us-format.pipe";
import BigNumber from "bignumber.js";
import {ChartService} from "../../services/chart.service";
import {PersistenceService} from "../../services/persistence.service";
import {usLocale} from "../../common/formats";
import {convertSICXToICX, getPrettyTimeForBlockHeightDiff} from "../../common/utils";
import {BaseClass} from "../../models/classes/BaseClass";
import {ModalType} from "../../models/enums/ModalType";
import {StateChangeService} from "../../services/state-change.service";
import {UnstakeWaitSicxPayload} from "../../models/classes/UnstakeWaitSicxPayload";
import {Subscription} from "rxjs";
import {UserUnstakeInfo} from "../../models/classes/UserUnstakeInfo";
import {BalancedDexFees} from "../../models/classes/BalancedDexFees";
import {UnstakeInstantSicxPayload} from "../../models/classes/UnstakeInstantSicxPayload";
import {RoundDownPercentPipe} from "../../pipes/round-down-percent.pipe";
import {PoolStats} from "../../models/classes/PoolStats";
import {ClaimIcxPayload} from "../../models/classes/ClaimIcxPayload";

@Component({
  selector: 'app-unstake-panel',
  standalone: true,
    imports: [CommonModule, UsFormatPipe, RoundDownPercentPipe],
  templateUrl: './unstake-panel.component.html'
})
export class UnstakePanelComponent extends BaseClass implements OnInit, OnDestroy {

  unstakingChartEl: any;
  unstakingChart: any;
  @ViewChild("unstkApyChart", { static: true}) set b(b: ElementRef) { this.unstakingChartEl = b.nativeElement; }

  @Input({ required: true}) active!: boolean;
  @Input({ required: true}) userSicxBalance!: BigNumber;
  @Input({ required: true}) todaySicxRate!: BigNumber;

  unstakeInputAmount: string = "";
  receivedIcxAmount: string = "0";
  instantReceivedIcxAmount: string = "0";
  feeAmount: BigNumber = new BigNumber(0);

  userUnstakeInfo?: UserUnstakeInfo;
  claimableIcx?: BigNumber;
  untilBlockHeightTime?: string;
  balancedDexFees?: BalancedDexFees;
  icxSicxPoolStats?: PoolStats;

  // Subscriptions
  userUnstakeInfoSub?: Subscription;
  claimableIcxSub?: Subscription;
  userLoginSub?: Subscription;
  latestBlockHeightSub?: Subscription;
  balancedDexFeeSub?: Subscription;
  icxSicxPoolStatsSub?: Subscription;

  constructor(private chartService: ChartService,
              private persistenceService: PersistenceService,
              public stateChangeService: StateChangeService) {
    super();
  }

  private unstakeWaitActive = true;

  ngOnInit(): void {
    this.registerSubscriptions();

    this.chartService.initUnstakingApyChart(this.unstakingChartEl, this.unstakingChart);
  }

  ngOnDestroy(): void {
    // cleanup subscriptions and chart
    this.userUnstakeInfoSub?.unsubscribe();
    this.claimableIcxSub?.unsubscribe();
    this.latestBlockHeightSub?.unsubscribe();
    this.userLoginSub?.unsubscribe();
    this.balancedDexFeeSub?.unsubscribe();
    this.icxSicxPoolStatsSub?.unsubscribe();

    this.unstakingChart?.remove();
  }

  registerSubscriptions(): void {
    this.subscribeToLatestBlockHeightChange();
    this.subscribeToUserUnstakeInfoChange();
    this.subscribeToClaimableIcxChange();
    this.subscribeToUserLoginChange();
    this.subscribeToBalancedDexFeeChange();
    this.subscribeIcxSicxPoolStatsChange();
  }

  subscribeIcxSicxPoolStatsChange(): void {
    this.icxSicxPoolStatsSub = this.stateChangeService.icxSicxPoolStatsChange$.subscribe(value => {
      this.icxSicxPoolStats = value;
    });
  }

  subscribeToBalancedDexFeeChange(): void {
    this.userUnstakeInfoSub = this.stateChangeService.balancedDexFeesChange$.subscribe(fees => {
      this.balancedDexFees = fees;
    });
  }

  subscribeToLatestBlockHeightChange(): void {
    this.latestBlockHeightSub = this.stateChangeService.lastBlockHeightChange$.subscribe(block => {
      this.untilBlockHeightTime = this.getPrettyUntilBlockHeightTime(this.userUnstakeInfo, new BigNumber(block.height) ?? "");
    });
  }
  subscribeToUserUnstakeInfoChange(): void {
    this.userUnstakeInfoSub = this.stateChangeService.userUnstakeInfoChange$.subscribe(data => {
      this.userUnstakeInfo = data;
    });
  }

  subscribeToUserLoginChange(): void {
    this.userLoginSub = this.stateChangeService.loginChange$.subscribe(value => {
      if (!value) {
        this.resetUserState();
      }
    });
  }

  private resetUserState(): void {
    this.userUnstakeInfo = undefined;
    this.claimableIcx = undefined;
    this.untilBlockHeightTime = undefined;
  }

  subscribeToClaimableIcxChange(): void {
    this.claimableIcxSub = this.stateChangeService.userClaimableIcxChange$.subscribe(value => this.claimableIcx = value);
  }

  onUnstakeClick(e: MouseEvent) {
    e.stopPropagation();

    if (this.persistenceService.userLoggedIn()) {
      if (this.unstakeInputAmount && this.receivedIcxAmount) {
        if (this.unstakeWaitActive) {
          this.stateChangeService.modalUpdate(ModalType.UNSTAKE_WAIT_SICX, new UnstakeWaitSicxPayload(
              new BigNumber(this.unstakeInputAmount),
              new BigNumber(this.receivedIcxAmount),
          ));
        } else {
          console.log("fee:", this.feeAmount.toNumber());
          this.stateChangeService.modalUpdate(ModalType.UNSTAKE_INSTANT_SICX, new UnstakeInstantSicxPayload(
              new BigNumber(this.unstakeInputAmount),
              new BigNumber(this.instantReceivedIcxAmount),
              new BigNumber(this.feeAmount)
          ));
        }
      }
    } else {
      this.stateChangeService.modalUpdate(ModalType.SIGN_IN);
    }
  }

  onClaimIcxClick(e: MouseEvent) {
    e.stopPropagation();

    if (this.userLoggedIn() && this.claimableIcx && this.claimableIcx.gt(0)) {
      this.stateChangeService.modalUpdate(ModalType.CLAIM_ICX, new ClaimIcxPayload(this.claimableIcx));
    }
  }

  onUnstakeInputKeyUp(e: KeyboardEvent | ClipboardEvent | FocusEvent) {
    this.delay(() => {
      this.processUnstakeInput(e);
    }, 800 );
  }

  processUnstakeInput(e: KeyboardEvent | ClipboardEvent | FocusEvent) {
    const unstakeInputAmount = +usLocale.from((<HTMLInputElement>e.target).value);

    if (!unstakeInputAmount || unstakeInputAmount <= 0) {
      this.unstakeInputAmount = "";
    } else {
      this.unstakeInputAmount = usLocale.to(unstakeInputAmount);
      const receivedIcxBigNumAmount = convertSICXToICX(new BigNumber(unstakeInputAmount), this.todaySicxRate);
      this.receivedIcxAmount = usLocale.to(+receivedIcxBigNumAmount.toFixed(2));

      if (this.balancedDexFees) {
        const instantFeeAmount = receivedIcxBigNumAmount.multipliedBy(this.balancedDexFees.icxTotal);
        this.instantReceivedIcxAmount = usLocale.to(+(receivedIcxBigNumAmount.minus(instantFeeAmount)).toFixed(2));
        this.feeAmount = instantFeeAmount;
      }
    }
  }

  instantIcxLiquidity(): BigNumber {
    return this.icxSicxPoolStats?.totalSupply ?? new BigNumber(0);
  }

  onUnstakeWaitClick(e: MouseEvent) {
    e.stopPropagation();

    this.unstakeWaitActive = true;
  }

  onUnstakeInstantClick(e: MouseEvent) {
    e.stopPropagation();

    this.unstakeWaitActive = false;
  }

  unstakeWaitIsActive(): boolean {
    return this.unstakeWaitActive;
  }

  unstakeInstantIsActive(): boolean {
    return !this.unstakeWaitActive;
  }

  userLoggedIn(): boolean {
    return this.persistenceService.userLoggedIn();
  }

  shouldShowUnstakeInfo(): boolean {
    return this.userUnstakeInfo != undefined
        && this.userUnstakeInfo.totalUnstakeAmount.gt(0)
        && this.untilBlockHeightTime != undefined;
  }

  getPrettyUntilBlockHeightTime(userUnstakeInfo: UserUnstakeInfo | undefined, currentBlockHeight: BigNumber): string | undefined {
    if (userUnstakeInfo) {
      return getPrettyTimeForBlockHeightDiff(currentBlockHeight, userUnstakeInfo.lastUnstakeBlockHeight);
    } else {
      return undefined;
    }
  }
}
