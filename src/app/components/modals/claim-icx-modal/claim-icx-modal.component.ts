import {Component, Input} from '@angular/core';
import { CommonModule } from '@angular/common';
import {ClaimIcxPayload} from "../../../models/classes/ClaimIcxPayload";
import BigNumber from "bignumber.js";
import {UsFormatPipe} from "../../../pipes/us-format.pipe";
import {StateChangeService} from "../../../services/state-change.service";
import {TransactionDispatcherService} from "../../../services/transaction-dispatcher.service";
import {ScoreService} from "../../../services/score.service";
import {RndDwnPipePipe} from "../../../pipes/round-down.pipe";

@Component({
  selector: 'app-claim-icx-modal',
  standalone: true,
    imports: [CommonModule, UsFormatPipe, RndDwnPipePipe],
  templateUrl: './claim-icx-modal.component.html'
})
export class ClaimIcxModalComponent {

  @Input({ required: true }) active!: boolean;

  @Input() claimIcxPayload: ClaimIcxPayload | undefined;

  constructor(private stateChangeService: StateChangeService,
              private transactionDispatcher: TransactionDispatcherService,
              private scoreService: ScoreService,
  ) {
  }
  getClaimableAmount(): BigNumber {
    return this.claimIcxPayload?.claimableAmount ?? new BigNumber(0);
  }

  getUserIcxBalance(): BigNumber {
    return this.claimIcxPayload?.userIcxBalance ?? new BigNumber(0);
  }

  getAfterClaimIcxAmount(): BigNumber {
    return this.claimIcxPayload?.afterClaimIcxAmount ?? new BigNumber(0);
  }

  onCancelClick(e: MouseEvent): void {
    e.stopPropagation();

    this.stateChangeService.hideActiveModal();
  }

  onClaimClick(e: MouseEvent) {
    e.stopPropagation();

    if (this.claimIcxPayload) {
      const claimIcxTx = this.scoreService.buildClaimUnstakedIcxTx();

      this.transactionDispatcher.dispatchTransaction(claimIcxTx, this.claimIcxPayload);
    } else {
      throw new Error("[ClaimIcxModalComponent.onClaimClick()] claimIcxPayload undefined!");
    }
  }
}
