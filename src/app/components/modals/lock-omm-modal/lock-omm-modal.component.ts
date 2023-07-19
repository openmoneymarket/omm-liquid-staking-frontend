import {Component, Input} from '@angular/core';
import { CommonModule } from '@angular/common';
import {timestampInMillisecondsToPrettyDate} from "../../../common/utils";
import {OmmLockingPayload} from "../../../models/classes/OmmLockingPayload";
import BigNumber from "bignumber.js";
import {UsFormatPipe} from "../../../pipes/us-format.pipe";
import {StateChangeService} from "../../../services/state-change.service";
import {ModalType} from "../../../models/enums/ModalType";
import {ScoreService} from "../../../services/score.service";
import {TransactionDispatcherService} from "../../../services/transaction-dispatcher.service";

@Component({
  selector: 'app-lock-omm-modal',
  standalone: true,
  imports: [CommonModule, UsFormatPipe],
  templateUrl: './lock-omm-modal.component.html'
})
export class LockOmmModalComponent {

  lockOmmProcessing = false;

  @Input({ required: true }) active!: boolean;

  _payload: OmmLockingPayload | undefined;
  @Input() set payload(value: OmmLockingPayload | undefined) {
    this._payload = value;
    this.lockOmmProcessing = false;
  }

  get payload(): OmmLockingPayload | undefined { return this._payload };

  protected readonly timestampInMillisecondsToPrettyDate = timestampInMillisecondsToPrettyDate;

  constructor(private stateChangeService: StateChangeService,
              private scoreService: ScoreService,
              private transactionDispatcher: TransactionDispatcherService) {

  }

  subscribeToLockedOmmActionSucceeded(): void {
    // change lock modal button text to default and open apply bOMM boost modal
    this.stateChangeService.lockedOmmActionSucceeded$.subscribe((success) => {
      // this.stateChangeService.hideActiveModal();
      // this.lockOmmProcessing = false;

      if (success) {
        // TODO if apply bOmm boost is required
        // this.stateChangeService.userAccumulatedFeeChange$.pipe(take(1)).subscribe(userAccumulatedFee => {
        //   if (userAccumulatedFee.gte(0.01)) {
        //     this.modalService.showNewModal(ModalType.CLAIM_AND_APPLY_BOMM_BOOST, new AssetAction(new Asset(AssetClass.USDS, AssetName.USDS,
        //         AssetTag.USDS), Utils.ZERO, Utils.ZERO, Utils.ZERO, undefined, new ClaimOmmDetails(
        //         this.persistenceService.userAccumulatedOmmRewards)));
        //   } else {
        //     this.modalService.showNewModal(ModalType.APPLY_BOMM_BOOST);
        //   }
        // });
      }
    });
  }

  amount(): number {
    return this.payload?.amount ?? 0;
  }

  before(): number {
    return this.payload?.before ?? 0;
  }

  after(): number {
    return this.payload?.after ?? 0;
  }

  lockingTime(): BigNumber {
    return this.payload?.lockingTime ?? new BigNumber(0);
  }

  onCancelClick(e: MouseEvent): void {
    e.stopPropagation();

    this.stateChangeService.hideActiveModal();
  }

  onConfirmLockUpOmmClick(e: MouseEvent) {
    e.stopPropagation();

    const amount = this.amount();
    const lockingTime = this.lockingTime();

    let tx;
    if (this.payload?.modalType  === ModalType.INCREASE_LOCK_OMM) {
      tx = this.scoreService.buildIncreaseLockAmountOmmTx(amount);
    } else if (this.payload?.modalType === ModalType.INCREASE_LOCK_TIME) {
      tx = this.scoreService.buildIncreaseLockTimeOmmTx(lockingTime);
    } else if (this.payload?.modalType === ModalType.INCREASE_LOCK_TIME_AND_AMOUNT) {
      tx = this.scoreService.buildIncreaseLockPeriodAndAmountOmmTx(amount, lockingTime);
    } else {
      tx = this.scoreService.buildLockOmmTx(amount, lockingTime);
    }

    this.transactionDispatcher.dispatchTransaction(tx, this.payload!);
  }
}
