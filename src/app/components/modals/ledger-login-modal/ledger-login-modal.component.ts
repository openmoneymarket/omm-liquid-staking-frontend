import {Component, Input, OnInit} from '@angular/core';
import { CommonModule } from '@angular/common';
import {Wallet} from "../../../models/classes/Wallet";
import log from "loglevel";
import {LEDGER_NOT_DETECTED} from "../../../common/messages";
import {LedgerService} from "../../../services/ledger.service";
import {NotificationService} from "../../../services/notification.service";
import {LoginService} from "../../../services/login.service";
import {ModalType} from "../../../models/enums/ModalType";
import {StateChangeService} from "../../../services/state-change.service";
import {UsFormatPipe} from "../../../pipes/us-format.pipe";
import BigNumber from "bignumber.js";
import {ICX} from "../../../common/constants";
import {ShortenAddressPipePipe} from "../../../pipes/shorten-address";

@Component({
  selector: 'app-ledger-login-modal',
  standalone: true,
  imports: [CommonModule, UsFormatPipe, ShortenAddressPipePipe],
  templateUrl: './ledger-login-modal.component.html'
})
export class LedgerLoginModalComponent implements OnInit {

  _active = false;
  @Input({ required: true }) set active(value: boolean) {
    this._active = value;

    if (value) {
      this.onSignInLedgerClick();
    }
  }

  // window on which user is on (e.g. 1st = [0, 1, 2, 3, 4])
  activeLedgerAddressWindow = 0;
  activeLedgerAddressPageList = [0, 1, 2, 3, 4];
  // page that the user has selected
  selectedLedgerAddressPage = 0;
  // default window and page size
  ledgerAddressPageSize = 5;

  ledgerWallets: Wallet[] = [];

  constructor(private ledgerService: LedgerService,
              private notificationService: NotificationService,
              private loginService: LoginService,
              private stateChangeService: StateChangeService) {

  }

  ngOnInit(): void {
    this.resetBaseValues();
  }

  onSignInLedgerClick(): void {
    // set default pagination values
    this.activeLedgerAddressWindow = 0;
    this.selectedLedgerAddressPage = 0;
    this.activeLedgerAddressPageList = [0, 1, 2, 3, 4];

    this.fetchLedgerWallets();
  }
  resetBaseValues(): void {
    this.activeLedgerAddressWindow = 0;
    this.activeLedgerAddressPageList = [0, 1, 2, 3, 4];
    this.selectedLedgerAddressPage = 0;
    this.ledgerWallets = [];
  }
  ledgerIcxBalance(wallet: Wallet): BigNumber {
    return wallet.irc2TokenBalancesMap.get(ICX.symbol) ?? new BigNumber("0");
  }

  onSelectLedgerAddressClick(wallet: Wallet): void {
    this.stateChangeService.hideActiveModal();
    this.loginService.signInUser(wallet);
  }

  onLedgerAddressPageClick(page: number): void {
    this.selectedLedgerAddressPage = page;
    this.fetchLedgerWallets();
  }

  onLedgerPageNextClick(): void {
    this.activeLedgerAddressWindow += 1;
    this.activeLedgerAddressPageList = [];

    const start = this.activeLedgerAddressWindow * this.ledgerAddressPageSize;
    const end = this.activeLedgerAddressWindow * this.ledgerAddressPageSize + this.ledgerAddressPageSize;

    for (let i = start; i <= end; i++) {
      this.activeLedgerAddressPageList.push(i);
    }

    this.selectedLedgerAddressPage = this.activeLedgerAddressPageList[0];

    this.fetchLedgerWallets();
  }

  onLedgerPageBackClick(): void {
    if (this.activeLedgerAddressWindow === 0 && this.selectedLedgerAddressPage === 0) {
      return;
    }

    this.activeLedgerAddressWindow -= 1;
    this.activeLedgerAddressPageList = [];

    const start = this.activeLedgerAddressWindow * this.ledgerAddressPageSize;
    const end = this.activeLedgerAddressWindow * this.ledgerAddressPageSize + this.ledgerAddressPageSize;

    for (let i = start; i <= end; i++) {
      this.activeLedgerAddressPageList.push(i);
    }

    this.selectedLedgerAddressPage = this.activeLedgerAddressPageList[0];

    this.fetchLedgerWallets();
  }

  fetchLedgerWallets(): void {
    this.stateChangeService.modalUpdate(ModalType.LOADING);

    this.ledgerService.getLedgerWallets(this.selectedLedgerAddressPage).then(wallets => {
      this.ledgerWallets = wallets;

      this.stateChangeService.modalUpdate(ModalType.LEDGER_LOGIN);
    }).catch(e => {
      this.stateChangeService.hideActiveModal();
      log.error(e);
      this.notificationService.showNewNotification(LEDGER_NOT_DETECTED);
    });
  }

  get active(): boolean {
    return this._active;
  }
}
