import { Component } from "@angular/core";
import { CommonModule } from "@angular/common";
import { RouterLink, RouterLinkActive, RouterOutlet } from "@angular/router";
import { StakeComponent } from "../stake/stake.component";
import { StateChangeService } from "../../services/state-change.service";
import { combineLatest, map, Observable } from "rxjs";
import { StoreService } from "../../services/store.service";

@Component({
  selector: "app-main",
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterLink, RouterLinkActive, StakeComponent],
  templateUrl: "./main.component.html",
})
export class MainComponent {
  constructor(
    private stateChangeService: StateChangeService,
    private storeService: StoreService,
  ) {}

  protected userHasNotVotedOnActiveProposal(): Observable<boolean> {
    return combineLatest([
      this.stateChangeService.proposalListChange$,
      this.stateChangeService.userProposalVotesChange$,
    ]).pipe(
      map(([proposalList, _]) => {
        for (const proposal of proposalList) {
          const userProposalVote = this.storeService.userProposalVotes.get(proposal.id);

          if (userProposalVote) {
            // if proposal has not passed and user proposal vote id matches and vote is empty return true
            if (!proposal.proposalIsOver() && userProposalVote.voteIsEmpty()) {
              return true;
            }
          } else if (!proposal.proposalIsOver()) {
            return true;
          }
        }

        return false;
      }),
    );
  }
}
