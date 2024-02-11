import { Component, Input, OnDestroy, OnInit } from "@angular/core";
import { CommonModule } from "@angular/common";
import BigNumber from "bignumber.js";
import { Vote } from "../../models/classes/Vote";
import { IProposalScoreDetails } from "../../models/interfaces/IProposalScoreDetails";
import { Proposal } from "../../models/classes/Proposal";
import { timestampNowMicroseconds } from "../../common/utils";
import { StateChangeService } from "../../services/state-change.service";
import { Subscription } from "rxjs";
import { StoreService } from "../../services/store.service";
import { ModalType } from "../../models/enums/ModalType";
import { GovernanceVotePayload } from "../../models/classes/GovernanceVotePayload";
import { LoadingComponent } from "../loading/loading.component";
import { UsFormatPipe } from "../../pipes/us-format.pipe";
import { DataLoaderService } from "../../services/data-loader.service";
import log from "loglevel";
import { RouterLink } from "@angular/router";
import { RndDwnPipePipe } from "../../pipes/round-down.pipe";
import { RndDwnNPercPipe } from "../../pipes/round-down-percent.pipe";
import { DefaultValuePercent } from "../../models/enums/DefaultValuePercent";

@Component({
  selector: "app-proposal",
  standalone: true,
  imports: [CommonModule, LoadingComponent, RndDwnPipePipe, UsFormatPipe, RouterLink, RndDwnPipePipe, RndDwnNPercPipe],
  templateUrl: "./proposal.component.html",
})
export class ProposalComponent implements OnInit, OnDestroy {
  proposalId!: string;
  @Input()
  set id(proposalId: string) {
    this.proposalId = proposalId;
  }

  activeProposal: Proposal | undefined;
  userVote: Vote | undefined;
  proposalScoreDetails: IProposalScoreDetails[] | undefined;

  currentTimestampMicro = timestampNowMicroseconds();

  // Subscriptions
  proposalListSub?: Subscription;
  userVoteChangeSub?: Subscription;
  loginSub?: Subscription;
  proposalScoreDetailsSub?: Subscription;

  constructor(
    private stateChangeService: StateChangeService,
    private storeService: StoreService,
    private dataLoaderService: DataLoaderService,
  ) {}

  ngOnInit(): void {
    this.registerSubscriptions();
  }

  ngOnDestroy(): void {
    this.proposalListSub?.unsubscribe();
    this.userVoteChangeSub?.unsubscribe();
    this.loginSub?.unsubscribe();
    this.proposalScoreDetailsSub?.unsubscribe();
  }

  private registerSubscriptions(): void {
    this.subscribeToProposalListChange();
    this.subscribeToUserProposalVoteChange();
    this.subscribeToLoginChange();
    this.subscribeToProposalScoreDetailsChange();
  }

  subscribeToProposalScoreDetailsChange(): void {
    this.proposalScoreDetailsSub = this.stateChangeService.proposalScoreDetailsChange$.subscribe((res) => {
      if (res.proposalId == this.proposalId) {
        log.debug("this.proposalScoreDetails = res.proposalScoreDetails;");
        this.proposalScoreDetails = res.proposalScoreDetails;
      }
    });
  }

  subscribeToLoginChange(): void {
    this.loginSub = this.stateChangeService.loginChange$.subscribe((wallet) => {
      // logout
      if (wallet == undefined) {
        this.userVote = undefined;
      }
    });
  }

  subscribeToUserProposalVoteChange(): void {
    this.userVoteChangeSub = this.stateChangeService.userProposalVotesChange$.subscribe((change) => {
      if (change && this.activeProposal && change.proposalId == this.activeProposal?.id) {
        this.userVote = this.storeService.userProposalVotes.get(this.proposalId);
      }
    });
  }

  subscribeToProposalListChange(): void {
    this.proposalListSub = this.stateChangeService.proposalListChange$.subscribe((proposalList) => {
      this.activeProposal = proposalList.find((proposal) => proposal.id == this.proposalId);
      this.userVote = this.storeService.userProposalVotes.get(this.proposalId);

      if (this.activeProposal && !this.proposalScoreDetails) {
        this.loadProposalScoreDetails();
      }
    });
  }

  async loadProposalScoreDetails(): Promise<void> {
    log.debug("loadProposalScoreDetails...");
    if (!this.proposalScoreDetails) {
      const proposalScoreDetails = this.storeService.proposalScoreDetailsMap.get(this.proposalId);

      if (proposalScoreDetails) {
        this.proposalScoreDetails = proposalScoreDetails;
      } else if (this.activeProposal) {
        this.dataLoaderService.loadAsyncContractOptions(this.activeProposal);
      }
    }
  }

  getUsersVotingWeightOnProposal(): BigNumber {
    if (this.userVote) {
      if (this.userVote.against.isFinite() && !this.userVote.against.isZero()) {
        return this.userVote.against;
      } else {
        return this.userVote.for;
      }
    } else {
      return new BigNumber("0");
    }
  }

  isProposalContractType(): boolean {
    return this.activeProposal?.isProposalContractType() ?? false;
  }

  isVoteValid(): boolean {
    if (this.userVote) {
      return (
        (this.userVote.against.isFinite() && !this.userVote.against.isZero()) ||
        (this.userVote.for.isFinite() && !this.userVote.for.isZero())
      );
    } else {
      return false;
    }
  }

  isVoteRejected(): boolean {
    if (this.userVote) {
      return this.userVote.against.isGreaterThan(this.userVote.for);
    }
    return false;
  }

  isVoteApproved(): boolean {
    if (this.userVote) {
      return this.userVote.for.isGreaterThan(this.userVote.against);
    }
    return false;
  }

  totalVoters(): number {
    const proposal = this.activeProposal;
    return (proposal?.forVoterCount.toNumber() ?? 0) + (proposal?.againstVoterCount.toNumber() ?? 0);
  }

  onRejectClick(): void {
    const castVotePayload = new GovernanceVotePayload(false, this.proposalId, this.userVotingWeight());
    this.stateChangeService.modalUpdate(ModalType.CAST_VOTE, castVotePayload);
  }

  onApproveClick(): void {
    const governanceAction = new GovernanceVotePayload(true, this.proposalId, this.userVotingWeight());
    this.stateChangeService.modalUpdate(ModalType.CAST_VOTE, governanceAction);
  }

  userVotingWeight(): BigNumber {
    return this.storeService.userVotingWeightForProposal.get(this.proposalId) ?? new BigNumber(0);
  }

  onChangeVoteClick(): void {
    if (this.isVoteApproved()) {
      this.onRejectClick();
    } else if (this.isVoteRejected()) {
      this.onApproveClick();
    }
  }

  userLoggedIn(): boolean {
    return this.storeService.userLoggedIn();
  }

  protected readonly DefaultValue = DefaultValuePercent;
}
