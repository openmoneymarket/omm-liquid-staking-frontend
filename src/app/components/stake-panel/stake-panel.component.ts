import {Component, ElementRef, Input, OnDestroy, OnInit, ViewChild} from '@angular/core';
import { CommonModule } from '@angular/common';
import BigNumber from "bignumber.js";
import {UsFormatPipe} from "../../pipes/us-format.pipe";
import {ModalType} from "../../models/enums/ModalType";
import {StakeIcxPayload} from "../../models/classes/StakeIcxPayload";
import {PersistenceService} from "../../services/persistence.service";
import {StateChangeService} from "../../services/state-change.service";
import {usLocale} from "../../common/formats";
import {convertICXTosICX, convertSICXToICX} from "../../common/utils";
import {BaseClass} from "../../models/classes/BaseClass";
import {DollarUsLocalePipe} from "../../pipes/dollar-us-locale.pipe";
import {ChartService} from "../../services/chart.service";
import {UserUnstakeInfo} from "../../models/classes/UserUnstakeInfo";
import {Subscription} from "rxjs";
import {ClaimIcxPayload} from "../../models/classes/ClaimIcxPayload";
import {PrettyUntilBlockHeightTime} from "../../pipes/pretty-until-block-height-time";

@Component({
  selector: 'app-stake-panel',
  standalone: true,
  imports: [CommonModule, UsFormatPipe, DollarUsLocalePipe, PrettyUntilBlockHeightTime],
  templateUrl: './stake-panel.component.html'
})
export class StakePanelComponent extends BaseClass implements OnInit, OnDestroy {

  stakingApyChartEl: any;
  stakingApyChart: any;
  @ViewChild("stkApyChart", { static: true}) set a(a: ElementRef) { this.stakingApyChartEl = a.nativeElement; }

  @Input({ required: true}) active!: boolean;
  @Input({ required: true}) userIcxBalance!: BigNumber;
  @Input({ required: true}) userSicxBalance!: BigNumber;
  @Input({ required: true}) icxPrice!: string;
  @Input({ required: true}) sicxPrice!: string;
  @Input({ required: true}) todaySicxRate!: BigNumber;

  stakeInputAmount: BigNumber = new BigNumber(0);
  unstakeInputAmount: BigNumber = new BigNumber(0);

  userUnstakeInfo?: UserUnstakeInfo;
  claimableIcx?: BigNumber;
  currentBlockHeight?: BigNumber;

  // Subscriptions
  userUnstakeInfoSub?: Subscription;
  claimableIcxSub?: Subscription;
  userLoginSub?: Subscription;
  latestBlockHeightSub?: Subscription;

  constructor(private persistenceService: PersistenceService,
              public stateChangeService: StateChangeService,
              private chartService: ChartService) {
    super();
  }

  ngOnInit(): void {
    this.registerSubscriptions();

    this.chartService.initStakingApyChart(this.stakingApyChartEl, this.stakingApyChart);
  }

  ngOnDestroy(): void {
    // cleanup subscriptions and chart
    this.userUnstakeInfoSub?.unsubscribe();
    this.claimableIcxSub?.unsubscribe();
    this.latestBlockHeightSub?.unsubscribe();
    this.userLoginSub?.unsubscribe();

    this.stakingApyChart?.remove();
  }

  registerSubscriptions(): void {
    this.subscribeToLatestBlockHeightChange();
    this.subscribeToUserUnstakeInfoChange();
    this.subscribeToClaimableIcxChange();
    this.subscribeToUserLoginChange();
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

  subscribeToClaimableIcxChange(): void {
    this.claimableIcxSub = this.stateChangeService.userClaimableIcxChange$.subscribe(value => this.claimableIcx = value);
  }

  private resetUserState(): void {
    this.userUnstakeInfo = undefined;
    this.claimableIcx = undefined;
  }

  onStakeClick(e: MouseEvent) {
    e.stopPropagation();

    if (this.persistenceService.userLoggedIn()) {
      if (!this.userIcxBalanceLtInputAmount() && this.stakeInputAmount.gt(0) && this.unstakeInputAmount.gt(0)) {
        this.stateChangeService.modalUpdate(ModalType.STAKE_ICX, new StakeIcxPayload(
            new BigNumber(this.stakeInputAmount),
            new BigNumber(this.unstakeInputAmount),
        ));
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

  onStakeInputKeyUp(e: KeyboardEvent | ClipboardEvent | FocusEvent) {
    this.delay(() => {
      this.processStakeInput(e);
    }, 800 );
  }

  processStakeInput(e: KeyboardEvent | ClipboardEvent | FocusEvent) {
    const stakeInputAmount = +usLocale.from((<HTMLInputElement>e.target).value);

    if (!stakeInputAmount || stakeInputAmount <= 0) {
      this.stakeInputAmount = new BigNumber(0);
      this.unstakeInputAmount = new BigNumber(0);
    } else {
      this.stakeInputAmount = new BigNumber(stakeInputAmount);
      this.unstakeInputAmount = convertICXTosICX(this.stakeInputAmount, this.todaySicxRate);
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
      this.stakeInputAmount = new BigNumber(0);
    } else {
      this.unstakeInputAmount = new BigNumber(unstakeInputAmount);
      this.stakeInputAmount = convertSICXToICX(this.unstakeInputAmount, this.todaySicxRate);
    }
  }

  userIcxBalanceLtInputAmount(): boolean {
    return this.userLoggedIn() && this.userIcxBalance.lt(this.stakeInputAmount);
  }

  userLoggedIn(): boolean {
    return this.persistenceService.userLoggedIn();
  }

  shouldShowUnstakeInfo(): boolean {
    return this.userUnstakeInfo != undefined
        && this.userUnstakeInfo.data.length > 0
        && this.userUnstakeInfo.totalUnstakeAmount.gt(0)
        && this.currentBlockHeight != undefined
  }
}
