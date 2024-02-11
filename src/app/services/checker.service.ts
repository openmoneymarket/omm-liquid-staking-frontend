import { Injectable } from "@angular/core";
import { StoreService } from "./store.service";

@Injectable({
  providedIn: "root",
})
export class CheckerService {
  constructor(private storeService: StoreService) {}

  public checkUserLoggedIn(): any {
    if (!this.storeService.activeWallet) {
      throw new Error("User not logged in.");
    }
  }

  public checkAllAddressesLoaded(): void {
    if (!this.storeService.allAddresses) {
      throw new Error("All score addresses not loaded.");
    }
  }

  public checkUserLoggedInAndAllAddressesLoaded(): any {
    this.checkUserLoggedIn();
    this.checkAllAddressesLoaded();
  }
}
