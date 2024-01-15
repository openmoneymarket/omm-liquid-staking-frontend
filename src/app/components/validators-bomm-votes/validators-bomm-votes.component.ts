import {ChangeDetectionStrategy, ChangeDetectorRef, Component, Input, OnDestroy, OnInit} from '@angular/core';
import {CommonModule} from '@angular/common';
import {Observable, Subscription} from "rxjs";
import {StateChangeService} from "../../services/state-change.service";
import {YourPrepVote} from "../../models/classes/YourPrepVote";
import BigNumber from "bignumber.js";
import {contributorsMap, defaultPrepLogoUrl, prepsOfferingIncentiveMap} from "../../common/constants";
import {Prep, PrepList} from "../../models/classes/Preps";
import {DeviceDetectorService} from "ngx-device-detector";
import {HideElementPipe} from "../../pipes/hide-element-pipe";
import {PrepAddress} from "../../models/Types/ModalTypes";
import {RndDwnNPercPipe} from "../../pipes/round-down-percent.pipe";
import {UsFormatPipe} from "../../pipes/us-format.pipe";
import {BaseClass} from "../../models/classes/BaseClass";
import {usLocale} from "../../common/formats";
import {ModalType} from "../../models/enums/ModalType";
import {UpdateDelegationPayload} from "../../models/classes/updateDelegationPayload";
import {RemoveDelegationsPayload} from "../../models/classes/removeDelegationsPayload";
import {Calculations} from "../../common/calculations";
import {Wallet} from "../../models/classes/Wallet";
import {IntersectionObserverDirective} from "../../directives/observe-visibility.directive";
import {IntersectionStatus} from "../../directives/from-intersection-observer";
import {RndDwnPipePipe} from "../../pipes/round-down.pipe";
import {toNDecimalRoundedDownPercentString} from "../../common/utils";
import log from "loglevel";

