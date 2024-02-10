import {Injectable} from '@angular/core';
import IconService from "icon-sdk-js";
import BigNumber from "bignumber.js";
import {StoreService} from "./store.service";
import {IconexApiService} from "./iconex-api.service";
import {LedgerService} from "./ledger.service";
import {NotificationService} from "./notification.service";
import {IconApiService} from "./icon-api.service";
import {TransactionResultService} from "./transaction-result.service";
import {IconexId} from "../models/enums/IconexId";
import {WalletType} from "../models/enums/WalletType";
import {ModalPayload} from "../models/Types/ModalTypes";
import {StateChangeService} from "./state-change.service";

const { IconConverter } = IconService;

@Injectable({
  providedIn: 'root'
})
export class TransactionDispatcherService {

  /**
   * Service responsible for dispatching transactions using appropriate Icon supported wallets
   */

  constructor(
    private storeService: StoreService,
    private iconexApiService: IconexApiService,
    private ledgerService: LedgerService,
    private notificationService: NotificationService,
    private iconApiService: IconApiService,
    private transactionResultService: TransactionResultService,
    private stateChangeService: StateChangeService
  ) { }

  /**
   * Method that dispatches the built tx to Icon network (through Iconex, Bridge or directly) and triggers the proper notification
   */
  async dispatchTransaction(tx: any, modalPayload: ModalPayload, showSendTxMessage = true, iconexId = IconexId.SHOW_MESSAGE_HIDE_MODAL): Promise<void> {

    try {
      const estimateTx = IconConverter.toRawTransaction(tx);
      delete estimateTx["stepLimit"];
      const estimatedStepCost = await this.iconApiService.estimateStepCost(estimateTx);

      if (estimatedStepCost) {
        const estimateCostBuffered = estimatedStepCost.multipliedBy(new BigNumber("1.1")).dp(0);
        tx.stepLimit = this.iconApiService.convertNumberToHex(estimateCostBuffered);
      }

      // save modal payload
      this.storeService.lastModalPayload = modalPayload;

      if (this.storeService.activeWallet?.type == WalletType.ICON) {
        // save notification to be shown when Iconex sends tx
        this.notificationService.setNotificationToShow(modalPayload.sendTxMessage())

        this.iconexApiService.dispatchSendTransactionEvent(tx, iconexId);
      } else if (this.storeService.activeWallet?.type == WalletType.LEDGER) {
        const signedRawTx = await this.ledgerService.signTransaction(IconConverter.toRawTransaction(tx));

        const txHash = await this.iconApiService.sendTransaction({
          getProperties: () => signedRawTx,
          getSignature: () => signedRawTx.signature,
        });

        // hide active modal after tx has been successfully sent
        this.stateChangeService.hideActiveModal();

        // show send tx message (shown on tx commit)
        this.notificationService.showNewNotification(modalPayload.sendTxMessage(), txHash);

        this.transactionResultService.processIconTransactionResult(txHash);
      }
    } catch (e: any) {
      this.notificationService.showNewNotification("Transaction dispatch failed.");
    }
  }

}
