import { Component, ElementRef, EventEmitter, Input, OnDestroy, OnInit, Output, ViewChild } from "@angular/core";
import { CommonModule } from "@angular/common";
import { Subscription } from "rxjs";
import { StateChangeService } from "../../services/state-change.service";
import { LockedOmm } from "../../models/classes/LockedOmm";
import { OmmTokenBalanceDetails } from "../../models/classes/OmmTokenBalanceDetails";
import { HideElementPipe } from "../../pipes/hide-element-pipe";
import log from "loglevel";

declare var noUiSlider: any;
@Component({
  selector: "app-omm-lock-slider",
  standalone: true,
  imports: [CommonModule, HideElementPipe],
  templateUrl: "./omm-lock-slider.component.html",
})
export class OmmLockSliderComponent implements OnInit, OnDestroy {
  private lockOmmSlider!: any;
  @ViewChild("lckSlider", { static: true }) set d(sliderStake: ElementRef) {
    this.lockOmmSlider = sliderStake.nativeElement;
  }

  _lockAdjustActive!: boolean;
  @Input({ required: true }) set lockAdjustActive(value: boolean) {
    this._lockAdjustActive = value;

    this.onLockAdjustActiveChange(this._lockAdjustActive);
  }
  @Input({ required: true }) hideSlider!: boolean;

  @Output() sliderValueUpdate = new EventEmitter<number>();

  userLockedOmmBalance = 0;
  userLockedOmm?: LockedOmm;
  userOmmTokenBalanceDetails?: OmmTokenBalanceDetails;

  sliderInitialised = false;

  //subscriptions
  userLockedOmmBalanceSub?: Subscription;
  userOmmTokenBalanceDetailsSub?: Subscription;
  afterUserDataReload?: Subscription;

  constructor(private stateChangeService: StateChangeService) {}

  ngOnInit(): void {
    this.resetUserValues();
    this.sliderInitialised = false;
    this.registerSubscriptions();

    this.refreshSlider();
  }

  ngOnDestroy(): void {
    this.userLockedOmmBalanceSub?.unsubscribe();
    this.userOmmTokenBalanceDetailsSub?.unsubscribe();
    this.afterUserDataReload?.unsubscribe();

    this.disableSlider();
    this.lockOmmSlider?.noUiSlider?.destroy();
    this.sliderInitialised = false;
  }

  private resetUserValues(): void {
    this.userLockedOmmBalance = 0;
    this.userLockedOmm = undefined;
    this.userOmmTokenBalanceDetails = undefined;
  }

  registerSubscriptions(): void {
    this.subscribeToUserLockedOmmChange();
    this.subscribeTouUerOmmTokenBalanceDetailsChange();
    this.subscribeToAfterUserDataReload();
  }

  subscribeToAfterUserDataReload(): void {
    this.afterUserDataReload = this.stateChangeService.afterUserDataReload$.subscribe(() => {
      this.refreshSlider();
    });
  }

  subscribeToUserLockedOmmChange(): void {
    this.userLockedOmmBalanceSub = this.stateChangeService.userLockedOmmChange$.subscribe((lockedOmm) => {
      this.userLockedOmm = lockedOmm;
      this.userLockedOmmBalance = lockedOmm.amount.toNumber();

      this.refreshSlider();
    });
  }

  subscribeTouUerOmmTokenBalanceDetailsChange(): void {
    this.userOmmTokenBalanceDetailsSub = this.stateChangeService.userOmmTokenBalanceDetailsChange$.subscribe(
      (value) => {
        this.userOmmTokenBalanceDetails = value;

        this.refreshSlider();
      },
    );
  }

  public refreshSlider(): void {
    if (this.userOmmTokenBalanceDetails) {
      const max = this.userOmmTokenBalanceDetails.availableBalance.plus(this.userLockedOmmBalance).dp(0).toNumber();

      // slider is not yet initialised
      if (!this.sliderInitialised) {
        this.createAndInitSlider(this.userLockedOmmBalance, this.userLockedOmmBalance, max);
      } else {
        this.updateSliderValues(max, this.userLockedOmmBalance);
      }
    }
  }

  public updateSliderValues(sliderMax: number, startingValue: number): void {
    log.debug(`updateSliderValues... sliderMax: ${sliderMax}, startingValue: ${startingValue}`);
    if (this.sliderInitialised) {
      this.lockOmmSlider.noUiSlider?.updateOptions({
        start: [startingValue],
        range: { min: 0, max: sliderMax > 0 ? sliderMax : 1 },
      });

      this.lockOmmSlider.noUiSlider.set(startingValue);
    }
  }

  private createAndInitSlider(startingValue: number, minValue: number, max: number): void {
    log.debug(`createAndInitSlider... startingValue: ${startingValue}, max: ${max}`);
    this.userLockedOmmBalance = minValue;

    noUiSlider.create(this.lockOmmSlider, {
      start: startingValue,
      padding: 0,
      connect: "lower",
      range: {
        min: [0],
        max: [max === 0 ? 1 : max],
      },
      step: 1,
    });

    // this.initSliderUpdateHandler();
    this.sliderInitialised = true;
    this.initSliderUpdateHandler();
  }

  private initSliderUpdateHandler(): void {
    // On stake slider update
    this.lockOmmSlider.noUiSlider.on("update", (values: any, handle: any) => {
      const value = +values[handle];

      // forbid slider value going below users locked Omm balance
      if (value < this.userLockedOmmBalance) {
        this.setSliderValue(this.userLockedOmmBalance);
        return;
      }

      this.sliderValueUpdate.emit(value);
    });
  }

  public setSliderValue(value: number): void {
    if (this.sliderInitialised) {
      this.lockOmmSlider.noUiSlider.set(value);
    }
  }

  onLockAdjustActiveChange(lockAdjustActive: boolean): void {
    if (lockAdjustActive) {
      this.enableSlider();
    } else {
      this.disableSlider();
    }
  }

  public enableSlider(): void {
    this.lockOmmSlider.removeAttribute("disabled");
  }

  public disableSlider(): void {
    this.lockOmmSlider.setAttribute("disabled", "");
  }
}
