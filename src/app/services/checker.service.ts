import { Injectable } from '@angular/core';
import {PersistenceService} from "./persistence.service";

@Injectable({
  providedIn: 'root'
})
export class CheckerService {

  constructor(private persistenceService: PersistenceService) {

  }

  public checkUserLoggedIn(): any {
    if (!this.persistenceService.activeWallet) {
      throw new Error("User not logged in.", );
    }
  }

  public checkAllAddressesLoaded(): void {
    if (!this.persistenceService.allAddresses) {
      throw new Error("All score addresses not loaded.");
    }
  }

  public checkUserLoggedInAndAllAddressesLoaded(): any {
    this.checkUserLoggedIn();
    this.checkAllAddressesLoaded();
  }

  public checkUserLoggedInAllAddressesAndReservesLoaded(): any {
    this.checkUserLoggedIn();
    this.checkAllAddressesLoaded();
  }

}
