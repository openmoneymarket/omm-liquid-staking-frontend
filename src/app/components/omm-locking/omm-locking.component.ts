import {Component, EventEmitter, OnDestroy, OnInit, Output, ViewChild} from '@angular/core';
import {CommonModule} from '@angular/common';
import {OmmLockSliderComponent} from "../omm-lock-slider/omm-lock-slider.component";
import {StoreService} from "../../services/store.service";
import {Subscription} from "rxjs";
import {StateChangeService} from "../../services/state-change.service";
import {LockedOmm} from "../../models/classes/LockedOmm";
import {OmmTokenBalanceDetails} from "../../models/classes/OmmTokenBalanceDetails";
import BigNumber from "bignumber.js";
import {
  timestampInMillisecondsToPrettyDate,
  timestampNowMicroseconds,
  timestampNowMilliseconds
} from "../../common/utils";
import {LockDate} from "../../models/enums/LockDate";
import {Calculations} from "../../common/calculations";
import {
  getLockDateFromMilliseconds,
  LOCKED_UNTIL_DATE_OPTIONS,
  lockedDatesToMilliseconds
} from "../../common/constants";
import {Times} from "../../models/classes/Times";
import {usLocale} from "../../common/formats";
import {UsFormatPipe} from "../../pipes/us-format.pipe";
import {HideElementPipe} from "../../pipes/hide-element-pipe";
import {BaseClass} from "../../models/classes/BaseClass";
import log from "loglevel";
import {ClickOutsideDirective} from "../../directives/click-outside.directive";
import {ModalType} from "../../models/enums/ModalType";
import {WithdrawLockedOmmPayload} from "../../models/classes/WithdrawLockedOmmPayload";
import {LOCK_AMOUNT_LOWER_THAN_CURRENT, LOCKING_PERIOD_NOT_SELECTED, TOO_LOW_LOCK_AMOUNT} from "../../common/messages";
import {NotificationService} from "../../services/notification.service";
import {OmmLockingPayload} from "../../models/classes/OmmLockingPayload";
import {VotingPowerOverviewComponent} from "../voting-power-overview/voting-power-overview.component";

@Component({
  selector: 'app-omm-locking',
  standalone: true,
  imports: [
      CommonModule,
    OmmLockSliderComponent,
    UsFormatPipe,
    HideElementPipe,
    ClickOutsideDirective,
    VotingPowerOverviewComponent
  ],
  templateUrl: './omm-locking.component.html'
})
export class OmmLockingComponent extends BaseClass implements OnInit, OnDestroy {

  protected readonly timestampInMillisecondsToPrettyDate = timestampInMillisecondsToPrettyDate;

  @ViewChild(OmmLockSliderComponent) lockOmmSliderCmp!: OmmLockSliderComponent;

  @Output() sliderValueUpdate = new EventEmitter<number>();
  @Output() lockAdjustClicked = new EventEmitter<void>();
  @Output() lockAdjustCancelClicked = new EventEmitter<void>();
  @Output() lockUntilDateClicked = new EventEmitter<LockDate>();

  // flag that indicates whether the locked adjust is active (confirm and cancel shown)
  lockAdjustActive = false;
  dropdownOpen = false;

  userLockedOmmBalance = 0;
  userLockedOmm?: LockedOmm;
  userOmmTokenBalanceDetails?: OmmTokenBalanceDetails;
  userDelegationWorkingbOmmBalance = new BigNumber(0);
  yourVotingPower = new BigNumber(0);

  userDynamicLockedOmmAmount = 0; // dynamic user locked Omm amount
  userDynamicDelegationWorkingbOmmBalance = new BigNumber(0);

  // default to 1 week
  selectedLockTimeInMillisec = lockedDatesToMilliseconds.get(this.currentLockPeriodDate()) ?? Times.WEEK_IN_MILLISECONDS;
  selectedLockTime = this.currentLockPeriodDate();
  userHasSelectedLockTime = false;
  inputLockOmm = 0;

  //subscriptions
  userLockedOmmBalanceSub?: Subscription;
  userOmmTokenBalanceDetailsSub?: Subscription;
  userDelegationWorkingbOmmSub?: Subscription;
  modalChangeSub?: Subscription;

  constructor(private storeService: StoreService,
              private stateChangeService: StateChangeService,
              private notificationService: NotificationService) {
    super();
  }
  ngOnInit(): void {
    this.resetUserValues();
    this.lockAdjustActive = false;
    this.dropdownOpen = false;

    this.registerSubscriptions();
  }

