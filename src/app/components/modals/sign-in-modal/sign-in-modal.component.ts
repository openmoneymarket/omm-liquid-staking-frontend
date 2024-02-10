import {Component, Input} from '@angular/core';
import {CommonModule} from '@angular/common';
import {IconexApiService} from "../../../services/iconex-api.service";
import {DeviceDetectorService} from "ngx-device-detector";
import {StateChangeService} from "../../../services/state-change.service";
import {ModalType} from "../../../models/enums/ModalType";

@Component({
  selector: 'app-sign-in-modal',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './sign-in-modal.component.html'
})
export class SignInModalComponent {

  @Input({ required: true }) active!: boolean;
  constructor(private iconexApiService: IconexApiService,
              private deviceService: DeviceDetectorService,
              private stateChangeService: StateChangeService) {
  }

  onSignInIconexClick(event: MouseEvent): void {
    event.stopPropagation();

    this.stateChangeService.hideActiveModal();

    // if user has wallet extension request account address
    if (this.iconexApiService.hasWalletExtension) {
      this.iconexApiService.hasAccount();
    } else {
      if (!this.deviceService.isMobile()) {
        // redirect to Hana extension link else
        window.open("https://chrome.google.com/webstore/detail/hana/jfdlamikmbghhapbgfoogdffldioobgl?hl=en", "_blank");
      }
    }
  }

  onSignInLedgerClick(event: MouseEvent): void {
    event.stopPropagation();

    this.stateChangeService.modalUpdate(ModalType.LEDGER_LOGIN);
  }
}
