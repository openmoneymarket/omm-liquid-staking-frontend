import { Injectable } from '@angular/core';
import log from "loglevel";
import {Wallet} from "../models/classes/Wallet";
import {StoreService} from "./store.service";
import {DataLoaderService} from "./data-loader.service";
import {NotificationService} from "./notification.service";
import {StateChangeService} from "./state-change.service";
import {FAILED_LOADING_USER_DATA} from "../common/messages";


/**
 * A service that deals with Login logic.
 */
@Injectable({
  providedIn: 'root'
})
export class LoginService {

  constructor(
    private scoreService: StoreService,
    // private localStorageService: LocalStorageService,
    private dataLoaderService: DataLoaderService,
    private notificationService: NotificationService,
    private stateChangeService: StateChangeService,
    // private logoutService: LogoutService
  ) { }

  public async signInUser(wallet: Wallet): Promise<void> {
    // clear up old login data first
    this.signOutUser();

    this.scoreService.activeWallet = wallet;

    log.info("Login with wallet: ", wallet);

    try {
      await this.dataLoaderService.loadUserSpecificData();
    } catch (e: any) {
      log.error(e);

      this.scoreService.activeWallet = undefined;
      this.notificationService.showNewNotification(FAILED_LOADING_USER_DATA);
      throw new Error("Error occurred! Try again in a moment.", e);
    }

    this.stateChangeService.updateLoginStatus(this.scoreService.activeWallet);
  }

  signOutUser(): void {
    // clear active wallet from persistence service
    this.scoreService.logoutUser();

    // commit change to the state change service
    this.stateChangeService.updateLoginStatus(this.scoreService.activeWallet);
  }

}
