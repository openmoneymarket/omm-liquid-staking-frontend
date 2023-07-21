import {Component, OnDestroy, OnInit} from '@angular/core';
import { CommonModule } from '@angular/common';
import {StateChangeService} from "../../services/state-change.service";
import {StoreService} from "../../services/store.service";
import {Proposal} from "../../models/classes/Proposal";
import {Subscription} from "rxjs";
import {Router, RouterLink} from "@angular/router";
import {timestampNowMicroseconds} from "../../common/utils";
import {RndDwnNPercPipe} from "../../pipes/round-down-percent.pipe";
import {UsFormatPipe} from "../../pipes/us-format.pipe";

@Component({
  selector: 'app-all-proposals',
  standalone: true,
  imports: [CommonModule, RndDwnNPercPipe, UsFormatPipe, RouterLink],
  templateUrl: './all-proposals.component.html'
})
export class AllProposalsComponent implements OnInit, OnDestroy {

  proposalList: Proposal[] = []
  currentTimestampMicro = timestampNowMicroseconds();

  // Subscriptions
  latestProposalsSub?: Subscription;
  currentTimestampSub?: Subscription;

  constructor(private stateChangeService: StateChangeService,
              private storeService: StoreService,
              private router: Router) {
  }

  ngOnInit(): void {
    this.subscribeToCurrenTimestampChange();
    this.subscribeLatestProposalsChange();
  }

  ngOnDestroy(): void {
    this.latestProposalsSub?.unsubscribe();
    this.currentTimestampSub?.unsubscribe();
  }

  subscribeLatestProposalsChange(): void {
    this.latestProposalsSub = this.stateChangeService.proposalListChange$.subscribe(proposalList => {
      this.proposalList = proposalList;
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

}