  private resetUserValues(): void {
    this.userLockedOmmBalance = 0;
    this.userLockedOmm = undefined;
    this.userOmmTokenBalanceDetails = undefined;
    this.userDynamicLockedOmmAmount = 0;
    this.userDynamicDelegationWorkingbOmmBalance = new BigNumber(0);
  }

  private resetDynamicValues(): void {
    this.userHasSelectedLockTime = false;
    this.userDynamicLockedOmmAmount = this.userLockedOmmBalance;
    this.userDynamicDelegationWorkingbOmmBalance = this.userDelegationWorkingbOmmBalance;
    this.selectedLockTimeInMillisec = lockedDatesToMilliseconds.get(this.currentLockPeriodDate())!;
    this.selectedLockTime = this.currentLockPeriodDate();
  }

  ngOnDestroy(): void {
    this.userLockedOmmBalanceSub?.unsubscribe();
    this.userOmmTokenBalanceDetailsSub?.unsubscribe();
    this.userDelegationWorkingbOmmSub?.unsubscribe();
    this.modalChangeSub?.unsubscribe();
  }

  registerSubscriptions(): void {
    this.subscribeToUserLockedOmmChange();
    this.subscribeTouUerOmmTokenBalanceDetailsChange();
    this.subscribeToUserDelegationWorkingbOmmChange();
    this.subscribeToModalChange();
  }

  subscribeToModalChange(): void {
    this.modalChangeSub = this.stateChangeService.modalPayloadChange$.subscribe(modalChange => {
      if (modalChange.modalType === ModalType.UNDEFINED) {
        this.resetDynamicValues();
      }
    });
  }


  subscribeToUserLockedOmmChange(): void {
    this.userLockedOmmBalanceSub = this.stateChangeService.userLockedOmmChange$.subscribe(lockedOmm => {
      this.userLockedOmm = lockedOmm;
      this.userLockedOmmBalance = lockedOmm.amount.toNumber();
      this.userDynamicLockedOmmAmount = this.userLockedOmmBalance;
    });
  }

  subscribeTouUerOmmTokenBalanceDetailsChange(): void {
    this.userOmmTokenBalanceDetailsSub = this.stateChangeService.userOmmTokenBalanceDetailsChange$.subscribe(value => {
      this.userOmmTokenBalanceDetails = value;
    })
  }

  subscribeToUserDelegationWorkingbOmmChange(): void {
    this.userDelegationWorkingbOmmSub = this.stateChangeService.userDelegationWorkingbOmmChange$.subscribe(value => {
      this.userDelegationWorkingbOmmBalance = value;
      this.userDynamicDelegationWorkingbOmmBalance = value;
    })
  }

  onConfirmLockOmmClick(e: MouseEvent): void {
    e.stopPropagation();

    this.lockAdjustActive = false;

    log.debug(`onConfirmLockOmmClick Omm locked amount = ${this.userDynamicLockedOmmAmount}`);

    const before = this.userLockedOmmBalance;
    const after = this.userDynamicLockedOmmAmount;
    const diff = after - before;
    const userCurrentLockedOmmEndInMilliseconds = this.userCurrentLockedOmmEndInMilliseconds();

    log.debug("before = ", before);
    log.debug("after = ", after);
    log.debug("diff = ", diff);

    // if before and after equal do nothing
    if (before == after && this.lockDate().eq(userCurrentLockedOmmEndInMilliseconds)) {
      return;
    }

    // if no locking period is selected inform user about it
    if (!this.selectedLockTimeInMillisec.isFinite() || this.selectedLockTimeInMillisec.lte(0)) {
      this.notificationService.showNewNotification(LOCKING_PERIOD_NOT_SELECTED);
      return;
    }

    const unlockPeriod = this.lockDate();
    log.debug("unlockPeriod:", unlockPeriod);

    if (diff > 0 || unlockPeriod.gt(userCurrentLockedOmmEndInMilliseconds)) {
      if (this.storeService.minOmmLockAmount.isGreaterThan(diff) && !unlockPeriod.gt(userCurrentLockedOmmEndInMilliseconds)) {
        this.notificationService.showNewNotification(TOO_LOW_LOCK_AMOUNT(this.storeService.minOmmLockAmount));
      }
      else if (before > 0 && after > before) {
        if (unlockPeriod.gt(userCurrentLockedOmmEndInMilliseconds)) {
          // increase both locked amount and unlock period if lock amount and unlock period are greater than current
          this.stateChangeService.modalUpdate(ModalType.INCREASE_LOCK_TIME_AND_AMOUNT, new OmmLockingPayload(before, after, Math.abs(diff), unlockPeriod, ModalType.INCREASE_LOCK_TIME_AND_AMOUNT));
        } else if (unlockPeriod.eq(userCurrentLockedOmmEndInMilliseconds)) {
          // increase lock amount only if new one is greater and unlock period is same as current
          this.stateChangeService.modalUpdate(ModalType.INCREASE_LOCK_OMM, new OmmLockingPayload(before, after, Math.abs(diff), unlockPeriod, ModalType.INCREASE_LOCK_OMM));
        }
      }
      else if (before == after && unlockPeriod.gt(userCurrentLockedOmmEndInMilliseconds)) {
        this.stateChangeService.modalUpdate(ModalType.INCREASE_LOCK_TIME, new OmmLockingPayload(before, after, Math.abs(diff), unlockPeriod, ModalType.INCREASE_LOCK_TIME));
      }
      else {
        this.stateChangeService.modalUpdate(ModalType.LOCK_OMM, new OmmLockingPayload(before, after, Math.abs(diff), unlockPeriod, ModalType.LOCK_OMM));
      }
    } else {
      this.notificationService.showNewNotification(LOCK_AMOUNT_LOWER_THAN_CURRENT);
    }
  }

