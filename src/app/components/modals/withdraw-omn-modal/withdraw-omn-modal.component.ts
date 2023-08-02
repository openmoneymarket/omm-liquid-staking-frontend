import {Component, Input} from '@angular/core';
import { CommonModule } from '@angular/common';
import {WithdrawLockedOmmPayload} from "../../../models/classes/WithdrawLockedOmmPayload";
import BigNumber from "bignumber.js";
import {UsFormatPipe} from "../../../pipes/us-format.pipe";
import {StateChangeService} from "../../../services/state-change.service";
import {TransactionDispatcherService} from "../../../services/transaction-dispatcher.service";
import {ScoreService} from "../../../services/score.service";
import {RndDwnPipePipe} from "../../../pipes/round-down.pipe";

@Component({
  selector: 'app-withdraw-omn-modal',
  standalone: true,
    imports: [CommonModule, UsFormatPipe, RndDwnPipePipe],
  templateUrl: './withdraw-omn-modal.component.html'
})
export class WithdrawOmnModalComponent {

  @Input({ required: true }) active!: boolean;

  @Input() payload: WithdrawLockedOmmPayload | undefined;

  constructor(private stateChangeService: StateChangeService,
              private transactionDispatcher: TransactionDispatcherService,
              private scoreService: ScoreService) {
  }
  amount(): BigNumber {
    return this.payload?.amount ?? new BigNumber(0);
  }

  before(): BigNumber {
    return this.payload?.before ?? new BigNumber(0);
  }

  after(): BigNumber {
    return this.payload?.after ?? new BigNumber(0);
  }

  onCancelClick(e: MouseEvent): void {
    e.stopPropagation();

    this.stateChangeService.hideActiveModal();
  }

  onWithdrawOmmClick(e: MouseEvent) {
    e.stopPropagation();

    const tx = this.scoreService.buildWithdrawLockedOmm();

    this.transactionDispatcher.dispatchTransaction(tx, this.payload!);
  }

}
