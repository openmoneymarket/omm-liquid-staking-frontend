import { Component, Input } from "@angular/core";
import { CommonModule } from "@angular/common";
import { UnstakeInstantSicxPayload } from "../../../models/classes/UnstakeInstantSicxPayload";
import { StateChangeService } from "../../../services/state-change.service";
import { TransactionDispatcherService } from "../../../services/transaction-dispatcher.service";
import { ScoreService } from "../../../services/score.service";
import { ModalType } from "../../../models/enums/ModalType";
import { UsFormatPipe } from "../../../pipes/us-format.pipe";
import BigNumber from "bignumber.js";

@Component({
  selector: "app-unstake-instant-modal",
  standalone: true,
  imports: [CommonModule, UsFormatPipe],
  templateUrl: "./unstake-instant-modal.component.html",
})
export class UnstakeInstantModalComponent {
  @Input({ required: true }) active!: boolean;

  @Input() unstakeInstantSicxPayload: UnstakeInstantSicxPayload | undefined;

  constructor(
    private stateChangeService: StateChangeService,
    private transactionDispatcher: TransactionDispatcherService,
    private scoreService: ScoreService,
  ) {}

  getUnstakeSicxAmount(): string {
    return this.unstakeInstantSicxPayload?.unstakeSicxAmount?.toFixed(2, BigNumber.ROUND_DOWN) ?? "0";
  }

  getReceivedIcxAmount(): string {
    return this.unstakeInstantSicxPayload?.receiveIcxAmount?.toFixed(2, BigNumber.ROUND_DOWN) ?? "0";
  }

  getFeeAmount(): string {
    return this.unstakeInstantSicxPayload?.fee.toFixed(2, BigNumber.ROUND_DOWN) ?? "0";
  }

  onCancelClick(e: MouseEvent): void {
    e.stopPropagation();

    this.stateChangeService.hideActiveModal();
  }

  onUnstakeClick(e: MouseEvent) {
    e.stopPropagation();

    const amount = this.unstakeInstantSicxPayload?.unstakeSicxAmount;

    if (!amount) {
      throw new Error("[onUnstakeClick] amount undefined!");
    }

    const unstakeIcxTx = this.scoreService.buildInstantUnstakeSicxTx(amount);

    this.transactionDispatcher.dispatchTransaction(unstakeIcxTx, this.unstakeInstantSicxPayload!);
  }
}
