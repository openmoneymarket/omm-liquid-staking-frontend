import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ElementRef,
  Input,
  OnDestroy,
  OnInit,
  ViewChild
} from '@angular/core';
import {CommonModule} from '@angular/common';
import {UsFormatPipe} from "../../pipes/us-format.pipe";
import BigNumber from "bignumber.js";
import {ChartService} from "../../services/chart.service";
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
import {PoolStats} from "../../models/classes/PoolStats";
import {ClaimIcxPayload} from "../../models/classes/ClaimIcxPayload";
import {PrettyUntilBlockHeightTime} from "../../pipes/pretty-until-block-height-time";
import {FormsModule} from "@angular/forms";
import {ICX, SICX} from "../../common/constants";
import {Wallet} from "../../models/classes/Wallet";
import {RndDwnPipePipe} from "../../pipes/round-down.pipe";
import {RndDwnNPercPipe} from "../../pipes/round-down-percent.pipe";
import {SecondsToDaysPipe} from "../../pipes/seconds-to-days";
import {SecondsToDhm} from "../../pipes/seconds-to-dhm";
import {Address} from "../../models/Types/ModalTypes";
import {UnstakeInfoData} from "../../models/classes/UnstakeInfoData";
import {HideElementPipe} from "../../pipes/hide-element-pipe";

