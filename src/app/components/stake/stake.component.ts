import {ChangeDetectionStrategy, ChangeDetectorRef, Component, OnDestroy, OnInit} from '@angular/core';
import {CommonModule} from '@angular/common';
import {StakeOverviewComponent} from "../stake-overview/stake-overview.component";
import {BaseClass} from "../../models/classes/BaseClass";
import {StateChangeService} from "../../services/state-change.service";
import {Subscription, timer} from "rxjs";
import {UsFormatPipe} from "../../pipes/us-format.pipe";
import {isBrowserTabActive} from "../../common/utils";
import {DATA_REFRESH_INTERVAL} from "../../common/constants";
import {DollarUsLocalePipe} from "../../pipes/dollar-us-locale.pipe";
import {StakePanelComponent} from "../stake-panel/stake-panel.component";
import {UnstakePanelComponent} from "../unstake-panel/unstake-panel.component";
import {takeUntilDestroyed} from "@angular/core/rxjs-interop";
import {DataLoaderService} from "../../services/data-loader.service";
import {Wallet} from "../../models/classes/Wallet";

@Component({
  selector: 'app-stake',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    style: "display: contents"
  },
  imports: [
    CommonModule,
    StakeOverviewComponent,
    UsFormatPipe,
    DollarUsLocalePipe,
    StakePanelComponent,
    UnstakePanelComponent],
  templateUrl: './stake.component.html'
})
export class StakeComponent extends BaseClass implements OnDestroy, OnInit {

  private stakeActive = true;

  private userWallet: Wallet | undefined;

  // Subscriptions
  userLoginSub?: Subscription;
  dataRefreshPollingIntervalSub?: Subscription;

  constructor(private stateChangeService: StateChangeService,
              private dataLoaderService: DataLoaderService,
              private cdRef: ChangeDetectorRef) {
    super();
    this.initDataRefreshPollingInterval();
  }

  ngOnInit(): void {
    this.subscribeToUserLoginChange();
  }

  ngOnDestroy(): void {
    // clean up subs and charts
    this.dataRefreshPollingIntervalSub?.unsubscribe();
    this.userLoginSub?.unsubscribe();
  }

  subscribeToUserLoginChange(): void {
    this.userLoginSub = this.stateChangeService.loginChange$.subscribe(value => {
      this.userWallet = value;

      // Detect changes
      this.cdRef.detectChanges();
    });
  }

  initDataRefreshPollingInterval(): void {
    this.dataRefreshPollingIntervalSub = timer(DATA_REFRESH_INTERVAL, DATA_REFRESH_INTERVAL).pipe(takeUntilDestroyed()).subscribe(() => {
      this.refreshData();

      // Detect changes
      this.cdRef.detectChanges();
    })
  }

  private refreshData(): void {
    // only refresh data if browser tab is active
    if (isBrowserTabActive()) {
      // core data
      this.dataLoaderService.loadFeesDistributed7D();
      this.dataLoaderService.loadSicxHoldersAmount();
      this.dataLoaderService.loadTotalStakedIcx();
      this.dataLoaderService.loadlTotalSicxAmount();
      this.dataLoaderService.loadIcxSicxPoolStats();
      this.dataLoaderService.loadTokenPrices();
      this.dataLoaderService.loadTodaySicxRate();
      this.dataLoaderService.loadBalancedDexFees();

      // user specific data
      if (this.userLoggedIn()) {
        this.dataLoaderService.loadUserClaimableIcx();
        this.dataLoaderService.loadUserUnstakeInfo();
        this.dataLoaderService.loadAllUserAssetsBalances();
      }
    }
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

    // Detect changes
    this.cdRef.detectChanges();
  }

  onUnstakeToggleClick(e: MouseEvent) {
    e.stopPropagation();

    this.stakeActive = false;

    // Detect changes
    this.cdRef.detectChanges();
  }

  public userLoggedIn(): boolean {
    return this.userWallet != null;
  }
}
