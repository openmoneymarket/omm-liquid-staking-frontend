import { Component } from "@angular/core";
import { CommonModule, NgOptimizedImage } from "@angular/common";
import { NavigationEnd, Router } from "@angular/router";
import { environment } from "../../../environments/environment";
import { HideElementPipe } from "../../pipes/hide-element-pipe";
import { ModalType } from "../../models/enums/ModalType";
import { StateChangeService } from "../../services/state-change.service";
import { StoreService } from "../../services/store.service";
import { LoginService } from "../../services/login.service";
import { WalletType } from "../../models/enums/WalletType";
import { formatIconAddressToShort } from "../../common/utils";
import { ClickOutsideDirective } from "../../directives/click-outside.directive";
import {
  FAILURE_DATA_REFRESH,
  PRE_DATA_REFRESH,
  SUCCESS_COPY,
  SUCCESS_DATA_REFRESH,
  UNABLE_TO_COPY,
} from "../../common/messages";
import { NotificationService } from "../../services/notification.service";
import { DataLoaderService } from "../../services/data-loader.service";

@Component({
  selector: "app-header",
  standalone: true,
  imports: [CommonModule, NgOptimizedImage, HideElementPipe, ClickOutsideDirective],
  templateUrl: "./header.component.html",
})
export class HeaderComponent {
  pageTitle = "Stake";

  dropdownOpen = false;
  constructor(
    private router: Router,
    private stateChangeService: StateChangeService,
    private storeService: StoreService,
    private loginService: LoginService,
    private notificationService: NotificationService,
    private dataLoaderService: DataLoaderService,
  ) {
    router.events.subscribe((event) => event instanceof NavigationEnd && this.handleRouteChange());
  }
  handleRouteChange(): void {
    if (this.router.url.includes("stake")) {
      this.pageTitle = "Stake";
    } else {
      this.pageTitle = "Vote";
    }
  }
  onSignInClick(): void {
    this.dropdownOpen = false;
    this.stateChangeService.modalUpdate(ModalType.SIGN_IN);
  }

  onSignOutClick(): void {
    this.loginService.signOutUser();
  }

  async onRefreshClick(): Promise<void> {
    try {
      await this.dataLoaderService.loadCoreData();

      if (this.storeService.activeWallet) {
        await this.loginService.signInUser(this.storeService.activeWallet);
      }

      this.notificationService.showNewNotification(SUCCESS_DATA_REFRESH);
    } catch (e) {
      this.notificationService.showNewNotification(FAILURE_DATA_REFRESH);
    }
  }

  onCopyIconAddressClick(e: MouseEvent): void {
    e.stopPropagation();

    const textArea = document.createElement("textarea");

    // Place in top-left corner of screen regardless of scroll position.
    textArea.style.position = "fixed";
    textArea.style.top = "0";
    textArea.style.left = "0";

    // Ensure it has a small width and height. Setting to 1px / 1em
    // doesn't work as this gives a negative w/h on some browsers.
    textArea.style.width = "2em";
    textArea.style.height = "2em";

    // We don't need padding, reducing the size if it does flash render.
    textArea.style.padding = "0";

    // Clean up any borders.
    textArea.style.border = "none";
    textArea.style.outline = "none";
    textArea.style.boxShadow = "none";

    // Avoid flash of white box if rendered for any reason.
    textArea.style.background = "transparent";
    textArea.value = this.storeService.activeWallet?.address ?? "";

    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();

    try {
      const successful = document.execCommand("copy");
      const msg = successful ? "successful" : "unsuccessful";

      if (msg !== "successful" || !textArea.value) {
        this.notificationService.showNewNotification(UNABLE_TO_COPY);
      } else {
        // show notification
        this.notificationService.showNewNotification(SUCCESS_COPY);
      }
    } catch (err) {
      this.notificationService.showNewNotification(UNABLE_TO_COPY);
    }

    document.body.removeChild(textArea);

    this.dropdownOpen = false;
  }

  userLoggedIn(): boolean {
    return this.storeService.userLoggedIn();
  }

  isProduction(): boolean {
    return environment.production;
  }

  network(): string {
    return environment.NETWORK;
  }

  onWalletClick(e: MouseEvent): void {
    e.stopPropagation();

    this.dropdownOpen = !this.dropdownOpen;
  }

  onClickOutsideMenu() {
    this.dropdownOpen = false;
  }

  getWalletId(): string {
    if (this.storeService.activeWallet?.type == WalletType.ICON) {
      return formatIconAddressToShort(this.storeService.activeWallet.address);
    } else if (this.storeService.activeWallet?.type == WalletType.LEDGER) {
      return formatIconAddressToShort(this.storeService.activeWallet.address);
    } else {
      return "";
    }
  }

  getWalletName(): string {
    if (this.storeService.activeWallet?.type == WalletType.ICON) {
      return "ICON wallet";
    } else if (this.storeService.activeWallet?.type == WalletType.LEDGER) {
      return "Ledger wallet";
    } else {
      return "";
    }
  }
}