@Component({
  selector: 'app-validators-bomm-votes',
  standalone: true,
    imports: [
        CommonModule,
        HideElementPipe,
        RndDwnPipePipe,
        UsFormatPipe,
        IntersectionObserverDirective,
        RndDwnPipePipe,
        RndDwnPipePipe,
        RndDwnNPercPipe
    ],
  templateUrl: './validators-bomm-votes.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ValidatorsBommVotesComponent extends BaseClass implements OnInit, OnDestroy {

  // used for pagination, start with 22 and increase when last element becomes visible
  PREP_PAGE_SIZE_INDEX = 10;

  _isbOmmVotesActive = false;
  @Input({ required: true }) set isbOmmVotesActive(value: boolean) {
    const oldValue = this._isbOmmVotesActive;
    this._isbOmmVotesActive = value

    this.handleIsbOmmVotesActiveChange(value, oldValue);
  }
  @Input({ required: true }) searchSubject$!: Observable<string>;

  adjustVotesActive = false;
  adjustVotesActiveMobile = false;

  delegationPower = new BigNumber(0);
  ommTotalDelegationPower = new BigNumber(0);
  prepList?: PrepList;
  preps: Prep[] = [];
  prepsBommDelegationsInIcxMap = new Map<PrepAddress, BigNumber>;
  allValidatorCollectedFeesMap = new Map<PrepAddress, BigNumber>;
  totalPrepsBommDelegations = new BigNumber(0);
  totalAllValidatorCollectedFees = new BigNumber(0);
  delegationbOmmWorkingTotalSupply = new BigNumber(0);
  undelegatedIcx = new BigNumber(0);
  totalSicxAmount = new BigNumber(0);
  todaySicxRate: BigNumber = new BigNumber(0);

  // User variables
  userDelegationDetails: YourPrepVote[] = [];
  userDelegationDetailsMap = new Map<PrepAddress, YourPrepVote>();
  userDynamicDelegationDetailsMap = new Map<PrepAddress, BigNumber>();
  userDelegationWorkingbOmmBalance = new BigNumber(0);
  userWallet: Wallet | undefined;

  // Subscriptions
  allValidatorsCollectedFeesSub?: Subscription;
  userDelegationDetailsSub?: Subscription;
  userDelegationWorkingbOmmSub?: Subscription;
  prepListChangeSub?: Subscription;
  delegationOmmTotalWorkingSupplySub?: Subscription;
  undelegatedIcxSub?: Subscription;
  prepsBommDelegationsSub?: Subscription;
  searchSubjectSub?: Subscription;
  totalSicxAmountSub?: Subscription;
  todayRateSub?: Subscription;
  loginSub?: Subscription;

  constructor(private stateChangeService: StateChangeService,
              private deviceService: DeviceDetectorService,
              private cdRef: ChangeDetectorRef
              ) {
    super();
  }
  ngOnInit(): void {
    this.registerSubscriptions();
  }

  ngOnDestroy(): void {
    this.allValidatorsCollectedFeesSub?.unsubscribe();
    this.userDelegationDetailsSub?.unsubscribe();
    this.userDelegationWorkingbOmmSub?.unsubscribe();
    this.prepListChangeSub?.unsubscribe();
    this.delegationOmmTotalWorkingSupplySub?.unsubscribe();
    this.prepsBommDelegationsSub?.unsubscribe();
    this.searchSubjectSub?.unsubscribe();
    this.totalSicxAmountSub?.unsubscribe();
    this.todayRateSub?.unsubscribe();
    this.loginSub?.unsubscribe();
    this.undelegatedIcxSub?.unsubscribe();
  }

  private registerSubscriptions(): void {
    this.subscribeToUserLoginChange();
    this.subscribeToSearchStringChange();
    this.subscribeToUserDelegationDetailsChange();
    this.subscribeToUserDelegationWorkingbOmmChange();
    this.subscribeToUndelegatedIcxChange()
    this.subscribeToPrepListChange();
    this.subscribeToPrepsBommDelegationsChange();
    this.subscribeToAllValidatorsCollectedFeesChange();
    this.subscribeToDelegationbOmmTotalWorkingSupplyChange();
    this.subscribeToTotalSicxAmountChange();
    this.subscribeToSicxTodayRateChange();
  }

  private resetUserState(): void {
    this.userDelegationDetails = [];
    this.userDelegationDetailsMap = new Map<PrepAddress, YourPrepVote>();
    this.userDynamicDelegationDetailsMap = new Map<PrepAddress, BigNumber>();
    this.userDelegationWorkingbOmmBalance = new BigNumber(0);
  }

  private resetDynamicState(): void {
    this.userDynamicDelegationDetailsMap = new Map(this.userDelegationDetails.map(v => [v.address, v.percentage]));
  }

  private subscribeToUserLoginChange(): void {
    this.loginSub = this.stateChangeService.loginChange$.subscribe(value => {
      this.userWallet = value;

      if (!value) {
        this.resetUserState();
      }

      // detect changes
      this.cdRef.detectChanges();
    });
  }

  private subscribeToTotalSicxAmountChange(): void {
    this.totalSicxAmountSub = this.stateChangeService.totalSicxAmountChange$.subscribe(value => {
      this.totalSicxAmount = value;
      this.refreshValues();

      // detect changes
      this.cdRef.detectChanges();
    });
  }

  private subscribeToSicxTodayRateChange(): void {
    this.todayRateSub = this.stateChangeService.sicxTodayRateChange$.subscribe(todayRate => {
      this.todaySicxRate = todayRate;
      this.refreshValues();

      // detect changes
      this.cdRef.detectChanges();
    });
  }

  private subscribeToSearchStringChange(): void {
    this.searchSubject$.subscribe(searchString => {
      if (searchString == undefined || searchString == "") {
        this.preps = this.prepList?.preps ?? [];
      } else {
        this.preps = this.prepList?.preps.filter(prep => prep.name.toLowerCase().includes(searchString.toLowerCase())) ?? [];
      }

      // detect changes
      this.cdRef.detectChanges();
    });
  }

  private subscribeToAllValidatorsCollectedFeesChange(): void {
    this.allValidatorsCollectedFeesSub = this.stateChangeService.allValidatorsCollectedFeesChange$.subscribe(value => {
      this.allValidatorCollectedFeesMap = value;
      this.totalAllValidatorCollectedFees = Array.from(value.values()).reduce((total, value) => total.plus(value), new BigNumber(0));

      // detect changes
      this.cdRef.detectChanges();
    })
  }

  private subscribeToPrepsBommDelegationsChange(): void {
    this.prepsBommDelegationsSub = this.stateChangeService.prepsBommDelegationsChange$.subscribe(value => {
      this.prepsBommDelegationsInIcxMap = value;
      this.totalPrepsBommDelegations = Array.from(value.values()).reduce((total, value) => total.plus(value), new BigNumber(0));

      // detect changes
      this.cdRef.detectChanges();
    });
  }

  private subscribeToPrepListChange(): void {
    this.prepListChangeSub = this.stateChangeService.prepListChange$.subscribe(value => {
      this.prepList = value;
      this.preps = value.preps;

      // detect changes
      this.cdRef.detectChanges();
    })
  }

  private subscribeToUserDelegationWorkingbOmmChange(): void {
    this.userDelegationWorkingbOmmSub = this.stateChangeService.userDelegationWorkingbOmmChange$.subscribe(value => {
      this.userDelegationWorkingbOmmBalance = value;
      this.refreshValues();

      // detect changes
      this.cdRef.detectChanges();
    })
  }

  private subscribeToUndelegatedIcxChange(): void {
    this.undelegatedIcxSub = this.stateChangeService.undelegatedIcxChange$.subscribe(value => {
      this.undelegatedIcx = value;
      this.refreshValues();

      // detect changes
      this.cdRef.detectChanges();
    })
  }

  private subscribeToUserDelegationDetailsChange(): void {
    this.userDelegationDetailsSub = this.stateChangeService.userDelegationDetailsChange$.subscribe(value => {
      this.userDelegationDetails = value;
      this.userDelegationDetailsMap = new Map(value.map(v => [v.address, v]));
      this.userDynamicDelegationDetailsMap = new Map(value.map(v => [v.address, v.percentage]));

      // detect changes
      this.cdRef.detectChanges();
    })
  }

  private subscribeToDelegationbOmmTotalWorkingSupplyChange(): void {
    this.delegationOmmTotalWorkingSupplySub = this.stateChangeService.delegationbOmmTotalWorkingSupplyChange$.subscribe(value => {
      this.delegationbOmmWorkingTotalSupply = value;
      this.refreshValues();

      // detect changes
      this.cdRef.detectChanges();
    })
  }

  onVisibilityChanged(index: number, status: IntersectionStatus) {
    if (index == Math.round(this.PREP_PAGE_SIZE_INDEX / 1.5)  && status == IntersectionStatus.Visible) {
      this.PREP_PAGE_SIZE_INDEX  = this.PREP_PAGE_SIZE_INDEX * 2 < this.preps.length ? this.PREP_PAGE_SIZE_INDEX * 2 : this.preps.length;
    }
  }

  onDelegationInputKeyUp(e: KeyboardEvent | ClipboardEvent | FocusEvent, address: PrepAddress) {
    this.delay(() => {
      this.processDelegationInput(e, address);
    }, 650 );
  }

  processDelegationInput(e: KeyboardEvent | ClipboardEvent | FocusEvent, address: PrepAddress) {
    const element: HTMLInputElement = (<HTMLInputElement>e.target);
    const inputAmount: number = +usLocale.from(element.value);

    let delegationPercentage = new BigNumber(0);

    if (!inputAmount || inputAmount <= 0) {
      // handle invalid amount by resetting to 0
      this.userDynamicDelegationDetailsMap.set(address, new BigNumber(0));
    } else {
      delegationPercentage = new BigNumber(inputAmount).dividedBy(100);
      this.userDynamicDelegationDetailsMap.set(address, delegationPercentage)
    }

    // write value to the element because [value] does not trigger on change if number is equal to previous
    element.value = toNDecimalRoundedDownPercentString(delegationPercentage, 2, true);

    // detect changes
    this.cdRef.detectChanges();
  }

  onConfirmClick(e: MouseEvent) {
    e.stopPropagation();

    if (this.userDelegationHasChanged()) {
      if (this.userAllocatedVotesPercent().eq(1)) {
        // update delegations
        const payload = new UpdateDelegationPayload(
            Array.from(this.userDynamicDelegationDetailsMap.entries())
                .filter(([, value]) => value.gt(0))
                .map(([address, value]) => {
                  return new YourPrepVote(
                      address,
                      (this.prepList?.prepAddressToNameMap.get(address) ?? ""),
                      value
                  )
                }),
            this._isbOmmVotesActive,
            this.userDelegationWorkingbOmmBalance.gt(0)
        );
        this.stateChangeService.modalUpdate(ModalType.UPDATE_DELEGATIONS, payload);
      } else if (this.userAllocatedVotesPercent().eq(0)) {
        // remove delegations
        this.stateChangeService.modalUpdate(ModalType.REMOVE_ALL_DELEGATIONS, new RemoveDelegationsPayload(true));
      }

      // reset votes state
      this.resetAdjustVotesActive();
      this.resetDynamicState();

      // detect changes
      this.cdRef.detectChanges();
    } else {
      log.debug("User delegation hasn't been changed!");
    }
  }

  onAdjustVotesClick(e: MouseEvent, mobile = false) {
    e.stopPropagation();

    this.toggleAdjustVotesActive(mobile);

    // detect changes
    this.cdRef.detectChanges();
  }

  private toggleAdjustVotesActive(mobile = false): void {
    if (mobile) {
      this.adjustVotesActiveMobile = !this.adjustVotesActiveMobile;
    } else {
      this.adjustVotesActive = !this.adjustVotesActive;
    }
  }

  onCancelAdjustVotesClick(e: MouseEvent) {
    e.stopPropagation();

    this.resetDynamicState();

    this.resetAdjustVotesActive();
  }

  refreshValues(): void {
    this.calculateDelegationPower();
    this.calculateOmmVotingPower();
  }

  private calculateDelegationPower(): void {
    if (this.undelegatedIcx.gt(0) && this.delegationbOmmWorkingTotalSupply.gt(0)) {
      this.delegationPower = Calculations.delegationPower(this.undelegatedIcx, this.delegationbOmmWorkingTotalSupply);
    }
  }

  private calculateOmmVotingPower(): void {
    if (this.delegationPower.gt(0) && this.delegationbOmmWorkingTotalSupply.gt(0)) {
      this.ommTotalDelegationPower = Calculations.ommTotalDelegationPower(this.delegationPower, this.delegationbOmmWorkingTotalSupply);
    }
  }

  prepBommDelegationPercent(address: string): BigNumber {
    if (this.prepBommDdelegationIcx(address).gt(0) && this.totalPrepsBommDelegations.gt(0)) {
      return (this.prepBommDdelegationIcx(address)).dividedBy(this.totalPrepsBommDelegations);
    } else {
      return new BigNumber(0);
    }
  }

  prepCollectedFeesPercent(address: string): BigNumber {
    if (this.prepCollectedFees(address).gt(0)) {
      return (this.prepCollectedFees(address)).dividedBy(this.totalAllValidatorCollectedFees);
    } else {
      return new BigNumber(0);
    }
  }

  prepBommDdelegationIcx(address: string): BigNumber {
    return this.prepsBommDelegationsInIcxMap.get(address) ?? new BigNumber(0);
  }

  prepBommDdelegation(address: string): BigNumber {
    const icxDelegation = this.prepsBommDelegationsInIcxMap.get(address);

    if (icxDelegation && this.delegationPower.gt(0)) {
      return icxDelegation.dividedBy(this.delegationPower);
    } else {
      return new BigNumber(0);
    }
  }

  prepCollectedFees(address: string): BigNumber {
    return this.allValidatorCollectedFeesMap.get(address) ?? new BigNumber(0);
  }

  userDelegationHasChanged(): boolean {
    if (this.userDelegationDetailsMap.size != this.userDynamicDelegationDetailsMap.size) return true;

    // iterate user dynamic delegations and compare to user delegations
    for (const userDelegation of Array.from(this.userDelegationDetailsMap.values())) {
      const userDynamicDelegation = this.userDynamicDelegationDetailsMap.get(userDelegation.address)

      // if user delegation for prep address don't exist or is not equal to user dynamic delegation return true
      if (!userDynamicDelegation || !userDelegation.percentage.eq(userDynamicDelegation)) {
        return false
      }
    }

    return true;
  }

  userAllocatedVotesPercent(): BigNumber {
    if (this.userLoggedIn()) {
      return Array.from(this.userDynamicDelegationDetailsMap.values()).reduce(
          (res, vote) => res.plus(vote), new BigNumber(0));
    }

    return new BigNumber(0);
  }

  userBommDelegation(address: string): BigNumber {
    if (this.userDelegationDetailsMap.size > 0 && this.userDelegationWorkingbOmmBalance.gt(0)) {
      return this.userDelegationWorkingbOmmBalance.multipliedBy(this.userPrepDelegationPercent(address));
    } else {
      return new BigNumber(0);
    }
  }

  userPrepDelegationPercent(address: string): BigNumber {
    if (this.adjustActive()) {
      return this.userDynamicDelegationDetailsMap.get(address) ?? new BigNumber(0);
    } else {
      return this.userDelegationDetailsMap.get(address)?.percentage ?? new BigNumber(0);
    }
  }

  isPrepOmmContributor(address: string): boolean {
    return contributorsMap.get(address) ?? false;
  }

  isPrepOfferingIncentive(address: string): boolean {
    return prepsOfferingIncentiveMap.get(address) ?? false;
  }

  errorHandlerPrepLogo($event: any): void {
    $event.target.src = defaultPrepLogoUrl;
  }

  adjustActive(): boolean {
    return (!this.isMobile() && this.adjustVotesActive) || (this.isMobile() && this.adjustVotesActiveMobile);
  }
  isMobile(): boolean {
    return this.deviceService.isMobile();
  }

  prepAddress(index : number, prep: Prep) {
    return prep.address;
  }

  userLoggedIn(): boolean {
    return this.userWallet != undefined;
  }

  private handleIsbOmmVotesActiveChange(newValue: boolean, oldValue: boolean): void {
    if (newValue != oldValue) {
      this.resetDynamicState();
      this.resetAdjustVotesActive();
    }
  }

  private resetAdjustVotesActive(): void {
    this.adjustVotesActive = false;
    this.adjustVotesActiveMobile = false;
  }
}
