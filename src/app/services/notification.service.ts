import { Injectable } from "@angular/core";
import { ToastrService } from "ngx-toastr";
import { take } from "rxjs";
import { constructTxHashLink } from "../common/utils";

@Injectable({
  providedIn: "root",
})
export class NotificationService {
  public notificationMessageToShow?: string;
  constructor(private notifierService: ToastrService) {}

  // Show a notification
  private showNotification(message: string, txHash?: string): void {
    this.notifierService
      .info(message)
      .onTap.pipe(take(1))
      .subscribe(() => {
        if (txHash) {
          window.open(constructTxHashLink(txHash), "_blank");
        }
      });
  }

  public showNewNotification(message: string, txHash?: string): void {
    this.showNotification(message, txHash);
  }

  showNotificationToShow(txHash?: string): void {
    if (this.notificationMessageToShow) {
      this.showNotification(this.notificationMessageToShow, txHash);
    }
  }

  setNotificationToShow(message: string): void {
    this.notificationMessageToShow = message;
  }

  hideOldest(): void {
    const lastToast = this.notifierService.toasts[this.notifierService.toasts.length - 1];

    if (lastToast) {
      this.notifierService.clear(lastToast.toastId);
    }
  }

  hideAll(): void {
    this.notifierService.clear();
  }
}
