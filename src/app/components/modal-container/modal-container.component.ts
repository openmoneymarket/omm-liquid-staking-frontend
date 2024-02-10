import {ChangeDetectionStrategy, ChangeDetectorRef, Component, OnDestroy, OnInit} from '@angular/core';
import {CommonModule} from '@angular/common';
import {Subscription} from "rxjs";
import {StateChangeService} from "../../services/state-change.service";
import {StakeIcxPayload} from "../../models/classes/StakeIcxPayload";
import {SignInModalComponent} from "../modals/sign-in-modal/sign-in-modal.component";
import {ModalType} from "../../models/enums/ModalType";
import {LedgerLoginModalComponent} from "../modals/ledger-login-modal/ledger-login-modal.component";
import {StakeModalComponent} from "../modals/stake-modal/stake-modal.component";
import {UnstakeWaitModalComponent} from "../modals/unstake-wait-modal/unstake-wait-modal.component";
import {UnstakeWaitSicxPayload} from "../../models/classes/UnstakeWaitSicxPayload";
import {UnstakeInstantSicxPayload} from "../../models/classes/UnstakeInstantSicxPayload";
import {UnstakeInstantModalComponent} from "../modals/unstake-instant-modal/unstake-instant-modal.component";
import {ClaimIcxPayload} from "../../models/classes/ClaimIcxPayload";
import {ClaimIcxModalComponent} from "../modals/claim-icx-modal/claim-icx-modal.component";
import {WithdrawLockedOmmPayload} from "../../models/classes/WithdrawLockedOmmPayload";
import {WithdrawOmnModalComponent} from "../modals/withdraw-omn-modal/withdraw-omn-modal.component";
import {LockOmmModalComponent} from "../modals/lock-omm-modal/lock-omm-modal.component";
import {OmmLockingPayload} from "../../models/classes/OmmLockingPayload";
import {SubmitProposalPayload} from "../../models/classes/SubmitProposalPayload";
import {SubmitProposalModalComponent} from "../modals/submit-proposal-modal/submit-proposal-modal.component";
import {ClaimRewardsPayload} from "../../models/classes/ClaimRewardsPayload";
import {ClaimRewardsModalComponent} from "../modals/claim-rewards-modal/claim-rewards-modal.component";
import {UpdateDelegationPayload} from "../../models/classes/updateDelegationPayload";
import {RemoveDelegationsPayload} from "../../models/classes/removeDelegationsPayload";
import {UpdateDelegationsModalComponent} from "../modals/update-delegations-modal/update-delegations-modal.component";
import {RemoveDelegationsModalComponent} from "../modals/remove-delegations-modal/remove-delegations-modal.component";
import {GovernanceVotePayload} from "../../models/classes/GovernanceVotePayload";
import {SubmitVoteModalComponent} from "../modals/submit-vote-modal/submit-vote-modal.component";

@Component({
  selector: 'app-modal',
  standalone: true,
  imports: [
    CommonModule,
    SignInModalComponent,
    LedgerLoginModalComponent,
    StakeModalComponent,
    UnstakeWaitModalComponent,
    UnstakeInstantModalComponent,
    ClaimIcxModalComponent,
    WithdrawOmnModalComponent,
    LockOmmModalComponent,
    SubmitProposalModalComponent,
    ClaimRewardsModalComponent,
    UpdateDelegationsModalComponent,
    RemoveDelegationsModalComponent,
    SubmitVoteModalComponent
  ],
  templateUrl: './modal-container.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ModalContainerComponent implements OnInit, OnDestroy {

  protected readonly ModalType = ModalType;

  stakeIcxPayload?: StakeIcxPayload;
  unstakeWaitSicxPayload?: UnstakeWaitSicxPayload;
  unstakeInstantSicxPayload?: UnstakeInstantSicxPayload;
  claimIcxPayload? : ClaimIcxPayload;
  withdrawLockedOmmPayload?: WithdrawLockedOmmPayload;
  ommLockingPayload?: OmmLockingPayload;
  submitProposalPayload?: SubmitProposalPayload;
  claimRewardsPayload?: ClaimRewardsPayload;
  updateDelegationPayload?: UpdateDelegationPayload;
  removeDelegationsPayload?: RemoveDelegationsPayload;
  governanceVotePayload?: GovernanceVotePayload;

  // Subscriptions
  payloadSub?: Subscription;

  activeModal: ModalType = ModalType.UNDEFINED;

  constructor(
      private stateChangeService: StateChangeService,
      private cdRef: ChangeDetectorRef,
  ) {

  }
  ngOnInit(): void {
    this.subscribeToModalPayloadChange();
  }

  ngOnDestroy(): void {
    this.payloadSub?.unsubscribe();
  }

  subscribeToModalPayloadChange(): void {
    this.payloadSub = this.stateChangeService.modalPayloadChange$.subscribe(({ modalType, payload}) => {
      if (payload instanceof StakeIcxPayload) {
        this.stakeIcxPayload = payload;
      } else if (payload instanceof UnstakeWaitSicxPayload) {
        this.unstakeWaitSicxPayload = payload;
      } else if (payload instanceof  UnstakeInstantSicxPayload) {
        this.unstakeInstantSicxPayload = payload;
      } else if (payload instanceof  ClaimIcxPayload) {
        this.claimIcxPayload = payload;
      } else if (payload instanceof WithdrawLockedOmmPayload) {
        this.withdrawLockedOmmPayload = payload;
      } else if (payload instanceof OmmLockingPayload) {
        this.ommLockingPayload = payload;
      } else if (payload instanceof SubmitProposalPayload) {
        this.submitProposalPayload = payload;
      } else if (payload instanceof  ClaimRewardsPayload) {
        this.claimRewardsPayload = payload;
      } else if (payload instanceof UpdateDelegationPayload) {
        this.updateDelegationPayload = payload;
      } else if (payload instanceof RemoveDelegationsPayload) {
        this.removeDelegationsPayload = payload;
      } else if (payload instanceof GovernanceVotePayload) {
        this.governanceVotePayload = payload;
      } else {
        this.resetModalPayloads();
      }

      this.activeModal = modalType;

      // detect any new changes
      this.cdRef.detectChanges();
    });
  }

  private resetModalPayloads(): void {
    this.stakeIcxPayload = undefined;
    this.unstakeWaitSicxPayload = undefined;
    this.unstakeInstantSicxPayload = undefined;
    this.claimIcxPayload = undefined;
    this.withdrawLockedOmmPayload = undefined;
    this.ommLockingPayload = undefined;
    this.submitProposalPayload = undefined;
    this.claimRewardsPayload = undefined;
    this.updateDelegationPayload = undefined;
    this.removeDelegationsPayload = undefined;
    this.governanceVotePayload = undefined;

    // detect any new changes
    this.cdRef.detectChanges();
  }

  isModalActive(type: ModalType): boolean {
    return this.activeModal === type;
  }

  modalIsLockingType(): boolean {
    return this.activeModal === ModalType.LOCK_OMM
        || this.activeModal === ModalType.INCREASE_LOCK_OMM
        || this.activeModal === ModalType.INCREASE_LOCK_TIME
        || this.activeModal === ModalType.INCREASE_LOCK_TIME_AND_AMOUNT;
  }

}
