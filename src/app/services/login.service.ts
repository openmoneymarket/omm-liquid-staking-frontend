import { Injectable } from '@angular/core';
import log from "loglevel";
import {Wallet} from "../models/classes/Wallet";
import {StoreService} from "./store.service";
import {DataLoaderService} from "./data-loader.service";
import {NotificationService} from "./notification.service";
import {StateChangeService} from "./state-change.service";
import {FAILED_LOADING_USER_DATA} from "../common/messages";
import {LocalStorageService} from "./local-storage.service";
import {takeUntilDestroyed} from "@angular/core/rxjs-interop";
import {IWalletPersistData} from "../models/interfaces/IWalletPersistData";


/**
 * A service that deals with Login logic.
 */
@Injectable({
  providedIn: 'root'
})
export class LoginService {

  private readonly savedLoginKey = "omm.login";
  constructor(
    private storeService: StoreService,
    private dataLoaderService: DataLoaderService,
    private notificationService: NotificationService,
    private stateChangeService: StateChangeService,
    private localstorageService: LocalStorageService
  ) {
    this.subscribeToCoreDataFinishedLoading();
  }

  private subscribeToCoreDataFinishedLoading(): void {
    this.stateChangeService.afterCoreDataReload$.pipe(takeUntilDestroyed()).subscribe(() => {
      const previousLogin = this.localstorageService.get(this.savedLoginKey) as IWalletPersistData;

      if (previousLogin != undefined) {
        this.signInUser(new Wallet(previousLogin.address, previousLogin.type, previousLogin.ledgerPath));
      }
    })
  }

  public async signInUser(wallet: Wallet): Promise<void> {
    // clear up old login data first
    this.signOutUser();

    // save wallet data to localstorage
    this.localstorageService.set(this.savedLoginKey, { address: wallet.address, type: wallet.type, ledgerPath: wallet.ledgerPath});

    // save wallet in store service and commit login status change
    this.storeService.activeWallet = wallet;
    this.stateChangeService.updateLoginStatus(this.storeService.activeWallet);

    log.info("Login with wallet: ", wallet);

    try {
      await this.dataLoaderService.loadUserSpecificData();
    } catch (e: any) {
      log.error(e);

      this.storeService.activeWallet = undefined;
      this.notificationService.showNewNotification(FAILED_LOADING_USER_DATA);
      throw new Error("Error occurred! Try again in a moment.", e);
    }
  }

  signOutUser(): void {
    // clear active wallet from persistence service
    this.storeService.logoutUser();

    // clear login data from localstorage
    this.localstorageService.remove(this.savedLoginKey);

    // commit change to the state change service
    this.stateChangeService.updateLoginStatus(this.storeService.activeWallet);
  }

}
