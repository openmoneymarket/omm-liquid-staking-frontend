import {AfterViewInit, ChangeDetectorRef, Component, ElementRef, ViewChild} from '@angular/core';
import {environment} from "../../../environments/environment";
import {LocalStorageService} from "../../services/local-storage.service";
import {NgIf, NgStyle} from "@angular/common";
import {hashStringToUniqueId} from "../../common/utils";
import {HideElementPipe} from "../../pipes/hide-element-pipe";

@Component({
  selector: 'app-banner',
  templateUrl: './banner.component.html',
  imports: [
    NgIf,
    HideElementPipe,
    NgStyle
  ],
  standalone: true
})
export class BannerComponent implements  AfterViewInit {

  // show banner only if the user has not pressed x on this device (localstorage)
  showBanner = false;

  bannerContentEl?: HTMLElement;
  @ViewChild("bannerContent") set a(a: ElementRef) { this.bannerContentEl = a?.nativeElement; }

  constructor(
      private localstorageService: LocalStorageService,
      private cdRef: ChangeDetectorRef
  ) { }

  ngAfterViewInit(): void {
    const contentHash = this.getContentHash();
    const wasSameBannerClosed = this.localstorageService.get(contentHash) ?? false;
    this.showBanner = !wasSameBannerClosed && environment.SHOW_BANNER;
    this.cdRef.detectChanges();
  }

  private getContentHash(): string {
    const bannerDescription = this.bannerContentEl?.innerHTML;

    return bannerDescription ? hashStringToUniqueId(bannerDescription).toString() : "#######";
  }

  onBannerExitClick(): void {
    this.localstorageService.set(this.getContentHash(), true);
    this.showBanner = false;
  }
}
