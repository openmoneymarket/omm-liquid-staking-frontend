import {Component, ElementRef, Input, OnDestroy, OnInit, ViewChild} from '@angular/core';
import { CommonModule } from '@angular/common';
import BigNumber from "bignumber.js";
import {UsFormatPipe} from "../../pipes/us-format.pipe";
import {ModalType} from "../../models/enums/ModalType";
import {StakeIcxPayload} from "../../models/classes/StakeIcxPayload";
import {PersistenceService} from "../../services/persistence.service";
import {StateChangeService} from "../../services/state-change.service";
import {usLocale} from "../../common/formats";
import {convertICXTosICX, convertSICXToICX, getPrettyTimeForBlockHeightDiff} from "../../common/utils";
import {BaseClass} from "../../models/classes/BaseClass";
import {DollarUsLocalePipe} from "../../pipes/dollar-us-locale.pipe";
import {ChartService} from "../../services/chart.service";
import {UserUnstakeInfo} from "../../models/classes/UserUnstakeInfo";
import {map, Observable, Subscription} from "rxjs";
import {ClaimIcxPayload} from "../../models/classes/ClaimIcxPayload";

@Component({
  selector: 'app-stake-panel',
  standalone: true,
  imports: [CommonModule, UsFormatPipe, DollarUsLocalePipe],
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

  stakeInputAmount: string = "";
  unstakeInputAmount: string = "";

  userUnstakeInfo?: UserUnstakeInfo;
  claimableIcx?: BigNumber;
  untilBlockHeightTime?: string;

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

  subscribeToClaimableIcxChange(): void {
    this.claimableIcxSub = this.stateChangeService.userClaimableIcxChange$.subscribe(value => this.claimableIcx = value);
  }

  private resetUserState(): void {
    this.userUnstakeInfo = undefined;
    this.claimableIcx = undefined;
    this.untilBlockHeightTime = undefined;
  }

  onStakeClick(e: MouseEvent) {
    e.stopPropagation();

    if (this.persistenceService.userLoggedIn()) {
      if (this.stakeInputAmount && this.unstakeInputAmount) {
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
      this.stateChangeService.modalUpdate(ModalType.CLAIM_ICX, new ClaimIcxPayload(this.claimableIcx));
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
      this.stakeInputAmount = "";
    } else {
      this.stakeInputAmount = usLocale.to(stakeInputAmount);
      this.unstakeInputAmount = usLocale.to(+convertICXTosICX(new BigNumber(stakeInputAmount), this.todaySicxRate).toFixed(2));
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
      this.stakeInputAmount = usLocale.to(+convertSICXToICX(new BigNumber(unstakeInputAmount), this.todaySicxRate).toFixed(2));
    }
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
