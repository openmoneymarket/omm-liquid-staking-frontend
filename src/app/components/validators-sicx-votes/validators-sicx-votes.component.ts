import {
  AfterViewInit,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  Input,
  OnDestroy,
  OnInit
} from '@angular/core';
import {CommonModule} from '@angular/common';
import {HideElementPipe} from "../../pipes/hide-element-pipe";
import {Prep, PrepList} from "../../models/classes/Preps";
import {Observable, Subscription} from "rxjs";
import {StateChangeService} from "../../services/state-change.service";
import {DeviceDetectorService} from "ngx-device-detector";
import {BaseClass} from "../../models/classes/BaseClass";
import {PrepAddress} from "../../models/Types/ModalTypes";
import BigNumber from "bignumber.js";
import {RndDwnNPercPipe} from "../../pipes/round-down-percent.pipe";
import {UpdateDelegationPayload} from "../../models/classes/updateDelegationPayload";
import {ModalType} from "../../models/enums/ModalType";
import {RemoveDelegationsPayload} from "../../models/classes/removeDelegationsPayload";
import {contributorsMap, defaultPrepLogoUrl, prepsOfferingIncentiveMap, SICX} from "../../common/constants";
import {usLocale} from "../../common/formats";
import {YourPrepVote} from "../../models/classes/YourPrepVote";
import {UsFormatPipe} from "../../pipes/us-format.pipe";
import {Wallet} from "../../models/classes/Wallet";
import {IntersectionStatus} from "../../directives/from-intersection-observer";
import {IntersectionObserverDirective} from "../../directives/observe-visibility.directive";
import {RndDwnPipePipe} from "../../pipes/round-down.pipe";