  public onLockAdjustCancelClick(e: MouseEvent): void {
    e.stopPropagation();

    this.lockAdjustActive = false;
    this.userHasSelectedLockTime = false;

    // Set your locked OMM slider to the initial value
    this.lockOmmSliderCmp.disableSlider();
    this.lockOmmSliderCmp.setSliderValue(this.userLockedOmmBalance);

    this.resetDynamicValues();
    this.lockAdjustCancelClicked.emit();
  }

  onLockAdjustClick(e: MouseEvent): void {
    e.stopPropagation();

    if (this.userHasOmmUnlocked()) {
      const currentOmmBalance = this.userOmmTokenBalanceDetails!.availableBalance.dp(2);
      const lockedOmm = this.userLockedOmm!.amount.dp(2);
      const after = currentOmmBalance.plus(lockedOmm).dp(2);

      this.stateChangeService.modalUpdate(ModalType.WITHDRAW_LOCKED_OMM, new WithdrawLockedOmmPayload( currentOmmBalance, after, lockedOmm));
    } else {
      this.lockAdjustActive = true;
      this.lockOmmSliderCmp.enableSlider();

      // emit lockAdjustClicked event
      this.lockAdjustClicked.emit();
    }
  }

  onLockUntilDateClick(date: LockDate): void {
    this.dropdownOpen = false;
    this.selectedLockTimeInMillisec = lockedDatesToMilliseconds.get(date)!;
    this.selectedLockTime = date;
    this.userHasSelectedLockTime = true;

    // update dynamic daily OMM rewards based on the newly selected lock date
    this.lockUntilDateClicked.emit(date);

    // update user bOMM balance based on newly selected time
    this.updateUserbOmmBalance(this.userDynamicLockedOmmAmount);
  }

  onLockedOmmInputLostFocus(e: KeyboardEvent | ClipboardEvent | FocusEvent): void {
    this.delay(() => {
      this.processLockedOmmInput(e);
    }, 650 );
  }

  processLockedOmmInput(e: KeyboardEvent | ClipboardEvent | FocusEvent): void {
    const value = +usLocale.from((<HTMLInputElement>e.target).value);
    log.debug("onInputLockChange: " + this.inputLockOmm);

    if (value && value > 0) {
      this.inputLockOmm = value;
      this.lockOmmSliderCmp.setSliderValue(this.inputLockOmm);
    } else {
      this.inputLockOmm = 0;
      this.lockOmmSliderCmp.setSliderValue(0);
    }
  }

  handleLockSliderValueUpdate(value: number): void {
    if (this.userLoggedIn()) {
      this.sliderValueUpdate.emit(value);

      this.userDynamicLockedOmmAmount = value;

      // update dynamic values only if user current and dynamic locked OMM amounts are different
      if (this.userLockedOmmBalance != value)  {
        this.updateUserbOmmBalance(value);
      }

      // Update Omm stake input text box
      this.inputLockOmm = value;
    }
  }

  updateUserbOmmBalance(newLockedOmmAmount: number): void {
    const newUserbOmmBalance = Calculations.calculateNewbOmmBalance(new BigNumber(newLockedOmmAmount), this.selectedLockTimeInMillisec, this.userCurrentLockedOmmEndInMilliseconds());
    this.userDynamicDelegationWorkingbOmmBalance = newUserbOmmBalance;
  }

