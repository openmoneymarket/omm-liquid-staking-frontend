import {Component, ElementRef, Input, OnDestroy, OnInit, ViewChild} from '@angular/core';
import { CommonModule } from '@angular/common';
import {UsFormatPipe} from "../../pipes/us-format.pipe";
import BigNumber from "bignumber.js";
import {ChartService} from "../../services/chart.service";
import {PersistenceService} from "../../services/persistence.service";

@Component({
  selector: 'app-unstake-panel',
  standalone: true,
  imports: [CommonModule, UsFormatPipe],
  templateUrl: './unstake-panel.component.html'
})
export class UnstakePanelComponent implements OnInit, OnDestroy {

  unstakingChartEl: any;
  unstakingChart: any;
  @ViewChild("unstkApyChart", { static: true}) set b(b: ElementRef) { this.unstakingChartEl = b.nativeElement; }

  @Input({ required: true}) active!: boolean;
  @Input({ required: true}) userSicxBalance!: BigNumber;

  constructor(private chartService: ChartService,
              private persistenceService: PersistenceService) {
  }

  private unstakeWaitActive = true;

  ngOnInit(): void {
    this.chartService.initUnstakingApyChart(this.unstakingChartEl, this.unstakingChart);
  }

  ngOnDestroy(): void {
    this.unstakingChart?.remove();
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
}
