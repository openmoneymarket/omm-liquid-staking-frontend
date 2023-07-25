import {Component, Input, OnDestroy, OnInit} from '@angular/core';
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
import {StoreService} from "../../services/store.service";
import {ModalType} from "../../models/enums/ModalType";
import {UpdateDelegationPayload} from "../../models/classes/updateDelegationPayload";
import {RemoveDelegationsPayload} from "../../models/classes/removeDelegationsPayload";

@Component({
  selector: 'app-validators-bomm-votes',
  standalone: true,
  imports: [CommonModule, HideElementPipe, RndDwnNPercPipe, UsFormatPipe],
  templateUrl: './validators-bomm-votes.component.html'
})
export class ValidatorsBommVotesComponent extends BaseClass implements OnInit, OnDestroy {

  _isbOmmVotesActive = false;
  @Input({ required: true }) set isbOmmVotesActive(value: boolean) {
    this._isbOmmVotesActive = value
    this.resetAdjustVotesActive();
  }
  @Input({ required: true }) searchSubject$!: Observable<string>;

  adjustVotesActive = false;
  adjustVotesActiveMobile = false;
  searchString = "";

  prepList?: PrepList;
  preps: Prep[] = [];
  userDelegationDetails: YourPrepVote[] = [];
  userDelegationDetailsMap = new Map<PrepAddress, YourPrepVote>();
  userDynamicDelegationDetailsMap = new Map<PrepAddress, YourPrepVote>();
  prepsBommDelegationsMap = new Map<PrepAddress, BigNumber>;
  userDelegationWorkingbOmmBalance = new BigNumber(0);
  delegationbOmmWorkingTotalSupply = new BigNumber(0);

  // Subscriptions
  userDelegationDetailsSub?: Subscription;
  userDelegationWorkingbOmmSub?: Subscription;
  prepListChangeSub?: Subscription;
  delegationOmmTotalWorkingSupplySub?: Subscription;
  prepsBommDelegationsSub?: Subscription;
  searchSubjectSub?: Subscription;

  constructor(private stateChangeService: StateChangeService,
              private deviceService: DeviceDetectorService,
              private storeService: StoreService
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
  }

  private registerSubscriptions(): void {
    this.subscribeToSearchStringChange();
    this.subscribeToUserDelegationDetailsChange();
    this.subscribeToUserDelegationWorkingbOmmChange();
    this.subscribeToPrepListChange();
    this.subscribeToPrepsBommDelegationsChange();
    this.subscribeToDelegationbOmmTotalWorkingSupplyChange();
  }

  private subscribeToSearchStringChange(): void {
    this.searchSubject$.subscribe(searchString => {
      if (searchString == undefined || searchString == "") {
        this.preps = this.prepList?.preps ?? [];
      } else {
        console.log("searchString: ", searchString);
        this.preps = this.prepList?.preps.filter(prep => prep.name.toLowerCase().includes(searchString.toLowerCase())) ?? [];
      }
    });
  }

  subscribeToPrepsBommDelegationsChange(): void {
    this.prepsBommDelegationsSub = this.stateChangeService.prepsBommDelegationsChange$.subscribe(value => {
      this.prepsBommDelegationsMap = value;
    });
  }

  subscribeToPrepListChange(): void {
    this.prepListChangeSub = this.stateChangeService.prepListChange$.subscribe(value => {
      this.prepList = value;
      this.preps = value.preps;
    })
  }

  subscribeToUserDelegationWorkingbOmmChange(): void {
    this.userDelegationWorkingbOmmSub = this.stateChangeService.userDelegationWorkingbOmmChange$.subscribe(value => {
      this.userDelegationWorkingbOmmBalance = value;
    })
  }

  private subscribeToUserDelegationDetailsChange(): void {
    this.userDelegationDetailsSub = this.stateChangeService.userDelegationDetailsChange$.subscribe(value => {
      this.userDelegationDetails = value;
      this.userDelegationDetailsMap = new Map(value.map(v => [v.address, v]));
      this.userDynamicDelegationDetailsMap = new Map(value.map(v => [v.address, v.clone()]));
    })
  }

  private subscribeToDelegationbOmmTotalWorkingSupplyChange(): void {
    this.delegationOmmTotalWorkingSupplySub = this.stateChangeService.delegationbOmmTotalWorkingSupplyChange$.subscribe(value => {
      this.delegationbOmmWorkingTotalSupply = value;
    })
  }

  onDelegationInputKeyUp(e: KeyboardEvent | ClipboardEvent | FocusEvent, address: PrepAddress) {
    this.delay(() => {
      this.processDelegationInput(e, address);
    }, 800 );
  }

  processDelegationInput(e: KeyboardEvent | ClipboardEvent | FocusEvent, address: PrepAddress) {
    const inputAmount = +usLocale.from((<HTMLInputElement>e.target).value);
    const delegation =  this.userDynamicDelegationDetailsMap.get(address);

    if (delegation) {
      if (!inputAmount || inputAmount <= 0) {
        delegation.percentage =  new BigNumber(0);
      } else {
        delegation.percentage = new BigNumber(inputAmount).dividedBy(100);
      }
    }
  }

  onConfirmClick(e: MouseEvent) {
    e.stopPropagation();

    this.resetAdjustVotesActive();

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
      } else if (this.userAllocatedVotesPercent().eq(0)) {
        // remove delegations
        this.stateChangeService.modalUpdate(ModalType.REMOVE_ALL_DELEGATIONS, new RemoveDelegationsPayload())
      }
    }
  }

  onAdjustVotesClick(e: MouseEvent, mobile = false) {
    e.stopPropagation();

    this.toggleAdjustVotesActive(mobile);
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

    this.userDynamicDelegationDetailsMap = new Map(this.userDelegationDetails.map(v => [v.address, v]));

    this.resetAdjustVotesActive();
  }

  prepBommDelegationPercent(address: string): BigNumber {
    if (this.prepBommDdelegation(address).gt(0) && this.delegationbOmmWorkingTotalSupply.gt(0)) {
      console.log("this.prepBommDdelegation(address):", this.prepBommDdelegation(address).toString());
      console.log("this.delegationbOmmWorkingTotalSupply:", this.delegationbOmmWorkingTotalSupply.toString());
      return this.prepBommDdelegation(address).dividedBy(this.delegationbOmmWorkingTotalSupply);
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
    return this.userDelegationDetailsMap.get(address)?.percentage ?? new BigNumber(0);
  }

  userDynPrepDelegationPercent(address: string): BigNumber {
    return this.userDynamicDelegationDetailsMap.get(address)?.percentage ?? new BigNumber(0);
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

  isMobile(): boolean {
    return this.deviceService.isMobile();
  }

  userLoggedIn(): boolean {
    return this.storeService.userLoggedIn();
  }

  private resetAdjustVotesActive(): void {
    this.adjustVotesActive = false;
    this.adjustVotesActiveMobile = false;
  }
}
