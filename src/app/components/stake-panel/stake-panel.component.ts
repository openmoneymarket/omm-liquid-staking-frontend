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
import BigNumber from "bignumber.js";
import {UsFormatPipe} from "../../pipes/us-format.pipe";
import {ModalType} from "../../models/enums/ModalType";
import {StakeIcxPayload} from "../../models/classes/StakeIcxPayload";
import {StateChangeService} from "../../services/state-change.service";
import {usLocale} from "../../common/formats";
import {convertICXTosICX, convertICXToSICXPrice, convertSICXToICX} from "../../common/utils";
import {BaseClass} from "../../models/classes/BaseClass";
import {DollarUsLocalePipe} from "../../pipes/dollar-us-locale.pipe";
import {ChartService} from "../../services/chart.service";
import {UserUnstakeInfo} from "../../models/classes/UserUnstakeInfo";
import {Subscription} from "rxjs";
import {ClaimIcxPayload} from "../../models/classes/ClaimIcxPayload";
import {PrettyUntilBlockHeightTime} from "../../pipes/pretty-until-block-height-time";
import {Wallet} from "../../models/classes/Wallet";
import {Address, TokenSymbol} from "../../models/Types/ModalTypes";
import {ICX, MIN_ICX_BALANCE_KEPT, ONE, SICX} from "../../common/constants";
import {RndDwnPipePipe} from "../../pipes/round-down.pipe";
import {UnstakeInfoData} from "../../models/classes/UnstakeInfoData";
import {RndDwnNPercPipe} from "../../pipes/round-down-percent.pipe";
import {HideElementPipe} from "../../pipes/hide-element-pipe";

