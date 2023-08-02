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

  _payload: UpdateDelegationPayload | undefined;

  @Input() set payload(value: UpdateDelegationPayload | undefined) {
    this._payload = value;
    this.useDelegationForBommAndSicx = false;
  }

  get payload(): UpdateDelegationPayload | undefined {
    return this._payload;
  }

  useDelegationForBommAndSicx = false;

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
      let tx;

      if (this.useDelegationForBommAndSicx) {
        tx = this.scoreService.buildUpdateBommAndSicxDelegationsTx(this.payload.userDelegations);
      } else {
        if (this.payload.isBommDelegation) {
          tx = this.scoreService.buildUpdateBommDelegationsTx(this.payload.userDelegations);
        } else {
          tx = this.scoreService.buildUpdateSicxDelegationsTx(this.payload.userDelegations);
        }
      }

      this.transactionDispatcher.dispatchTransaction(tx, this.payload);
    } else {
      throw new Error(`[UpdateDelegationsModalComponent.onUnstakeClick] payload undefined!`)
    }
  }
}