@Component({
  selector: 'app-validators-sicx-votes',
  standalone: true,
    imports: [CommonModule, HideElementPipe, RndDwnNPercPipe, UsFormatPipe, IntersectionObserverDirective, RndDwnPipePipe],
  templateUrl: './validators-sicx-votes.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ValidatorsSicxVotesComponent extends BaseClass implements OnInit, OnDestroy, AfterViewInit {

  // used for pagination, start with 22 and increase when last element becomes visible
  PREP_PAGE_SIZE_INDEX = 10;

  _isSIcxVotesActive = false;
  @Input({ required: true }) set isSIcxVotesActive(value: boolean) {
    this._isSIcxVotesActive = value
    this.resetAdjustVotesActive();
  }
  @Input({ required: true }) searchSubject$!: Observable<string>;
  ready = false;

  prepList?: PrepList;
  preps: Prep[] = [];
  actualPrepDelegations = new Map<PrepAddress, BigNumber>(); // votes in ICX
  totalActualPrepDelegations = new BigNumber(0);
  adjustVotesActive = false;
  adjustVotesActiveMobile = false;
  todaySicxRate = new BigNumber(0);

  // User variables
  actualUserDelegationPercentage = new Map<PrepAddress, BigNumber>(); // votes in ICX
  actualDynUserDelegationPercentage = new Map<PrepAddress, BigNumber>(); // votes in ICX
  userWallet: Wallet | undefined;
  userSicxBalance = new BigNumber(0);

  // Subscriptions
  actualUserDelegationPercentageSub?: Subscription;
  prepListChangeSub?: Subscription;
  searchSubjectSub?: Subscription;
  actualPrepDelegationsSub?: Subscription
  todayRateSub?: Subscription;
  loginSub?: Subscription;
  userTokenBalanceSub?: Subscription;

  constructor(private stateChangeService: StateChangeService,
              private deviceService: DeviceDetectorService,
              private cdRef: ChangeDetectorRef
  ) {
    super();
  }

  ngOnInit(): void {
    this.registerSubscriptions();
  }

  ngAfterViewInit(): void {
    this.ready = true;
    this.cdRef.detectChanges();
  }

  ngOnDestroy(): void {
    this.prepListChangeSub?.unsubscribe();
    this.searchSubjectSub?.unsubscribe();
    this.actualPrepDelegationsSub?.unsubscribe();
    this.todayRateSub?.unsubscribe();
    this.actualUserDelegationPercentageSub?.unsubscribe();
    this.loginSub?.unsubscribe();
    this.userTokenBalanceSub?.unsubscribe();
  }

  private registerSubscriptions(): void {
    this.subscribeToUserLoginChange();
    this.subscribeToSearchStringChange();
    this.subscribeToActualUserDelegationPercentageChange();
    this.subscribeToPrepListChange();
    this.subscribeToActualPrepDelegationsChange();
    this.subscribeToTodaySicxRateChange();
    this.subscribeToUserTokenBalanceChange();
  }

  private resetUserState(): void {
    this.actualUserDelegationPercentage = new Map<PrepAddress, BigNumber>();
    this.actualDynUserDelegationPercentage = new Map<PrepAddress, BigNumber>();
    this.userSicxBalance = new BigNumber(0);
  }

  private resetDynamicState(): void {
    this.actualDynUserDelegationPercentage = new Map(Array.from(this.actualUserDelegationPercentage.entries()).map(([k, v]) => [k, new BigNumber(v)]));
  }

  private subscribeToUserTokenBalanceChange(): void {
    this.userTokenBalanceSub = this.stateChangeService.userTokenBalanceUpdate$.subscribe((value) => {
      if (value.token.symbol === SICX.symbol) {
        this.userSicxBalance = value.amount;
      }

      // detect changes
      this.cdRef.detectChanges();
    })
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

  private subscribeToTodaySicxRateChange(): void {
    this.todayRateSub = this.stateChangeService.sicxTodayRateChange$.subscribe(value => {
      this.todaySicxRate = value;

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

  private subscribeToActualPrepDelegationsChange(): void {
    this.actualPrepDelegationsSub = this.stateChangeService.actualPrepDelegationsChange$.subscribe(value => {
      this.actualPrepDelegations = value;
      this.totalActualPrepDelegations = Array.from(this.actualPrepDelegations.values()).reduce((total, value) => total.plus(value), new BigNumber(0));

      // detect changes
      this.cdRef.detectChanges();
    })
  }

  private subscribeToActualUserDelegationPercentageChange(): void {
    this.actualUserDelegationPercentageSub = this.stateChangeService.actualUserDelegationPercentageChange$.subscribe(value => {
      this.actualUserDelegationPercentage = value;
      this.actualDynUserDelegationPercentage = new Map(Array.from(value.entries()).map(([k, v]) => [k, new BigNumber(v)]));

      // detect changes
      this.cdRef.detectChanges();
    })
  }

  subscribeToPrepListChange(): void {
    this.prepListChangeSub = this.stateChangeService.prepListChange$.subscribe(value => {
      this.prepList = value;
      this.preps = value.preps;

      // detect changes
      this.cdRef.detectChanges();
    })
  }

  onDelegationInputKeyUp(e: KeyboardEvent | ClipboardEvent | FocusEvent, address: PrepAddress) {
    this.delay(() => {
      this.processDelegationInput(e, address);
    }, 650 );
  }

  processDelegationInput(e: KeyboardEvent | ClipboardEvent | FocusEvent, address: PrepAddress) {
    const inputAmount = +usLocale.from((<HTMLInputElement>e.target).value);

    if (!inputAmount || inputAmount <= 0) {
      this.actualDynUserDelegationPercentage.set(address, new BigNumber(0));
    } else {
      this.actualDynUserDelegationPercentage.set(address, new BigNumber(inputAmount).dividedBy(100));
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
            Array.from(this.actualDynUserDelegationPercentage.entries())
                .filter(([address, value]) => value.gt(0))
                .map(([address, value]) => {
              return new YourPrepVote(
                  address,
                  (this.prepList?.prepAddressToNameMap.get(address) ?? ""),
                  value
              );
            }),
            false
        );
        this.stateChangeService.modalUpdate(ModalType.UPDATE_DELEGATIONS, payload);
        this.resetAdjustVotesActive();
      } else if (this.userAllocatedVotesPercent().eq(0)) {
        // remove delegations
        this.stateChangeService.modalUpdate(ModalType.REMOVE_ALL_DELEGATIONS, new RemoveDelegationsPayload(false));
        this.resetAdjustVotesActive();
      }

      // detect changes
      this.cdRef.detectChanges();
    }
  }

  onVisibilityChanged(index: number, status: IntersectionStatus) {
    if (index == Math.round(this.PREP_PAGE_SIZE_INDEX / 1.5)  && status == IntersectionStatus.Visible) {
      this.PREP_PAGE_SIZE_INDEX  = this.PREP_PAGE_SIZE_INDEX * 2 < this.preps.length ? this.PREP_PAGE_SIZE_INDEX * 2 : this.preps.length;
    }
  }

  onAdjustVotesClick(e: MouseEvent, mobile = false) {
    e.stopPropagation();

    this.toggleAdjustVotesActive(mobile);

    // detect changes
    this.cdRef.detectChanges();
  }

  onCancelAdjustVotesClick(e: MouseEvent) {
    e.stopPropagation();

    this.resetDynamicState();

    this.resetAdjustVotesActive();

    // detect changes
    this.cdRef.detectChanges();
  }

  userDelegationHasNotChanged(): boolean {
    return this.actualUserDelegationPercentage.size == this.actualDynUserDelegationPercentage.size
        && Array.from(this.actualUserDelegationPercentage.entries()).every(([k, v]) => this.actualDynUserDelegationPercentage.get(k)?.eq(v) ?? false);
  }

  userAllocatedVotesPercent(): BigNumber {
    if (this.userLoggedIn()) {
      return Array.from(this.actualDynUserDelegationPercentage.values()).reduce((res, percent) => res.plus(percent), new BigNumber(0));
    }

    return new BigNumber(0);
  }

  userSicxDelegation(address: string): BigNumber {
    if (this.userSicxBalance.gt(0)) {
      return this.userSicxBalance.multipliedBy(this.userPrepDelegationPercent(address));
    } else {
      return new BigNumber(0);
    }
  }

  prepSicxDelegation(address: string): BigNumber {
    if (this.todaySicxRate.gt(0)) {
      return this.actualPrepDelegations.get(address)?.multipliedBy(this.todaySicxRate) ?? new BigNumber(0);
    }

    return new BigNumber(0);
  }

  prepSicxDelegationPercent(address: string): BigNumber {
    if (this.prepSicxDelegation(address).gt(0)) {
      return this.prepSicxDelegation(address).dividedBy(this.totalActualPrepDelegations.multipliedBy(this.todaySicxRate));
    }

    return new BigNumber(0);
  }

  userPrepDelegationPercent(address: string): BigNumber {
    if (this.adjustActive()) {
      return this.actualDynUserDelegationPercentage.get(address) ?? new BigNumber(0);
    } else {
      return this.actualUserDelegationPercentage.get(address) ?? new BigNumber(0);
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

  prepAddress(index : number, prep: Prep) {
    return prep.address;
  }

  adjustActive(): boolean {
    return this.adjustVotesActive || (this.isMobile() && this.adjustVotesActiveMobile);
  }

  private toggleAdjustVotesActive(mobile = false): void {
    if (mobile) {
      this.adjustVotesActiveMobile = !this.adjustVotesActiveMobile;
    } else {
      this.adjustVotesActive = !this.adjustVotesActive;
    }
  }

  isMobile(): boolean {
    return this.deviceService.isMobile();
  }

  userLoggedIn(): boolean {
    return this.userWallet != undefined;
  }

  private resetAdjustVotesActive(): void {
    this.adjustVotesActive = false;
    this.adjustVotesActiveMobile = false;
  }
}
