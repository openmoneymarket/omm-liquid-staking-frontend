import {Injectable} from '@angular/core';
import {DataLoaderService} from "./data-loader.service";
import log from "loglevel";
import {ModalActionsResult, ModalStatus} from "../models/classes/ModalAction";
import {StateChangeService} from "./state-change.service";
import {IconApiService} from "./icon-api.service";
import {IconJsonRpcResponse} from "../models/interfaces/icon-json-rpc-response";
import {NotificationService} from "./notification.service";
import {StoreService} from "./store.service";
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
              private storeService: StoreService) {
  }

  public processIconexTransactionResult(payload: IconJsonRpcResponse, maxRetry = 5): void {
    // get last modal action from store service
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
          log.error("Transaction failed! Details: ", res);
        }
      }).catch(e => {
        if (maxRetry > 0) {
          setTimeout( () => this.processIconexTransactionResult(payload, maxRetry - 1), 2200);
        } else {
          log.error("Error in isTxConfirmed:", e);

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

  processIconTransactionResult(txHash: string, maxRetry = 5): void {
    // get last modal action from store service
    const modalPayload: ModalPayload | undefined = this.storeService.getLastModalAction();

    this.iconApiService.getTxResult(txHash).then((res: any) => {
      // reload all reserves and user specific data (reserve, account data, ..)
      this.dataLoaderService.afterUserActionReload();

      // success
      if (res.status === 1) {
        // show proper success notification
        this.showSuccessActionNotification(modalPayload, txHash);
      } else {
        // show proper failed notification
        this.showFailedActionNotification(modalPayload, txHash);
        log.error("Transaction failed! Details: ", res);
      }
    }).catch(e => {
      if (maxRetry > 0) {
        setTimeout(() => this.processIconTransactionResult(txHash, maxRetry - 1), 2200);
      } else {
        log.error("Error in isTxConfirmed:", e);

        this.notificationService.hideOldest();
        this.notificationService.showNewNotification("Failed to confirm the transaction.", txHash)

        // reload all reserves and user specific data (reserve, account data, ..)
        this.dataLoaderService.afterUserActionReload();
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
