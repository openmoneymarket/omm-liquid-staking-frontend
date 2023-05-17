import {Component, ElementRef, OnDestroy, OnInit, ViewChild} from '@angular/core';
import { CommonModule } from '@angular/common';
import {ChartService} from "../../services/chart.service";

@Component({
  selector: 'app-stake',
  standalone: true,
  host: {
    style: "display: contents"
  },
  imports: [CommonModule],
  templateUrl: './stake.component.html'
})
export class StakeComponent implements OnDestroy, OnInit {

  stakingApyChartEl: any;
  stakingApyChart: any;
  @ViewChild("stkApyChart", { static: true}) set a(a: ElementRef) { this.stakingApyChartEl = a.nativeElement; }

  unstakingChartEl: any;
  unstakingChart: any;
  @ViewChild("unstkApyChart", { static: true}) set b(b: ElementRef) { this.unstakingChartEl = b.nativeElement; }

  private stakeActive = true;
  private unstakeWaitActive = true;

  constructor(private chartService: ChartService) {

  }

  ngOnInit(): void {
    this.chartService.initStakingApyChart(this.stakingApyChartEl, this.stakingApyChart);
    this.chartService.initUnstakingApyChart(this.unstakingChartEl, this.unstakingChart);
  }

  ngOnDestroy(): void {
    this.stakingApyChart?.remove();
  }

  stakePanelActive(): boolean {
    return this.stakeActive;
  }

  unstakePanelActive(): boolean {
    return !this.stakeActive;
  }

  unstakeWaitIsActive(): boolean {
    return this.unstakeWaitActive;
  }

  unstakeInstantIsActive(): boolean {
    return !this.unstakeWaitActive;
  }

  onStakeToggleClick(e: MouseEvent) {
    e.stopPropagation();

    this.stakeActive = true;
  }

  onUnstakeToggleClick(e: MouseEvent) {
    e.stopPropagation();

    this.stakeActive = false;
  }

  onUnstakeWaitClick(e: MouseEvent) {
    e.stopPropagation();

    this.unstakeWaitActive = true;
  }

  onUnstakeInstantClick(e: MouseEvent) {
    e.stopPropagation();

    this.unstakeWaitActive = false;
  }
}