  currentLockPeriodDate(): LockDate {
    const currentLockedDateMilli = this.userCurrentLockedOmmEndInMilliseconds();

    if (currentLockedDateMilli.isZero()) {
      return LockDate.WEEK;
    }

    const lockDateMilli = currentLockedDateMilli.minus(timestampNowMilliseconds());

    if (this.userHasSelectedLockTime) {
      return getLockDateFromMilliseconds(lockedDatesToMilliseconds.get(this.selectedLockTime)!.plus(lockDateMilli));
    } else {
      return getLockDateFromMilliseconds(lockDateMilli);
    }
  }

  onLockedDateDropdownClick(): void {
    this.dropdownOpen = !this.dropdownOpen;
  }

  shouldShowbOmmBalance(): boolean {
    return this.userLoggedIn() && (this.lockAdjustActive || this.userDelegationWorkingbOmmBalance.gt(0) || this.userHasOmmUnlocked());
  }

  userHasOmmUnlocked(): boolean {
    // if user locked Omm is greater than zero and end timestamp has passed return true
    return this.userLockedOmm ? this.userLockedOmm.amount.gt(0) && this.userLockedOmm.end.lt(timestampNowMicroseconds()) : false;
  }

  shouldHideLockedOmmThreshold(): boolean {
    return !this.userLoggedIn() || !this.userHasLockedOmm() || !this.lockAdjustActive;
  }

  getLeftLockedThresholdPercentStyle(): any {
    const max = 100;
    const percent = this.calculatePercentLocked();
    const res = max * percent;
    return { left: res.toFixed(2) + "%" };
  }

  getLockedUntilDateOptions(): LockDate[] {
    if (!this.userHasLockedOmm()) {
      return LOCKED_UNTIL_DATE_OPTIONS;
    } else {
      return Calculations.getAvailableLockPeriods(this.userCurrentLockedOmmEndInMilliseconds()) ?? [LockDate.FOUR_YEARS];
    }
  }

  calculatePercentLocked(): number {
    if (this.userOmmTokenBalanceDetails && this.userLockedOmm) {
      return this.userLockedOmm.amount.dividedBy(this.userLockedOmm.amount.plus(this.userOmmTokenBalanceDetails.availableBalance)).toNumber();
    }

    return 0;
  }

  getLockSliderMax(): number {
    // sliders max is sum of locked + available balance
    return this.userLockedOmmBalance + this.getUsersAvailableOmmBalance();
  }

  lockDate(): BigNumber {
    if (this.userCurrentLockedOmmEndInMilliseconds().gt(0)) {
      if (this.userHasSelectedLockTime) {
        // increase for difference between selected and current end
        const now = timestampNowMilliseconds();
        const currentEndPeriodDate = this.userCurrentLockedOmmEndInMilliseconds();
        const difference = now.plus(this.selectedLockTimeInMillisec).minus(currentEndPeriodDate);
        return Calculations.recalculateLockPeriodEnd(currentEndPeriodDate.plus(difference));
      } else {
        return this.userCurrentLockedOmmEndInMilliseconds();
      }
    } else {
      return Calculations.recalculateLockPeriodEnd(timestampNowMilliseconds().plus(this.selectedLockTimeInMillisec));
    }
  }

  unlockedOnLockedUntilLabel(): string {
    if (this.userHasOmmUnlocked()) {
      return "Unlocked on";
    }

    return "Locked until";
  }

  public getUsersAvailableOmmBalance(): number {
    return (this.userOmmTokenBalanceDetails?.availableBalance ?? new BigNumber("0")).dp(0).toNumber();
  }

  userCurrentLockedOmmEndInMilliseconds(): BigNumber {
    return this.userLockedOmm?.end.dividedBy(1000) ?? new BigNumber(0);
  }

  shouldHideLockSlider(): boolean {
    return !this.userLoggedIn() || (!this.userHasMoreThanOneOmmToken() && !this.userHasLockedOmm());
  }

  userHasMoreThanOneOmmToken(): boolean {
    return (this.userOmmTokenBalanceDetails?.totalBalance ?? new BigNumber(0)).isGreaterThan(new BigNumber(1));
  }

  adjustLabel(): string {
    if (this.userHasOmmUnlocked()) {
      return "Withdraw OMM";
    } else if (this.userHasLockedOmm()) {
      return "Adjust";
    } else {
      return "Lock up OMM";
    }
  }

  userHasLockedOmm(): boolean {
    return this.userLockedOmmBalance > 0;
  }

  public isLockAdjustActive(): boolean {
    return this.lockAdjustActive;
  }

  public userLoggedIn(): boolean {
    return this.storeService.userLoggedIn();
  }

}
