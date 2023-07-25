import {Component, Input} from '@angular/core';
import { CommonModule } from '@angular/common';
import {StateChangeService} from "../../../services/state-change.service";
import {TransactionDispatcherService} from "../../../services/transaction-dispatcher.service";
import {ScoreService} from "../../../services/score.service";
import {RemoveDelegationsPayload} from "../../../models/classes/removeDelegationsPayload";

@Component({
  selector: 'app-remove-delegations-modal',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './remove-delegations-modal.component.html'
})
export class RemoveDelegationsModalComponent {

  @Input({ required: true }) active!: boolean;
  @Input() payload: RemoveDelegationsPayload | undefined;

  constructor(private stateChangeService: StateChangeService,
              private transactionDispatcher: TransactionDispatcherService,
              private scoreService: ScoreService,
  ) {
  }

  onCancelClick(e: MouseEvent): void {
    e.stopPropagation();

    this.stateChangeService.hideActiveModal();
  }

  onRemoveVotesClick(e: MouseEvent) {
    e.stopPropagation();

    if (this.payload) {
      const tx = this.scoreService.buildRemoveAllVotes();

      this.transactionDispatcher.dispatchTransaction(tx, this.payload);
    } else {
      throw new Error(`[RemoveDelegationsModalComponent.onUnstakeClick] payload undefined!`)
    }
  }
}
