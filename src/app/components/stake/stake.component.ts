import {Component, ElementRef, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {CommonModule} from '@angular/common';
import {ChartService} from "../../services/chart.service";
import {StakeOverviewComponent} from "../stake-overview/stake-overview.component";
import {BaseClass} from "../../models/classes/BaseClass";
import BigNumber from "bignumber.js";
import {StateChangeService} from "../../services/state-change.service";
import {Subscription} from "rxjs";
import {UsFormatPipe} from "../../pipes/us-format.pipe";
import {convertICXToSICXPrice} from "../../common/utils";
import {StoreService} from "../../services/store.service";
import {ICX, SICX} from "../../common/constants";
import {DollarUsLocalePipe} from "../../pipes/dollar-us-locale.pipe";
import {StakePanelComponent} from "../stake-panel/stake-panel.component";
import {UnstakePanelComponent} from "../unstake-panel/unstake-panel.component";

@Component({
  selector: 'app-stake',
  standalone: true,
  host: {
    style: "display: contents"
  },
  imports: [CommonModule, StakeOverviewComponent, UsFormatPipe, DollarUsLocalePipe, StakePanelComponent, UnstakePanelComponent],
  templateUrl: './stake.component.html'
})
export class StakeComponent extends BaseClass implements OnDestroy, OnInit {

  private stakeActive = true;


  /** Base static value **/

  todaySicxRate: BigNumber = new BigNumber(0);

  /** Subscriptions **/
  todayRateSub?: Subscription;

  constructor(private chartService: ChartService,
              private stateChangeService: StateChangeService,
              private storeService: StoreService) {
    super();
  }

  ngOnInit(): void {
    this.registerSubscriptions();
  }

  registerSubscriptions(): void {
    this.todayRateSub = this.stateChangeService.sicxTodayRateChange$.subscribe(todayRate => this.todaySicxRate = todayRate);
  }

  ngOnDestroy(): void {
    // clean up subs and charts
    this.todayRateSub?.unsubscribe();
  }

  stakePanelActive(): boolean {
    return this.stakeActive;
  }

  unstakePanelActive(): boolean {
    return !this.stakeActive;
  }

  onStakeToggleClick(e: MouseEvent) {
    e.stopPropagation();

    this.stakeActive = true;
  }

  onUnstakeToggleClick(e: MouseEvent) {
    e.stopPropagation();

    this.stakeActive = false;
  }

  getUserIcxBalance(): BigNumber {
    return this.storeService.getUserTokenBalance(ICX);
  }

  getUsersIcxBalance(): BigNumber {
    return this.storeService.getUserTokenBalance(SICX);
  }

  getIcxPrice(): string {
    return this.storeService.getTokenUsdPrice(ICX)?.toFixed(4) ?? "0";
  }

  getSicxPrice(): string {
    return convertICXToSICXPrice(this.storeService.getTokenUsdPrice(ICX), this.todaySicxRate).toFixed(4) ?? "0";
  }
}
