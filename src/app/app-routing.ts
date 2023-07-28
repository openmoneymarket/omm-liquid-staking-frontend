import { Routes } from "@angular/router";
import {StakeComponent} from "./components/stake/stake.component";
import {VoteComponent} from "./components/vote/vote.component";
import {AllProposalsComponent} from "./components/all-proposals/all-proposals.component";
import {VoteViewContainerComponent} from "./components/vote-view-container/vote-view-container.component";
import {ProposalComponent} from "./components/proposal/proposal.component";
import {NewProposalComponent} from "./components/new-proposal/new-proposal.component";

export const APP_ROUTES: Routes = [
  // {
  //   path: '',
  //   pathMatch: 'full',
  //   title: "Stake | Omm",
  //   redirectTo: "stake",
  // },
  {
    path: "stake",
    title: "Stake | Omm",
    component: StakeComponent,
  },
  {
    path: "vote",
    title: "Vote | Omm",
    loadChildren: () => import("./components/vote/vote-routes").then(p => p.VOTE_ROUTES)
  },
  {
    path: '**',
    redirectTo: "stake",
  }
];
