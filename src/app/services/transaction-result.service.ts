import {Injectable} from '@angular/core';
import {DataLoaderService} from "./data-loader.service";
import log from "loglevel";
// import {LocalStorageService} from "./local-storage/local-storage.service";
import {ModalAction, ModalActionsResult, ModalStatus} from "../models/classes/ModalAction";
import {ModalType} from "../models/enums/ModalType";
import {StateChangeService} from "./state-change.service";
import {Router} from "@angular/router";
import {
  FAILURE_APPLY_BOMM_BOOST,
  FAILURE_CAST_VOTE,
  FAILURE_CLAIM_AND_APPLY_BOMM_BOOST,
  FAILURE_CLAIM_ICX,
  FAILURE_CLAIM_OMM,
  FAILURE_INCREASE_LOCK_OMM,
  FAILURE_INCREASE_LOCK_TIME,
  FAILURE_INCREASE_LOCK_TIME_AND_AMOUNT,
  FAILURE_LOCK_OMM,
  FAILURE_REMOVE_ALL_VOTES,
  FAILURE_SUBMIT_PROPOSAL,
  FAILURE_UNSTAKE_OMM,
  FAILURE_UPDATE_VOTES,
  FAILURE_WITHDRAW_LOCKED_OMM,
  SUCCESS_APPLY_BOMM_BOOST,
  SUCCESS_CAST_VOTE,
  SUCCESS_CLAIM_ICX,
  SUCCESS_CLAIM_OMM,
  SUCCESS_INCREASE_LOCK_TIME,
  SUCCESS_INCREASE_LOCK_TIME_AND_AMOUNT,
  SUCCESS_INCREASE_LOCKED_OMM,
  SUCCESS_LOCK_OMM,
  SUCCESS_REMOVE_VOTES,
  SUCCESS_SUBMIT_PROPOSAL,
  SUCCESS_UNSTAKE_OMM,
  SUCCESS_UPDATE_VOTES,
  SUCCESS_WITHDRAW_LOCKED_OMM
} from "../common/messages";
import {IconApiService} from "./icon-api.service";
import {IconJsonRpcResponse} from "../models/interfaces/icon-json-rpc-response";
import {NotificationService} from "./notification.service";
import {StoreService} from "./store.service";
import {extractTxFailureMessage} from "../common/utils";
import {ModalPayload} from "../models/Types/ModalTypes";

@Injectable({
  providedIn: 'root'
})
export class TransactionResultService {

  constructor(private iconApiService: IconApiService,
              private dataLoaderService: DataLoaderService,
              private notificationService: NotificationService,
              // private localStorageService: LocalStorageService,
              private stateChangeService: StateChangeService,
              private storeService: StoreService,
              private router: Router) {
  }

  public processIconexTransactionResult(payload: IconJsonRpcResponse, maxRetry: number = 5): void {
    // get last modal action from localstorage
    const modalPayload: ModalPayload | undefined = this.storeService.getLastModalAction();

    if (payload.result) {
      this.iconApiService.getTxResult(payload.result).then(res => {
        // reload all reserves and user specific data (reserve, account data, ..)
        this.dataLoaderService.afterUserActionReload();

        // success
        if (res.status === 1) {
          // show proper success notification
          this.showSuccessActionNotification(modalPayload, payload.result);
        } else {
          // show proper failed notification
          this.showFailedActionNotification(modalPayload, payload.result);
          log.debug("Transaction failed! Details: ", res);
        }
      }).catch(e => {
        if (maxRetry > 0) {
          setTimeout( () => this.processIconexTransactionResult(payload, maxRetry - 1), 2200);
        } else {
          log.debug("Error in isTxConfirmed:", e);

          this.notificationService.hideOldest();
          this.notificationService.showNewNotification("Failed to confirm the transaction.", payload.result)

          // reload all reserves and user specific data (reserve, account data, ..)
          this.dataLoaderService.afterUserActionReload();
        }
      });
    } else  {
      // reload all reserves and user specific data (reserve, account data, ..)
      this.dataLoaderService.afterUserActionReload();

      log.error(`ICON RPC ERROR details:`);
      log.error(payload);

      this.notificationService.hideOldest();
      this.notificationService.showNewNotification(payload?.error?.message ?? "ICON RPC ERROR")
    }
  }

  processIconTransactionResult(txHash: string, maxRetry: number = 5): void {
    // get last modal action from localstorage
    // const modalAction: ModalAction = this.persistenceService.getLastModalAction()!!; TODO

    this.iconApiService.getTxResult(txHash).then((res: any) => {
      // reload all reserves and user specific data (reserve, account data, ..)
      this.dataLoaderService.afterUserActionReload();

      // success
      if (res.status === 1) {
        // show proper success notification
        // this.showSuccessActionNotification(modalAction, txHash); TODO
      } else {
        // show proper failed notification
        // this.showFailedActionNotification(extractTxFailureMessage(res), modalAction); TODO
        log.debug("Transaction failed! Details: ", res);
      }
    }).catch(e => {
      if (maxRetry > 0) {
        setTimeout(() => this.processIconTransactionResult(txHash, maxRetry - 1), 2200);
      } else {
        // reload all reserves and user specific data (reserve, account data, ..)
        this.dataLoaderService.afterUserActionReload();

        log.debug("Error in isTxConfirmed:", e);
        // this.showFailedActionNotification("Failed to confirm the transaction.", payload.result); TODO
      }
    });
  }

  public showSuccessActionNotification(modalPayload?: ModalPayload, txHash?: string): void {
    if (modalPayload) {
      // hide oldest notification
      this.notificationService.hideOldest();

      this.stateChangeService.userModalActionResultUpdate(new ModalActionsResult(modalPayload, ModalStatus.SUCCESS));

      // default show success message
      this.notificationService.showNewNotification(modalPayload.successMessage(), txHash);
    } else {
     log.debug("[showSuccessActionNotification] modalPayload undefined!!!");
    }
  }

  public showFailedActionNotification(modalPayload?: ModalPayload, txHash?: string): void {
    if (modalPayload) {
      // hide oldest notification
      this.notificationService.hideOldest();

      this.stateChangeService.userModalActionResultUpdate(new ModalActionsResult(modalPayload, ModalStatus.FAILED));

      // default show error message
      this.notificationService.showNewNotification(modalPayload.errorMessage(), txHash);
    }
  }
}
