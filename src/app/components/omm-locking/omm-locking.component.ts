import {Component, OnInit} from '@angular/core';
import { CommonModule } from '@angular/common';
import {OmmLockSliderComponent} from "../omm-lock-slider/omm-lock-slider.component";

@Component({
  selector: 'app-omm-locking',
  standalone: true,
  imports: [CommonModule, OmmLockSliderComponent],
  templateUrl: './omm-locking.component.html'
})
export class OmmLockingComponent implements OnInit {

  // flag that indicates whether the locked adjust is active (confirm and cancel shown)
  lockAdjustActive = false;

  ngOnInit(): void {
    this.lockAdjustActive = false;
  }


  shouldShowbOmmBalance(): boolean {
    return true;
    // TODO
    // return this.userLoggedIn() && (this.lockAdjustActive || this.getUserWorkingbOmmBalance().gt(0) || this.userHasOmmUnlocked());
  }

  shouldHideLockedOmmThreshold(): boolean {
    return !this.lockAdjustActive;
    // TODO
    // return !this.userLoggedIn() || !this.userHasLockedOmm() || !this.lockAdjustActive;
  }

  getLeftLockedThresholdPercentStyle(): any {
    const max = 100;
    const percent = this.calculatePercentLocked();
    const res = max * percent;
    return { left: res.toFixed(2) + "%" };
  }

  calculatePercentLocked(): number {
    return 3000/(4000);
    // return this.userLockedOmmBalance.dividedBy(this.userLockedOmmBalance.plus(this.persistenceService.getUsersAvailableOmmBalance()));
  }

  public onLockAdjustClick(e: MouseEvent): void {
    e.stopPropagation();

    this.lockAdjustActive = true;
  }

  public onCancelLockAdjustClick(e: MouseEvent): void {
    e.stopPropagation();

    this.lockAdjustActive = false;
  }

  public onConfirmLockAdjustClick(e: MouseEvent): void {
    e.stopPropagation();

    this.lockAdjustActive = false;
  }

  public isLockAdjustActive(): boolean {
    return this.lockAdjustActive;
  }
}
