import {Component, ElementRef, EventEmitter, Input, OnDestroy, OnInit, Output, ViewChild} from '@angular/core';
import { CommonModule } from '@angular/common';

declare var noUiSlider: any;
@Component({
  selector: 'app-omm-lock-slider',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './omm-lock-slider.component.html'
})
export class OmmLockSliderComponent implements OnInit, OnDestroy {

  private lockOmmSlider!: any; @ViewChild("lckSlider", { static: true})set d(sliderStake: ElementRef) {this.lockOmmSlider = sliderStake.nativeElement; }

  _lockAdjustActive!: boolean;
  @Input({ required: true }) set lockAdjustActive(value: boolean) {
    this._lockAdjustActive = value;

    this.onLockAdjustActiveChange(this._lockAdjustActive);
  }

  @Output() sliderValueUpdate = new EventEmitter<number>();

  userLockedOmmBalance = 3000;

  sliderInitialised = false;

  ngOnInit(): void {
    this.sliderInitialised = false;

    this.createAndInitSlider(this.userLockedOmmBalance, this.userLockedOmmBalance, 4000);
  }

  ngOnDestroy(): void {
    this.disableSlider();
    this.lockOmmSlider?.noUiSlider?.destroy();
    this.sliderInitialised = false;
  }

  public createAndInitSlider(startingValue: number, minValue: number, max: number): void {
    this.userLockedOmmBalance = minValue;

    noUiSlider.create(this.lockOmmSlider, {
      start: startingValue,
      padding: 0,
      connect: 'lower',
      range: {
        min: [0],
        max: [max === 0 ? 1 : max]
      },
      step: 1,
    });

    // this.initSliderUpdateHandler();
    this.sliderInitialised = true;
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
