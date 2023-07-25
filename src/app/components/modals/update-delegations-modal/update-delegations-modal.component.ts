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

    console.log()

    if (this._payload) {
      const updateBommDelegationsTx = this.scoreService.buildUpdateBommDelegationsTx(this._payload.userDelegations);
      let updateSicxDelegationsTx;
      if (this.useDelegationForBommAndSicx) {
        updateSicxDelegationsTx = this.scoreService.buildUpdateSicxDelegationsTx(this._payload.userDelegations);
      }

      this.transactionDispatcher.dispatchTransaction(updateBommDelegationsTx, this._payload);

      if (updateSicxDelegationsTx) {
        // TODO subscribe to updateBommDelegationsTx result and commit updateSicxDelegationsTx
      }
    } else {
      throw new Error(`[UpdateDelegationsModalComponent.onUnstakeClick] payload undefined!`)
    }
  }

}
