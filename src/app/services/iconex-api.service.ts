import {Injectable} from "@angular/core";
import IconService from "icon-sdk-js";
import {TransactionResultService} from './transaction-result.service';
import log from "loglevel";
import {IconexId} from "../models/enums/IconexId";
import {DeviceDetectorService} from "ngx-device-detector";
import {ICONEX_WALLET_DOES_NOT_EXIST} from "../common/messages";
import {NotificationService} from "./notification.service";
import {WalletType} from "../models/enums/WalletType";
import {LoginService} from "./login.service";
import {Wallet} from "../models/classes/Wallet";
import {ModalType} from "../models/enums/ModalType";
import {StateChangeService} from "./state-change.service";

const { IconConverter } = IconService;

@Injectable({
  providedIn: "root"
})
export class IconexApiService {

  /*
  * https://www.icondev.io/docs/chrome-extension-connect
  */

  hasWalletExtension;

  constructor(private transactionResultService: TransactionResultService,
              // private loginService: LoginService,
              private notificationService: NotificationService,
              private stateChangeService: StateChangeService,
              private deviceService: DeviceDetectorService,
              private loginService: LoginService) {

    // on mobile default to true for wallet extension
    this.hasWalletExtension = this.deviceService.isMobile();
  }

  public iconexEventHandler( e: any): void {
    const {type, payload} = e.detail;
    log.debug("iconexEventHandler:");
    log.debug(type, " : ", payload);

    switch (type) {
      case "RESPONSE_HAS_ACCOUNT": {
        if (payload.hasAccount) {
          if (!this.hasWalletExtension) {
            this.hasWalletExtension = true;
          } else {
            this.requestAddress();
          }
        }
        else {
          this.notificationService.showNewNotification(ICONEX_WALLET_DOES_NOT_EXIST);
        }
        break;
      }
      case "RESPONSE_ADDRESS": {
        this.loginService.signInUser(new Wallet(payload, WalletType.ICON));
        break;
      }
      case "RESPONSE_SIGNING": {
        break;
      }
      case "RESPONSE_JSON-RPC": {
        log.debug("RESPONSE_JSON-RPC", payload.result);

        if (payload.id === IconexId.SHOW_MESSAGE_HIDE_MODAL) {
          this.notificationService.showNotificationToShow(payload.result);
          this.stateChangeService.hideActiveModal();
        }

        this.transactionResultService.processIconexTransactionResult(payload);
        break;
      }
      case "CANCEL_JSON-RPC": {
        throw new Error("ICONEX send transaction cancelled!");
      }
      default: {
        log.debug("Iconex default response handler:", payload, type);
        break;
      }
    }
  }

  /*
    REQUEST_HAS_ACCOUNT Requests for whether iconex has any icon wallet.
    Returns boolean-typed result in event.
   */
  public hasAccount(): void {
    this.dispatchIconexEvent("REQUEST_HAS_ACCOUNT", null);
  }

  /*
    REQUEST_ADDRESS Requests for the address to use for service.
   */
  public requestAddress(): void {
    this.dispatchIconexEvent("REQUEST_ADDRESS", null);
  }

  public dispatchIconexEvent(requestType: string, payload: any): void {
    window.dispatchEvent(new CustomEvent("ICONEX_RELAY_REQUEST", {
      detail: {
        type: requestType,
        payload
      }}));
  }

  public dispatchSendTransactionEvent(transaction: any, id: number = IconexId.DEFAULT): void {
    window.dispatchEvent(new CustomEvent("ICONEX_RELAY_REQUEST", {
      detail: {
        type: "REQUEST_JSON-RPC",
        payload: {
          jsonrpc: "2.0",
          method: "icx_sendTransaction",
          params: IconConverter.toRawTransaction(transaction),
          id
        }
      }
    }));
  }

  public dispatchSignTransactionEvent(transaction: any): void {
    const payload = {
      detail: {
        type: "REQUEST_SIGNING",
        payload: IconConverter.toRawTransaction(transaction)
      }
    };
    log.debug("dispatchSignTransactionEvent payload:");
    log.debug(payload);
    window.dispatchEvent(new CustomEvent("ICONEX_RELAY_REQUEST", {
      detail: {
        type: "REQUEST_SIGNING",
        payload: IconConverter.toRawTransaction(transaction)
      }
    }));
  }
}
