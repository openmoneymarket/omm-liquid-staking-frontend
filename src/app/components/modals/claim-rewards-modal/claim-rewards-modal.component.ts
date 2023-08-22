import {Component, Input} from '@angular/core';
import { CommonModule } from '@angular/common';
import {StateChangeService} from "../../../services/state-change.service";
import {TransactionDispatcherService} from "../../../services/transaction-dispatcher.service";
import {ScoreService} from "../../../services/score.service";
import BigNumber from "bignumber.js";
import {ClaimRewardsPayload} from "../../../models/classes/ClaimRewardsPayload";
import {UsFormatPipe} from "../../../pipes/us-format.pipe";
import {RndDwnPipePipe} from "../../../pipes/round-down.pipe";

@Component({
  selector: 'app-claim-rewards-modal',
  standalone: true,
    imports: [CommonModule, UsFormatPipe, RndDwnPipePipe],
  templateUrl: './claim-rewards-modal.component.html'
})
export class ClaimRewardsModalComponent {

  @Input({ required: true }) active!: boolean;

  @Input() payload: ClaimRewardsPayload | undefined;

  constructor(private stateChangeService: StateChangeService,
              private transactionDispatcher: TransactionDispatcherService,
              private scoreService: ScoreService,
  ) {
  }

  getUserIcxbalance(): BigNumber {
    return this.payload?.userIcxBalance ?? new BigNumber(0);
  }

  getClaimableAmount(): BigNumber {
    return this.payload?.claimableAmount ?? new BigNumber(0);
  }

  getAfterClaimIcxAmount(): BigNumber {
    return this.payload?.afterClaimIcxAmount ?? new BigNumber(0);
  }

  onCancelClick(e: MouseEvent): void {
    e.stopPropagation();

    this.stateChangeService.hideActiveModal();
  }

  onClaimClick(e: MouseEvent) {
    e.stopPropagation();

    if (this.payload) {
      const tx = this.scoreService.buildClaimRewardsTx();

      this.transactionDispatcher.dispatchTransaction(tx, this.payload);
    } else {
      throw new Error("[onClaimClick] claimRewardsPayload undefined!");
    }
  }
}