@Component({
  selector: 'app-unstake-panel',
  standalone: true,
  imports: [CommonModule, UsFormatPipe, RndDwnPipePipe, PrettyUntilBlockHeightTime, FormsModule, RndDwnPipePipe, RndDwnNPercPipe, SecondsToDaysPipe, SecondsToDhm, HideElementPipe],
  templateUrl: './unstake-panel.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class UnstakePanelComponent extends BaseClass implements OnInit, OnDestroy {

  unstakingChartEl: any;
  unstakingChart: any;
  @ViewChild("unstkApyChart", { static: true}) set a(a: ElementRef) { this.unstakingChartEl = a.nativeElement; }

  instantCheckboxEl!: HTMLInputElement;
  @ViewChild("instantBox", { static: true}) set b(b: ElementRef) { this.instantCheckboxEl = b.nativeElement; }


  @Input({ required: true}) active!: boolean;

  // User values
  userSicxBalance = new BigNumber(0);
  userIcxBalance = new BigNumber(0);
  claimableIcx: BigNumber = new BigNumber(0);
  userUnstakeInfo?: UserUnstakeInfo;
  userWallet: Wallet | undefined;

  // Inputs & computed values
  unstakeInputAmount: BigNumber = new BigNumber(0);
  receivedIcxAmount: BigNumber = new BigNumber(0);
  instantReceivedIcxAmount: BigNumber = new BigNumber(0);

  // Core values
  currentBlockHeight?: BigNumber;
  feeAmount: BigNumber = new BigNumber(0);
  balancedDexFees?: BalancedDexFees;
  icxSicxPoolStats?: PoolStats;
  todaySicxRate: BigNumber = new BigNumber(0);
  unstakingTimeInSeconds = new BigNumber(0);
  unstakeInfoMap = new Map<Address, UnstakeInfoData[]>();
  unstakingAmount = new BigNumber(0);
  chartFailedToLoad = false;

  // Subscriptions
  userUnstakeInfoSub?: Subscription;
  claimableIcxSub?: Subscription;
  userLoginSub?: Subscription;
  userTokenBalanceSub?: Subscription;
  latestBlockHeightSub?: Subscription;
  balancedDexFeeSub?: Subscription;
  icxSicxPoolStatsSub?: Subscription;
  todayRateSub?: Subscription;
  unstakingTimeSub?: Subscription;
  unstakeInfoSub?: Subscription;
  liquidStakingSub?: Subscription;

  constructor(private chartService: ChartService,
              public stateChangeService: StateChangeService,
              private cdRef: ChangeDetectorRef) {
    super();
  }

  private unstakeWaitActive = true;

  ngOnInit(): void {
    this.registerSubscriptions();
  }

  ngOnDestroy(): void {
    // cleanup subscriptions and chart
    this.userUnstakeInfoSub?.unsubscribe();
    this.claimableIcxSub?.unsubscribe();
    this.latestBlockHeightSub?.unsubscribe();
    this.userLoginSub?.unsubscribe();
    this.balancedDexFeeSub?.unsubscribe();
    this.icxSicxPoolStatsSub?.unsubscribe();
    this.userTokenBalanceSub?.unsubscribe();
    this.todayRateSub?.unsubscribe();
    this.unstakingTimeSub?.unsubscribe();
    this.unstakeInfoSub?.unsubscribe();
    this.liquidStakingSub?.unsubscribe();

    this.unstakingChart?.remove();
  }

  registerSubscriptions(): void {
    this.subscribeToLatestBlockHeightChange();
    this.subscribeToUserUnstakeInfoChange();
    this.subscribeToClaimableIcxChange();
    this.subscribeToUserLoginChange();
    this.subscribeToBalancedDexFeeChange();
    this.subscribeIcxSicxPoolStatsChange();
    this.subscribeToUserTokenBalanceChange();
    this.subscribeToTodayRateChange();
    this.subscribeToUnstakingTimeChange();
    this.subscribeToUnstakeInfoChange();
    this.subscribeToLiquidStakingStatsChange();
  }

  private resetInputs(): void {
    this.unstakeInputAmount = new BigNumber(0);
    this.receivedIcxAmount = new BigNumber(0);
    this.instantReceivedIcxAmount = new BigNumber(0);

  }

  private resetUserState(): void {
    this.userSicxBalance = new BigNumber(0);
    this.userIcxBalance = new BigNumber(0);
    this.userUnstakeInfo = undefined;
    this.claimableIcx = new BigNumber(0);
  }

  private subscribeToLiquidStakingStatsChange(): void {
    this.liquidStakingSub = this.stateChangeService.liquidStakingStatsChange$.subscribe((value) => {
      if (value) {
        const res = this.chartService.initUnstakingApyChart(this.unstakingChartEl, this.unstakingChart, value);
        this.unstakingChart = res?.chart;
        const lastValue = res?.lastValue ?? 0;
        this.unstakingAmount = new BigNumber(lastValue);

        this.unstakingChart?.timeScale().fitContent();

        this.unstakingChart?.subscribeCrosshairMove((param: any) => {
          if (param?.point) {
            const supplyApy = param.seriesPrices.entries().next().value;
            if (supplyApy && supplyApy.length > 1) {
              this.unstakingAmount = new BigNumber(supplyApy[1]);
            }
          } else {
            this.unstakingAmount = new BigNumber(lastValue ?? 0);
          }

          // Detect Changes
          this.cdRef.detectChanges();
        });
      } else {
        this.chartFailedToLoad = true;
      }


      // Detect Changes
      this.cdRef.detectChanges();
    })
  }

  private subscribeToUnstakeInfoChange(): void {
    this.unstakeInfoSub = this.stateChangeService.unstakeInfoChange$.subscribe(value => {
      this.unstakeInfoMap = value;


      this.recalculateUserUnstakeInfo();

      // Detect Changes
      this.cdRef.detectChanges();
    });
  }

  private subscribeToUnstakingTimeChange(): void {
    this.unstakingTimeSub = this.stateChangeService.unstakingTimeInSecondsChange$.subscribe(value => {
      this.unstakingTimeInSeconds = value;
    })
  }

  private subscribeToTodayRateChange(): void {
    this.todayRateSub = this.stateChangeService.sicxTodayRateChange$.subscribe(todayRate => {
      this.todaySicxRate = todayRate;

      this.recalculateInputs();

      // Detect Changes
      this.cdRef.detectChanges();
    });
  }

  private subscribeToUserTokenBalanceChange(): void {
    this.userTokenBalanceSub = this.stateChangeService.userTokenBalanceUpdate$.subscribe(value => {
      if (value.token.symbol === SICX.symbol) {
        this.userSicxBalance = value.amount;
      } else if (value.token.symbol === ICX.symbol) {
        this.userIcxBalance = value.amount;
      }

      this.recalculateInputs();

      // Detect Changes
      this.cdRef.detectChanges();
    })
  }

  private subscribeIcxSicxPoolStatsChange(): void {
    this.icxSicxPoolStatsSub = this.stateChangeService.icxSicxPoolStatsChange$.subscribe(value => {
      this.icxSicxPoolStats = value;

      this.recalculateInputs();

      // Detect Changes
      this.cdRef.detectChanges();
    });
  }

  private subscribeToBalancedDexFeeChange(): void {
    this.balancedDexFeeSub = this.stateChangeService.balancedDexFeesChange$.subscribe(fees => {
      this.balancedDexFees = fees;

      this.recalculateInputs();

      // Detect Changes
      this.cdRef.detectChanges();
    });
  }

  private subscribeToLatestBlockHeightChange(): void {
    this.latestBlockHeightSub = this.stateChangeService.lastBlockHeightChange$.subscribe(block => {
      this.currentBlockHeight = new BigNumber(block.height);

      // Detect Changes
      this.cdRef.detectChanges();
    });
  }
  private subscribeToUserUnstakeInfoChange(): void {
    this.userUnstakeInfoSub = this.stateChangeService.userUnstakeInfoChange$.subscribe(data => {
      this.userUnstakeInfo = data;

      this.recalculateUserUnstakeInfo();

      // Detect Changes
      this.cdRef.detectChanges();
    });
  }

  private subscribeToUserLoginChange(): void {
    this.userLoginSub = this.stateChangeService.loginChange$.subscribe(value => {
      this.userWallet = value;

      // user logout
      if (value == undefined) {
        this.resetUserState();
      }

      // Detect Changes
      this.cdRef.detectChanges();
    });
  }

  subscribeToClaimableIcxChange(): void {
    this.claimableIcxSub = this.stateChangeService.userClaimableIcxChange$.subscribe(value => {
      this.claimableIcx = value;

      // Detect Changes
      this.cdRef.detectChanges();
    });
  }

  onUnstakeClick(e: MouseEvent) {
    e.stopPropagation();

    if (this.userLoggedIn()) {
      if (!this.inputUnstakeAmountGtUserSicxBalance() && this.unstakeInputAmount.gt(0) && this.receivedIcxAmount.gt(0)) {
        if (this.unstakeWaitActive) {
          this.stateChangeService.modalUpdate(ModalType.UNSTAKE_WAIT_SICX, new UnstakeWaitSicxPayload(
              new BigNumber(this.unstakeInputAmount),
              new BigNumber(this.receivedIcxAmount),
              new BigNumber(this.unstakingTimeInSeconds)
          ));
        } else {
          this.stateChangeService.modalUpdate(ModalType.UNSTAKE_INSTANT_SICX, new UnstakeInstantSicxPayload(
              new BigNumber(this.unstakeInputAmount),
              new BigNumber(this.instantReceivedIcxAmount),
              new BigNumber(this.feeAmount),
          ));
        }

        this.resetInputs();

        // Detect Changes
        this.cdRef.detectChanges();
      }
    } else {
      this.stateChangeService.modalUpdate(ModalType.SIGN_IN);
    }
  }

  onClaimIcxClick(e: MouseEvent) {
    e.stopPropagation();

    if (this.userLoggedIn() && this.claimableIcx && this.claimableIcx.gt(0)) {
      this.stateChangeService.modalUpdate(ModalType.CLAIM_ICX, new ClaimIcxPayload(
          new BigNumber(this.claimableIcx),
          new BigNumber(this.userIcxBalance)
      ));
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

    // Detect Changes
    this.cdRef.detectChanges();
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

  inputUnstakeAmountGtUserSicxBalance(): boolean {
    if (this.userLoggedIn()) {
      return this.unstakeInputAmount.gt(this.userSicxBalance);
    }

    return false;
  }

  onSicxBalanceClick(e: MouseEvent): void {
    e.stopPropagation();

    this.unstakeInputAmount = new BigNumber(this.userSicxBalance);
    this.recalculateInputs();

    // Detect Changes
    this.cdRef.detectChanges();
  }

  onUnstakeWaitClick(e: MouseEvent): void {
    e.preventDefault();
    e.stopPropagation();

    this.unstakeWaitActive = true;

    // Detect Changes
    this.cdRef.detectChanges();
  }

  onUnstakeInstantClick(e: MouseEvent) {
    e.preventDefault();
    e.stopPropagation();

    if (this.instantLiquidityLtUnstakeAmount()) {
      this.unstakeWaitActive = true;
      this.instantCheckboxEl.checked = false;
    } else {
      this.unstakeWaitActive = false;
    }

    // Detect Changes
    this.cdRef.detectChanges();
  }

  private recalculateInputs(): void {
    if (this.unstakeInputAmount.gt(0) && this.todaySicxRate.gt(0)) {
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

  recalculateUserUnstakeInfo() {
    if (this.userLoggedIn() && this.userUnstakeInfo && this.userUnstakeInfo.data.length > 0 && this.unstakeInfoMap) {
      this.userUnstakeInfo.data.forEach((userUnstakeInfo) => {
        const unstakeInfos = this.unstakeInfoMap.get(userUnstakeInfo.from);

        if (unstakeInfos) {
          const equalUnstakeInfo = unstakeInfos.find(value => {
            return value.blockHeight.eq(userUnstakeInfo.blockHeight) && value.amount.eq(userUnstakeInfo.amount);
          });

          if (equalUnstakeInfo) {
            const sIcxBefore = unstakeInfos.reduce((prev, curr) => {
              // if order higher/before than users
              if (curr.orderNumber < equalUnstakeInfo.orderNumber) {
                return prev.plus(curr.amount);
              } else {
                return prev;
              }
            }, new BigNumber(0))

            userUnstakeInfo.setSicxBefore(sIcxBefore)
          }
        }
      })
    }
  }

  unstakeWaitIsActive(): boolean {
    return this.unstakeWaitActive;
  }

  unstakeInstantIsActive(): boolean {
    return !this.unstakeWaitActive;
  }

  public userLoggedIn(): boolean {
    return this.userWallet != null;
  }

  shouldShowUnstakeInfo(): boolean {
    return this.userUnstakeInfo != undefined
        && this.userUnstakeInfo.data != undefined
        && this.userUnstakeInfo.data.length > 0
        && this.userUnstakeInfo.totalUnstakeAmount.gt(0)
        && this.currentBlockHeight != undefined
  }

}
