import {Component, Input} from '@angular/core';
import { CommonModule } from '@angular/common';
import {UsFormatPipe} from "../../../pipes/us-format.pipe";
import {UnstakeWaitSicxPayload} from "../../../models/classes/UnstakeWaitSicxPayload";
import {StateChangeService} from "../../../services/state-change.service";
import {TransactionDispatcherService} from "../../../services/transaction-dispatcher.service";
import {ScoreService} from "../../../services/score.service";
import {ModalType} from "../../../models/enums/ModalType";

@Component({
  selector: 'app-unstake-wait-modal',
  standalone: true,
  imports: [CommonModule, UsFormatPipe],
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
    return this.unstakeWaitSicxPayload?.unstakeSicxAmount?.toFixed(2) ?? "0";
  }

  getReceivedIcxAmount(): string {
    return this.unstakeWaitSicxPayload?.receiveIcxAmount?.toFixed(2) ?? "0";
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
