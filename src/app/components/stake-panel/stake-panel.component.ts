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

  constructor(private persistenceService: PersistenceService,
              private stateChangeService: StateChangeService,
              private chartService: ChartService) {
    super();
  }

  ngOnInit(): void {
    this.chartService.initStakingApyChart(this.stakingApyChartEl, this.stakingApyChart);
  }

  ngOnDestroy(): void {
    this.stakingApyChart?.remove();
  }

  onStakeClick(e: MouseEvent) {
    e.stopPropagation();

    if (this.persistenceService.userLoggedIn()) {
      this.stateChangeService.modalUpdate(ModalType.STAKE_ICX, new StakeIcxPayload(
          new BigNumber(this.stakeInputAmount),
          new BigNumber(this.unstakeInputAmount),
      ));
    } else {
      this.stateChangeService.modalUpdate(ModalType.SIGN_IN);
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

}
