import { Component } from '@angular/core';
import {CommonModule, NgOptimizedImage} from '@angular/common';
import {NavigationEnd, Router} from "@angular/router";
import {environment} from "../../../environments/environment";
import {HideElementPipe} from "../../pipes/hide-element-pipe";

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, NgOptimizedImage, HideElementPipe],
  templateUrl: './header.component.html'
})
export class HeaderComponent {

  pageTitle = "Stake";
  constructor(private router: Router) {
    router.events.subscribe( (event) => ( event instanceof NavigationEnd ) && this.handleRouteChange() );
  }
  handleRouteChange(): void {
    if (this.router.url.includes('stake')) {
      this.pageTitle = "Stake";
    } else {
      this.pageTitle = "Vote";
    }
  }
  onSignInClick(): void {
    // this.modalService.showNewModal(ModalType.SIGN_IN);
  }

  onSignOutClick(): void {
    // this.logoutService.signOutUser();
  }

  onCopyIconAddressClick(): void {
    // const textArea = document.createElement("textarea");
    //
    // // Place in top-left corner of screen regardless of scroll position.
    // textArea.style.position = 'fixed';
    // textArea.style.top = "0";
    // textArea.style.left = "0";
    //
    // // Ensure it has a small width and height. Setting to 1px / 1em
    // // doesn't work as this gives a negative w/h on some browsers.
    // textArea.style.width = '2em';
    // textArea.style.height = '2em';
    //
    // // We don't need padding, reducing the size if it does flash render.
    // textArea.style.padding = "0";
    //
    // // Clean up any borders.
    // textArea.style.border = 'none';
    // textArea.style.outline = 'none';
    // textArea.style.boxShadow = 'none';
    //
    // // Avoid flash of white box if rendered for any reason.
    // textArea.style.background = 'transparent';
    // textArea.value = this.persistenceService.publicGetActiveIconAddress() ?? "";
    //
    // document.body.appendChild(textArea);
    // textArea.focus();
    // textArea.select();
    //
    // try {
    //   const successful = document.execCommand('copy');
    //   const msg = successful ? 'successful' : 'unsuccessful';
    //
    //   if (msg !== "successful" || !textArea.value) {
    //     this.notificationService.showNewNotification(UNABLE_TO_COPY);
    //   } else {
    //     // show notification
    //     this.notificationService.showNewNotification(SUCCESS_COPY);
    //   }
    // } catch (err) {
    //   this.notificationService.showNewNotification(UNABLE_TO_COPY);
    // }
    //
    // document.body.removeChild(textArea);
  }

  userLoggedIn(): boolean {
    return false; // TODO
    // return this.persistenceService.userLoggedIn();
  }

  isProduction(): boolean {
    return environment.production;
  }

  network(): string {
    return environment.NETWORK;
  }

  onWalletClick(e: MouseEvent): void {
    // TODO
  }

  getWalletId(): string {
    // if (this.persistenceService.activeWallet instanceof IconexWallet) {
    //   return this.formatIconAddressToShort(this.persistenceService.activeWallet.address);
    // }
    // else if (this.persistenceService.activeWallet instanceof BridgeWallet) {
    //   return this.persistenceService.activeWallet.email;
    // }
    // else if (this.persistenceService.activeWallet instanceof LedgerWallet) {
    //   return this.formatIconAddressToShort(this.persistenceService.activeWallet.address);
    // }
    // else {
    //   return "";
    // }
    return "hx5559aa06f3a0413c40a91111c22d28319e0bbbbb"
  }

  getWalletName(): string {
    // TODO
    // if (this.persistenceService.activeWallet instanceof IconexWallet) {
    //   return "ICON wallet";
    // }
    // else if (this.persistenceService.activeWallet instanceof BridgeWallet) {
    //   return "Bridge wallet";
    // }
    // else if (this.persistenceService.activeWallet instanceof LedgerWallet) {
    //   return "Ledger wallet";
    // }
    // else {
    //   return "";
    // }

    return "ICON wallet";
  }
}
