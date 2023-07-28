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

@Component({
  selector: 'app-validators-bomm-votes',
  standalone: true,
  imports: [CommonModule, HideElementPipe, RndDwnNPercPipe, UsFormatPipe, IntersectionObserverDirective],
  templateUrl: './validators-bomm-votes.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ValidatorsBommVotesComponent extends BaseClass implements OnInit, OnDestroy {

  // used for pagination, start with 22 and increase when last element becomes visible
  PREP_PAGE_SIZE_INDEX = 10;

  _isbOmmVotesActive = false;
  @Input({ required: true }) set isbOmmVotesActive(value: boolean) {
    this._isbOmmVotesActive = value
    this.resetAdjustVotesActive();
  }
  @Input({ required: true }) searchSubject$!: Observable<string>;

  adjustVotesActive = false;
  adjustVotesActiveMobile = false;

  votingPower = new BigNumber(0);
  ommVotingPower = new BigNumber(0);
  prepList?: PrepList;
  preps: Prep[] = [];
  prepsBommDelegationsMap = new Map<PrepAddress, BigNumber>;
  totalPrepsBommDelegations = new BigNumber(0);
  delegationbOmmWorkingTotalSupply = new BigNumber(0);
  totalSicxAmount = new BigNumber(0);
  todaySicxRate: BigNumber = new BigNumber(0);

  // User variables
  userDelegationDetails: YourPrepVote[] = [];
  userDelegationDetailsMap = new Map<PrepAddress, YourPrepVote>();
  userDynamicDelegationDetailsMap = new Map<PrepAddress, YourPrepVote>();
  userDelegationWorkingbOmmBalance = new BigNumber(0);
  userWallet: Wallet | undefined;

  // Subscriptions
  userDelegationDetailsSub?: Subscription;
  userDelegationWorkingbOmmSub?: Subscription;
  prepListChangeSub?: Subscription;
  delegationOmmTotalWorkingSupplySub?: Subscription;
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
    this.userDelegationDetailsSub?.unsubscribe();
    this.userDelegationWorkingbOmmSub?.unsubscribe();
    this.prepListChangeSub?.unsubscribe();
    this.delegationOmmTotalWorkingSupplySub?.unsubscribe();
    this.prepsBommDelegationsSub?.unsubscribe();
    this.searchSubjectSub?.unsubscribe();
    this.totalSicxAmountSub?.unsubscribe();
    this.todayRateSub?.unsubscribe();
    this.loginSub?.unsubscribe();
  }

  private registerSubscriptions(): void {
    this.subscribeToUserLoginChange();
    this.subscribeToSearchStringChange();
    this.subscribeToUserDelegationDetailsChange();
    this.subscribeToUserDelegationWorkingbOmmChange();
    this.subscribeToPrepListChange();
    this.subscribeToPrepsBommDelegationsChange();
    this.subscribeToDelegationbOmmTotalWorkingSupplyChange();
    this.subscribeToTotalSicxAmountChange();
    this.subscribeToSicxTodayRateChange();
  }

  private resetUserState(): void {
    this.userDelegationDetails = [];
    this.userDelegationDetailsMap = new Map<PrepAddress, YourPrepVote>();
    this.userDynamicDelegationDetailsMap = new Map<PrepAddress, YourPrepVote>();
    this.userDelegationWorkingbOmmBalance = new BigNumber(0);
  }

  private resetDynamicState(): void {
    this.userDynamicDelegationDetailsMap = new Map(this.userDelegationDetails.map(v => [v.address, v]));
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

  private subscribeToPrepsBommDelegationsChange(): void {
    this.prepsBommDelegationsSub = this.stateChangeService.prepsBommDelegationsChange$.subscribe(value => {
      this.prepsBommDelegationsMap = value;
      this.totalPrepsBommDelegations = Array.from(this.prepsBommDelegationsMap.values()).reduce((total, value) => total.plus(value), new BigNumber(0));

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

  private subscribeToUserDelegationDetailsChange(): void {
    this.userDelegationDetailsSub = this.stateChangeService.userDelegationDetailsChange$.subscribe(value => {
      this.userDelegationDetails = value;
      this.userDelegationDetailsMap = new Map(value.map(v => [v.address, v]));
      this.userDynamicDelegationDetailsMap = new Map(value.map(v => [v.address, v.clone()]));

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
    const inputAmount = +usLocale.from((<HTMLInputElement>e.target).value);
    const delegation =  this.userDynamicDelegationDetailsMap.get(address);

    if (!inputAmount || inputAmount <= 0) {
      if (delegation) {
        delegation.percentage =  new BigNumber(0);
      }
    } else {
      if (delegation) {
        delegation.percentage = new BigNumber(inputAmount).dividedBy(100);
      } else {
        this.userDynamicDelegationDetailsMap.set(address, new YourPrepVote(
            address,
            (this.prepList?.prepAddressToNameMap.get(address) ?? ""),
            new BigNumber(inputAmount).dividedBy(100)
        ))
      }
    }

    // detect changes
    this.cdRef.detectChanges();
  }

  onConfirmClick(e: MouseEvent) {
    e.stopPropagation();

    if (!this.userDelegationHasNotChanged()) {
      if (this.userAllocatedVotesPercent().eq(1)) {
        // update delegations
        const payload = new UpdateDelegationPayload(
            Array.from(this.userDynamicDelegationDetailsMap.values()).filter(v => v.percentage.gt(0)).map(v => {
              v.name = (this.prepList?.prepAddressToNameMap.get(v.address) ?? ""); // get name from prep list
              return v;
            }),
            this._isbOmmVotesActive
        );
        this.stateChangeService.modalUpdate(ModalType.UPDATE_DELEGATIONS, payload);
        this.resetAdjustVotesActive();
      } else if (this.userAllocatedVotesPercent().eq(0)) {
        // remove delegations
        this.stateChangeService.modalUpdate(ModalType.REMOVE_ALL_DELEGATIONS, new RemoveDelegationsPayload(true));
        this.resetAdjustVotesActive();
      }

      // detect changes
      this.cdRef.detectChanges();
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
    this.calculateOmmVotingPower();
    this.calculateVotingPower();
  }

  private calculateVotingPower(): void {
    if (this.ommVotingPower.gt(0)) {
      this.votingPower = Calculations.votingPower(this.ommVotingPower, this.userDelegationWorkingbOmmBalance,
          this.delegationbOmmWorkingTotalSupply);
    }
  }

  private calculateOmmVotingPower(): void {
    if (this.todaySicxRate.gt(0) && this.totalSicxAmount.gt(0)) {
      this.ommVotingPower = Calculations.ommVotingPower(this.totalSicxAmount, this.todaySicxRate);
    }
  }

  prepBommDelegationPercent(address: string): BigNumber {
    if (this.prepBommDdelegation(address).gt(0) && this.delegationbOmmWorkingTotalSupply.gt(0) && this.votingPower.gt(0)) {
      return (this.prepBommDdelegation(address)).dividedBy(this.totalPrepsBommDelegations);
    } else {
      return new BigNumber(0);
    }
  }

  prepBommDdelegation(address: string): BigNumber {
    return this.prepsBommDelegationsMap.get(address) ?? new BigNumber(0);
  }

  userDelegationHasNotChanged(): boolean {
    return Array.from(this.userDelegationDetailsMap.values()).every(vote => this.userDynamicDelegationDetailsMap.get(vote.address)?.equal(vote) ?? false);
  }

  userAllocatedVotesPercent(): BigNumber {
    if (this.userLoggedIn()) {
      return Array.from(this.userDynamicDelegationDetailsMap.values()).reduce((res, vote) => res = res.plus(vote.percentage), new BigNumber(0));
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
      return this.userDynamicDelegationDetailsMap.get(address)?.percentage ?? new BigNumber(0);
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
    return this.adjustVotesActive || (this.isMobile() && this.adjustVotesActiveMobile);
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

  private resetAdjustVotesActive(): void {
    this.adjustVotesActive = false;
    this.adjustVotesActiveMobile = false;
  }
}
