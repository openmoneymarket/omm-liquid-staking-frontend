import {Component, Input} from '@angular/core';
import { CommonModule } from '@angular/common';
import {GovernanceVotePayload} from "../../../models/classes/GovernanceVotePayload";
import {StateChangeService} from "../../../services/state-change.service";
import {TransactionDispatcherService} from "../../../services/transaction-dispatcher.service";
import {ScoreService} from "../../../services/score.service";
import BigNumber from "bignumber.js";
import {UsFormatPipe} from "../../../pipes/us-format.pipe";
import {RndDwnPipePipe} from "../../../pipes/round-down.pipe";

@Component({
  selector: 'app-submit-vote-modal',
  standalone: true,
    imports: [CommonModule, UsFormatPipe, RndDwnPipePipe],
  templateUrl: './submit-vote-modal.component.html'
})
export class SubmitVoteModalComponent {

  @Input({ required: true }) active!: boolean;
  @Input() payload: GovernanceVotePayload | undefined;

  constructor(private stateChangeService: StateChangeService,
              private transactionDispatcher: TransactionDispatcherService,
              private scoreService: ScoreService,
  ) {

  }

  userVotingWeight(): BigNumber {
    return this.payload?.userVotingWeight ?? new BigNumber(0);
  }

  isProposalApprove(): boolean {
    return this.payload?.approveProposal ?? false;
  }

  onCancelClick(e: MouseEvent): void {
    e.stopPropagation();

    this.stateChangeService.hideActiveModal();
  }

  onSubmitVoteClick(e: MouseEvent) {
    e.stopPropagation();

    if (this.userVotingWeight().isLessThanOrEqualTo(0)) {
      return;
    }

    if (this.payload) {
      const tx = this.scoreService.buildCastVote(new BigNumber(this.payload.proposalId), this.payload.approveProposal);
      this.transactionDispatcher.dispatchTransaction(tx, this.payload);
    } else {
      throw Error("[SubmitVoteModalComponent] payload undefined!")
    }
  }
}
