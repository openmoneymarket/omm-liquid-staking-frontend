import {Component, Input} from '@angular/core';
import {CommonModule} from '@angular/common';
import {StakeIcxPayload} from "../../../models/classes/StakeIcxPayload";
import {UsFormatPipe} from "../../../pipes/us-format.pipe";
import {StateChangeService} from "../../../services/state-change.service";
import {TransactionDispatcherService} from "../../../services/transaction-dispatcher.service";
import {ScoreService} from "../../../services/score.service";

@Component({
  selector: 'app-stake-modal',
  standalone: true,
  imports: [CommonModule, UsFormatPipe],
  templateUrl: './stake-modal.component.html'
})
export class StakeModalComponent {

  @Input({ required: true }) active!: boolean;

  @Input() stakeIcxPayload: StakeIcxPayload | undefined;

  constructor(private stateChangeService: StateChangeService,
              private transactionDispatcher: TransactionDispatcherService,
              private scoreService: ScoreService,
  ) {
  }

  getStakeIcxAmount(): string {
    return this.stakeIcxPayload?.stakeIcxAmount?.toFixed(2) ?? "0";
  }

  getReceivedSIcxAmount(): string {
    return this.stakeIcxPayload?.receiveSIcxAmount?.toFixed(2) ?? "0";
  }

  onCancelClick(e: MouseEvent): void {
    e.stopPropagation();

    this.stateChangeService.hideActiveModal();
  }

  onStakeClick(e: MouseEvent) {
    e.stopPropagation();

    const amount = this.stakeIcxPayload?.stakeIcxAmount;

    if (!amount) {
      throw new Error("[onStakeClick] amount undefined!");
    }

    const stakeIcxTx = this.scoreService.buildStakeIcxTx(amount);

    this.transactionDispatcher.dispatchTransaction(stakeIcxTx, this.stakeIcxPayload!);
  }
}