@Component({
  selector: 'app-stake-panel',
  standalone: true,
  imports: [
    CommonModule,
    UsFormatPipe,
    DollarUsLocalePipe,
    PrettyUntilBlockHeightTime,
    RndDwnPipePipe,
    RndDwnNPercPipe,
    HideElementPipe
  ],
  templateUrl: './stake-panel.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class StakePanelComponent extends BaseClass implements OnInit, OnDestroy {

  ONE = ONE;

  stakingAprChartEl: any;
  stakingAprChart: any;
  @ViewChild("stkAprChart", { static: true}) set a(a: ElementRef) { this.stakingAprChartEl = a.nativeElement; }

  @Input({ required: true}) active!: boolean;

  // User values
  userSicxBalance = new BigNumber(0);
  userIcxBalance = new BigNumber(0);
  userWallet: Wallet | undefined;
  userUnstakeInfo?: UserUnstakeInfo;
  claimableIcx?: BigNumber;

  // Inputs
  stakeInputAmount: BigNumber = new BigNumber(0);
  unstakeInputAmount: BigNumber = new BigNumber(0);

  // core values
  icxPrice = new BigNumber(0);
  sicxPrice = new BigNumber(0);
  todaySicxRate: BigNumber = new BigNumber(0);
  tokenPricesMap = new Map<TokenSymbol, BigNumber>();
  currentBlockHeight?: BigNumber;
  unstakeInfoMap = new Map<Address, UnstakeInfoData[]>();
  stakingFee = new BigNumber(0);
  chartFailedToLoad = false;

  // dynamic values
  stakingApr = new BigNumber(0);
  originalStakingApr = new BigNumber(0);

  // Subscriptions
  userUnstakeInfoSub?: Subscription;
  claimableIcxSub?: Subscription;
  latestBlockHeightSub?: Subscription;
  userLoginSub?: Subscription;
  userTokenBalanceSub?: Subscription;
  tokenPriceSub?: Subscription;
  todayRateSub?: Subscription;
  unstakeInfoSub?: Subscription;
  liquidStakingSub?: Subscription;
  stakingFeeSub?: Subscription;

  constructor(public stateChangeService: StateChangeService,
              private chartService: ChartService,
              private cdRef: ChangeDetectorRef) {
    super();
  }

  ngOnInit(): void {
    this.registerSubscriptions();
  }

  ngOnDestroy(): void {
    // cleanup subscriptions and chart
    this.userUnstakeInfoSub?.unsubscribe();
    this.claimableIcxSub?.unsubscribe();
    this.latestBlockHeightSub?.unsubscribe();
    this.userTokenBalanceSub?.unsubscribe();
    this.userLoginSub?.unsubscribe();
    this.tokenPriceSub?.unsubscribe();
    this.todayRateSub?.unsubscribe();
    this.unstakeInfoSub?.unsubscribe();
    this.liquidStakingSub?.unsubscribe();
    this.stakingFeeSub?.unsubscribe();
    this.stakingAprChart?.remove();
  }

  registerSubscriptions(): void {
    this.subscribeToLatestBlockHeightChange();
    this.subscribeToUserTokenBalanceChange();
    this.subscribeToUserUnstakeInfoChange();
    this.subscribeToClaimableIcxChange();
    this.subscribeToUserLoginChange();
    this.subscribeToTokenPriceChange();
    this.subscribeToTodayRateChange();
    this.subscribeToUnstakeInfoChange();
    this.subscribeToLiquidStakingStatsChange();
    this.subscribeToStakingFeeChange();
  }

  private resetInputs(): void {
    this.stakeInputAmount = new BigNumber(0);
    this.unstakeInputAmount = new BigNumber(0);
  }

  private resetUserState(): void {
    this.userIcxBalance = new BigNumber(0);
    this.userSicxBalance = new BigNumber(0);
    this.userUnstakeInfo = undefined;
    this.claimableIcx = undefined;
  }

  private subscribeToStakingFeeChange(): void {
    this.stakingFeeSub = this.stateChangeService.stakingFeeChange$.subscribe(value => {
      this.stakingFee = value;

      // Detect Changes
      this.cdRef.detectChanges();
    })
  }

  private subscribeToLiquidStakingStatsChange(): void {
    this.liquidStakingSub = this.stateChangeService.liquidStakingStatsChange$.subscribe((value) => {
      if (value) {
        const res = this.chartService.initStakingAprChart(this.stakingAprChartEl, this.stakingAprChart, value);
        this.stakingAprChart = res?.chart;
        const lastValue = res?.lastValue ?? 0;
        this.stakingApr = new BigNumber(lastValue);

        this.stakingAprChart?.timeScale().fitContent();

        this.stakingAprChart?.subscribeCrosshairMove((param: any) => {
          if (param?.point) {
            const supplyApy = param.seriesPrices.entries().next().value;
            if (supplyApy && supplyApy.length > 1) {
              this.stakingApr = new BigNumber(supplyApy[1]);
            }
          } else {
            this.stakingApr = new BigNumber(lastValue ?? 0);
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

  private subscribeToTokenPriceChange(): void {
    this.tokenPriceSub = this.stateChangeService.tokenPricesChange$.subscribe(value => {
      this.tokenPricesMap = value;
      this.icxPrice = this.tokenPricesMap.get(ICX.symbol) ?? new BigNumber(0);

      this.recalculateSicxPrice();

      // Detect Changes
      this.cdRef.detectChanges();
    })
  }

  private subscribeToUserTokenBalanceChange(): void {
    this.userTokenBalanceSub = this.stateChangeService.userTokenBalanceUpdate$.subscribe(value => {
      if (value.token.symbol === SICX.symbol) {
        this.userSicxBalance = value.amount;
      } else if (value.token.symbol === ICX.symbol) {
        this.userIcxBalance = value.amount;
      }

      // Detect Changes
      this.cdRef.detectChanges();
    })
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

  private subscribeToTodayRateChange(): void {
    this.todayRateSub = this.stateChangeService.sicxTodayRateChange$.subscribe(todayRate => {
      this.todaySicxRate = todayRate;

      this.recalculateSicxPrice();

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

  onStakeClick(e: MouseEvent) {
    e.stopPropagation();

    if (this.userLoggedIn()) {
      if (!this.userIcxBalanceLtInputAmount() && this.stakeInputAmount.gt(0) && this.unstakeInputAmount.gt(0)) {
        this.stateChangeService.modalUpdate(ModalType.STAKE_ICX, new StakeIcxPayload(
            new BigNumber(this.stakeInputAmount),
            new BigNumber(this.unstakeInputAmount),
        ));

        this.resetInputs();
      }

      // Detect Changes
      this.cdRef.detectChanges();
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

  onIcxBalanceClick(e: MouseEvent): void {
    e.stopPropagation();

    if (this.userIcxBalance.gt(MIN_ICX_BALANCE_KEPT)) {
      this.processStakeInput(new BigNumber(this.userIcxBalance.minus(MIN_ICX_BALANCE_KEPT)));
    }

    // Detect Changes
    this.cdRef.detectChanges();
  }

  onStakeInputKeyUp(e: KeyboardEvent | ClipboardEvent | FocusEvent) {
    this.delay(() => {
      this.processStakeInput(e);
    }, 800 );
  }

  processStakeInput(e: KeyboardEvent | ClipboardEvent | FocusEvent | BigNumber) {
    let stakeInputAmount: number;

    if (e instanceof BigNumber) {
      stakeInputAmount = e.toNumber();
    } else {
      stakeInputAmount = +usLocale.from((<HTMLInputElement>e.target).value);
    }

    if (!stakeInputAmount || stakeInputAmount <= 0) {
      this.stakeInputAmount = new BigNumber(0);
      this.unstakeInputAmount = new BigNumber(0);
    } else {
      const newStakeInput = new BigNumber(stakeInputAmount);

      if (!newStakeInput.dp(2, BigNumber.ROUND_DOWN).eq(this.stakeInputAmount.dp(2, BigNumber.ROUND_DOWN))) {
        this.stakeInputAmount = new BigNumber(stakeInputAmount);
        this.unstakeInputAmount = convertICXTosICX(this.stakeInputAmount, this.todaySicxRate);
      }
    }

    // Detect Changes
    this.cdRef.detectChanges();
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
      this.stakeInputAmount = new BigNumber(0);
    } else {
      const newUnstakeInput = new BigNumber(unstakeInputAmount);

      if (!newUnstakeInput.dp(2, BigNumber.ROUND_DOWN).eq(this.unstakeInputAmount.dp(2, BigNumber.ROUND_DOWN))) {
        this.unstakeInputAmount = new BigNumber(unstakeInputAmount);
        this.stakeInputAmount = convertSICXToICX(this.unstakeInputAmount, this.todaySicxRate);
      }
    }

    // Detect Changes
    this.cdRef.detectChanges();
  }

  private recalculateSicxPrice(): void {
    if (this.todaySicxRate.gt(0) && this.icxPrice.gt(0)) {
      this.sicxPrice = convertICXToSICXPrice(this.icxPrice, this.todaySicxRate);
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

  userIcxBalanceLtInputAmount(): boolean {
    return this.userLoggedIn() && this.userIcxBalance.lt(this.stakeInputAmount);
  }

  public userLoggedIn(): boolean {
    return this.userWallet != null;
  }

  shouldShowUnstakeInfo(): boolean {
    return this.userUnstakeInfo != undefined
        && this.userUnstakeInfo.data.length > 0
        && this.userUnstakeInfo.totalUnstakeAmount.gt(0)
        && this.currentBlockHeight != undefined
  }
}
