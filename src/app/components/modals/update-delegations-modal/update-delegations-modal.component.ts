import {Component, Input} from '@angular/core';
import { CommonModule } from '@angular/common';
import {StateChangeService} from "../../../services/state-change.service";
import {TransactionDispatcherService} from "../../../services/transaction-dispatcher.service";
import {ScoreService} from "../../../services/score.service";
import {UpdateDelegationPayload} from "../../../models/classes/updateDelegationPayload";
import {FormsModule} from "@angular/forms";
import {RndDwnNPercPipe} from "../../../pipes/round-down-percent.pipe";

@Component({
  selector: 'app-update-delegations-modal',
  standalone: true,
  imports: [CommonModule, FormsModule, RndDwnNPercPipe],
  templateUrl: './update-delegations-modal.component.html'
})
export class UpdateDelegationsModalComponent {

  @Input({ required: true }) active!: boolean;
  @Input() payload: UpdateDelegationPayload | undefined;

  constructor(private stateChangeService: StateChangeService,
              private transactionDispatcher: TransactionDispatcherService,
              private scoreService: ScoreService,
  ) {
  }

  onCancelClick(e: MouseEvent): void {
    e.stopPropagation();

    this.stateChangeService.hideActiveModal();
  }

  onUpdateVotesClick(e: MouseEvent) {
    e.stopPropagation();

    if (this.payload) {
      if (this.payload.isBommDelegation) {
        const updateBommDelegationsTx = this.scoreService.buildUpdateBommDelegationsTx(this.payload.userDelegations);
        this.transactionDispatcher.dispatchTransaction(updateBommDelegationsTx, this.payload);
      } else {
        const updateSicxDelegationsTx = this.scoreService.buildUpdateSicxDelegationsTx(this.payload.userDelegations);
        this.transactionDispatcher.dispatchTransaction(updateSicxDelegationsTx, this.payload);
      }
    } else {
      throw new Error(`[UpdateDelegationsModalComponent.onUnstakeClick] payload undefined!`)
    }
  }
}
