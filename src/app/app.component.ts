import {Component, OnDestroy, OnInit} from '@angular/core';
import {CommonModule} from "@angular/common";
import {HeaderComponent} from "./components/header/header.component";
import {MainComponent} from "./components/navigation/main.component";
import {IconexApiService} from "./services/iconex-api.service";
import log from "loglevel";
import {ModalContainerComponent} from "./components/modal-container/modal-container.component";
import {DataLoaderService} from "./services/data-loader.service";
import {ModalType} from "./models/enums/ModalType";
import {StateChangeService} from "./services/state-change.service";
import {Subscription} from "rxjs";

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
    imports: [
        CommonModule,
        HeaderComponent,
        MainComponent,
        ModalContainerComponent,
    ],
  standalone: true
})
export class AppComponent implements OnInit, OnDestroy {
  title = 'omm-liquid-staking-dapp';

  private attachedListener = false;

  activeModal = ModalType.UNDEFINED;

  modalUpdateSub?: Subscription;
  constructor(public stateChangeService: StateChangeService,
              private iconexApiService: IconexApiService,
              private dataLoaderService: DataLoaderService) {

    // on load register relevant handlers
    window.addEventListener("load", () => {

      // register Iconex handler
      window.addEventListener("ICONEX_RELAY_RESPONSE", (e: any) => this.iconexApiService.iconexEventHandler(e));
      this.attachedListener = true;

      // Trigger has account if extension flag is false to check if user has Iconex/Hana extension
      if (!this.iconexApiService.hasWalletExtension) {
        log.debug("Dispatching hasAccount because extension = false");
        this.iconexApiService.hasAccount();
      }
    });

    // load all SCORE addresses
    dataLoaderService.loadAllScoreAddresses().then(() => {

      // load core data
      this.dataLoaderService.loadCoreData().then(() => {});
    });
  }

  ngOnDestroy(): void {
    this.modalUpdateSub?.unsubscribe();
  }

  ngOnInit(): void {
    this.modalUpdateSub = this.stateChangeService.modalPayloadChange$.subscribe(({ modalType, payload}) => {
      this.activeModal = modalType;
    });
  }



  overlayActive(): boolean {
    return this.activeModal != ModalType.UNDEFINED;
  }


  onOverlayClick(): void {
    this.stateChangeService.modalUpdate(ModalType.UNDEFINED);
  }
}
