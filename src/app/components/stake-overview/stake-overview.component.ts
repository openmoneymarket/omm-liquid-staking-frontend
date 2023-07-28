import {ChangeDetectionStrategy, ChangeDetectorRef, Component, OnDestroy, OnInit} from '@angular/core';
import {CommonModule} from '@angular/common';
import {StateChangeService} from "../../services/state-change.service";
import {Subscription} from "rxjs";
import BigNumber from "bignumber.js";
import {UsFormatPipe} from "../../pipes/us-format.pipe";

@Component({
  selector: 'app-stake-overview',
  standalone: true,
  imports: [CommonModule, UsFormatPipe],
  templateUrl: './stake-overview.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class StakeOverviewComponent implements OnInit, OnDestroy {

  totalIcxStaked = new BigNumber(0);
  totalSicxAmount = new BigNumber(0);
  sicxHolders = new BigNumber(0);
  feeDistributed7D = new BigNumber(0);

  totalIcxStakedSub?: Subscription;
  totalSicxAmountSub?: Subscription;
  sicxHoldersSub?: Subscription;
  feeDistributedSub?: Subscription;
  constructor(private stateChangeService: StateChangeService,
              private cdRef: ChangeDetectorRef) {
  }

  ngOnInit(): void {
    this.registerSubscriptions();
  }

  ngOnDestroy(): void {
    this.totalIcxStakedSub?.unsubscribe();
    this.totalSicxAmountSub?.unsubscribe();
    this.sicxHoldersSub?.unsubscribe();
    this.feeDistributedSub?.unsubscribe();
  }

  registerSubscriptions(): void {
    this.subscribeToTotalIcxStakedChange();
    this.subscribeToTotalSicxAmountChange();
    this.subscribeToSicxHoldersChange();
    this.subscribeToFeeDistributed7DChange();
  }

  private subscribeToFeeDistributed7DChange(): void {
    this.feeDistributedSub = this.stateChangeService.feeDistributed7DChange$.subscribe(value => {
      this.feeDistributed7D = value;

      // Detect changes
      this.cdRef.detectChanges();
    });
  }

  private subscribeToSicxHoldersChange(): void {
    this.sicxHoldersSub = this.stateChangeService.sicxHoldersChange$.subscribe(value => {
      this.sicxHolders = value;

      // Detect changes
      this.cdRef.detectChanges();
    });
  }

  private subscribeToTotalIcxStakedChange(): void {
    this.totalIcxStakedSub = this.stateChangeService.totalStakedIcxChange$.subscribe(value => {
      this.totalIcxStaked = value;

      // Detect changes
      this.cdRef.detectChanges();
    });
  }

  private subscribeToTotalSicxAmountChange(): void {
    this.totalSicxAmountSub = this.stateChangeService.totalSicxAmountChange$.subscribe(value => {
      this.totalSicxAmount = value;

      // Detect changes
      this.cdRef.detectChanges();
    });
  }

}
