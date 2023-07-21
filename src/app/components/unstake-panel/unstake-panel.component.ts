import {Component, ElementRef, Input, OnDestroy, OnInit, ViewChild} from '@angular/core';
import { CommonModule } from '@angular/common';
import {UsFormatPipe} from "../../pipes/us-format.pipe";
import BigNumber from "bignumber.js";
import {ChartService} from "../../services/chart.service";
import {StoreService} from "../../services/store.service";
import {usLocale} from "../../common/formats";
import {convertSICXToICX} from "../../common/utils";
import {BaseClass} from "../../models/classes/BaseClass";
import {ModalType} from "../../models/enums/ModalType";
import {StateChangeService} from "../../services/state-change.service";
import {UnstakeWaitSicxPayload} from "../../models/classes/UnstakeWaitSicxPayload";
import {Subscription} from "rxjs";
import {UserUnstakeInfo} from "../../models/classes/UserUnstakeInfo";
import {BalancedDexFees} from "../../models/classes/BalancedDexFees";
import {UnstakeInstantSicxPayload} from "../../models/classes/UnstakeInstantSicxPayload";
import {RndDwnNPercPipe} from "../../pipes/round-down-percent.pipe";
import {PoolStats} from "../../models/classes/PoolStats";
import {ClaimIcxPayload} from "../../models/classes/ClaimIcxPayload";
import {PrettyUntilBlockHeightTime} from "../../pipes/pretty-until-block-height-time";
import {FormsModule} from "@angular/forms";

@Component({
  selector: 'app-unstake-panel',
  standalone: true,
  imports: [CommonModule, UsFormatPipe, RndDwnNPercPipe, PrettyUntilBlockHeightTime, FormsModule],
  templateUrl: './unstake-panel.component.html'
})
export class UnstakePanelComponent extends BaseClass implements OnInit, OnDestroy {

  unstakingChartEl: any;
  unstakingChart: any;
  @ViewChild("unstkApyChart", { static: true}) set a(a: ElementRef) { this.unstakingChartEl = a.nativeElement; }

  instantCheckboxEl!: HTMLInputElement;
  @ViewChild("instantBox", { static: true}) set b(b: ElementRef) { this.instantCheckboxEl = b.nativeElement; }


  @Input({ required: true}) active!: boolean;
  @Input({ required: true}) userSicxBalance!: BigNumber;
  @Input({ required: true}) userIcxBalance!: BigNumber;
  @Input({ required: true}) todaySicxRate!: BigNumber;

  unstakeInputAmount: BigNumber = new BigNumber(0);

  receivedIcxAmount: BigNumber = new BigNumber(0);
  instantReceivedIcxAmount: BigNumber = new BigNumber(0);
  feeAmount: BigNumber = new BigNumber(0);

  userUnstakeInfo?: UserUnstakeInfo;
  claimableIcx?: BigNumber;
  currentBlockHeight?: BigNumber;
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
              private storeService: StoreService,
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
      this.currentBlockHeight = new BigNumber(block.height)    ;
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
  }

  subscribeToClaimableIcxChange(): void {
    this.claimableIcxSub = this.stateChangeService.userClaimableIcxChange$.subscribe(value => this.claimableIcx = value);
  }

  onUnstakeClick(e: MouseEvent) {
    e.stopPropagation();

    if (this.storeService.userLoggedIn()) {
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
              new BigNumber(this.feeAmount),
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
      this.stateChangeService.modalUpdate(ModalType.CLAIM_ICX, new ClaimIcxPayload(this.claimableIcx, this.userIcxBalance));
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
      this.unstakeInputAmount = new BigNumber(0);
      this.receivedIcxAmount = new BigNumber(0);
      this.instantReceivedIcxAmount= new BigNumber(0);
      this.feeAmount= new BigNumber(0);
    } else {
      this.unstakeInputAmount = new BigNumber(unstakeInputAmount);
      const receivedIcxBigNumAmount = convertSICXToICX(this.unstakeInputAmount, this.todaySicxRate);
      this.receivedIcxAmount = receivedIcxBigNumAmount;

      if (this.balancedDexFees) {
        const instantFeeAmount = receivedIcxBigNumAmount.multipliedBy(this.balancedDexFees.icxTotal);
        this.instantReceivedIcxAmount = receivedIcxBigNumAmount.minus(instantFeeAmount);
        this.feeAmount = instantFeeAmount;
      }

      this.checkForInstantLiquidityGap();
    }
  }

  private checkForInstantLiquidityGap(): void {
    // if instant unstake is active and there is not enough liquidity available compared to input unstake amount - reset to wait
    if (this.unstakeInstantIsActive() && this.instantLiquidityLtUnstakeAmount()) {
      this.unstakeWaitActive = true;
      this.instantCheckboxEl.checked = false;
    }
  }

  instantIcxLiquidity(): BigNumber {
    return this.icxSicxPoolStats?.totalSupply ?? new BigNumber(0);
  }

  instantLiquidityLtUnstakeAmount(): boolean {
    return this.instantIcxLiquidity().lt(this.unstakeInputAmount);
  }

  onUnstakeWaitClick(e: MouseEvent) {
    e.preventDefault();
    e.stopPropagation();

    this.unstakeWaitActive = true;
  }

  onUnstakeInstantClick(e: MouseEvent) {
    e.preventDefault();
    e.stopPropagation();

    if (this.instantLiquidityLtUnstakeAmount()) {
      console.log("this.unstakeWaitActive = true;")
      this.unstakeWaitActive = true;
      this.instantCheckboxEl.checked = false;
    } else {
      this.unstakeWaitActive = false;
    }
  }

  unstakeWaitIsActive(): boolean {
    return this.unstakeWaitActive;
  }

  unstakeInstantIsActive(): boolean {
    return !this.unstakeWaitActive;
  }

  userLoggedIn(): boolean {
    return this.storeService.userLoggedIn();
  }

  shouldShowUnstakeInfo(): boolean {
    return this.userUnstakeInfo != undefined
        && this.userUnstakeInfo.data.length > 0
        && this.userUnstakeInfo.totalUnstakeAmount.gt(0)
        && this.currentBlockHeight != undefined
  }

}
