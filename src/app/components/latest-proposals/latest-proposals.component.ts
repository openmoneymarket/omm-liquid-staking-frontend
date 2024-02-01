import {Component, OnDestroy, OnInit} from '@angular/core';
import { CommonModule } from '@angular/common';
import {StoreService} from "../../services/store.service";
import {Proposal} from "../../models/classes/Proposal";
import {Subscription} from "rxjs";
import {StateChangeService} from "../../services/state-change.service";
import {timestampNowMicroseconds} from "../../common/utils";
import {Router, RouterLink} from "@angular/router";
import {RndDwnNPercPipe} from "../../pipes/round-down-percent.pipe";
import {DefaultValuePercent} from "../../models/enums/DefaultValuePercent";

@Component({
  selector: 'app-latest-proposals',
  standalone: true,
  imports: [CommonModule, RndDwnNPercPipe, RouterLink],
  templateUrl: './latest-proposals.component.html'
})
export class LatestProposalsComponent implements OnInit, OnDestroy {

  currentTimestampMicro = timestampNowMicroseconds();
  latestProposals: Proposal[] = [];

  currentTimestampSub?: Subscription;
  latestProposalsSub?: Subscription;

  constructor(private storeService: StoreService,
              private router: Router,
              private stateChangeService: StateChangeService) {
  }

  ngOnInit(): void {
    this.subscribeToCurrenTimestampChange();
    this.subscribeLatestProposalsChange();
  }

  ngOnDestroy(): void {
    this.currentTimestampSub?.unsubscribe();
    this.latestProposalsSub?.unsubscribe();
  }

  subscribeLatestProposalsChange(): void {
    this.latestProposalsSub = this.stateChangeService.proposalListChange$.subscribe(proposalList => {
      this.latestProposals = proposalList.slice(0, 3);
    });
  }

  subscribeToCurrenTimestampChange(): void {
    this.currentTimestampSub = this.stateChangeService.currentTimestampChange$.subscribe(res => {
      this.currentTimestampMicro = res.currentTimestampMicro;
    });
  }

  onProposalClick(proposal: Proposal): void {
    this.router.navigate(["vote/proposal", proposal.id.toString()]);
  }

  userLoggedIn(): boolean {
    return this.storeService.userLoggedIn();
  }

  protected readonly DefaultValue = DefaultValuePercent;
}
