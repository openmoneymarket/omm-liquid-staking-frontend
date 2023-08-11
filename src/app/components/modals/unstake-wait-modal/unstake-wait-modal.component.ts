import {Component, Input} from '@angular/core';
import { CommonModule } from '@angular/common';
import {UsFormatPipe} from "../../../pipes/us-format.pipe";
import {UnstakeWaitSicxPayload} from "../../../models/classes/UnstakeWaitSicxPayload";
import {StateChangeService} from "../../../services/state-change.service";
import {TransactionDispatcherService} from "../../../services/transaction-dispatcher.service";
import {ScoreService} from "../../../services/score.service";
import BigNumber from "bignumber.js";
import {SecondsToDaysPipe} from "../../../pipes/seconds-to-days";

@Component({
  selector: 'app-unstake-wait-modal',
  standalone: true,
  imports: [CommonModule, UsFormatPipe, SecondsToDaysPipe],
  templateUrl: './unstake-wait-modal.component.html'
})
export class UnstakeWaitModalComponent {

  @Input({ required: true }) active!: boolean;

  @Input() unstakeWaitSicxPayload: UnstakeWaitSicxPayload | undefined;


  constructor(private stateChangeService: StateChangeService,
              private transactionDispatcher: TransactionDispatcherService,
              private scoreService: ScoreService,
  ) {
  }

  getUnstakeSicxAmount(): string {
    return this.unstakeWaitSicxPayload?.unstakeSicxAmount?.toFixed(2, BigNumber.ROUND_DOWN) ?? "0";
  }

  getReceivedIcxAmount(): string {
    return this.unstakeWaitSicxPayload?.receiveIcxAmount?.toFixed(2, BigNumber.ROUND_DOWN) ?? "0";
  }

  getUnstakingTimeInSeconds(): BigNumber {
    return this.unstakeWaitSicxPayload?.unstakingTimeInSeconds ?? new BigNumber(0);
  }

  onCancelClick(e: MouseEvent): void {
    e.stopPropagation();

    this.stateChangeService.hideActiveModal();
  }

  onUnstakeClick(e: MouseEvent) {
    e.stopPropagation();

    const amount = this.unstakeWaitSicxPayload?.unstakeSicxAmount;

    if (!amount) {
      throw new Error("[onUnstakeClick] amount undefined!");
    }

    const unstakeIcxTx = this.scoreService.buildUnstakeSicxTx(amount);

    this.transactionDispatcher.dispatchTransaction(unstakeIcxTx, this.unstakeWaitSicxPayload!);
  }
}
