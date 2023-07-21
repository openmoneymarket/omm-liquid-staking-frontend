import { Routes } from "@angular/router";
import {StakeComponent} from "./components/stake/stake.component";
import {VoteComponent} from "./components/vote/vote.component";
import {AllProposalsComponent} from "./components/all-proposals/all-proposals.component";
import {VoteViewContainerComponent} from "./components/vote-view-container/vote-view-container.component";
import {ProposalComponent} from "./components/proposal/proposal.component";

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
    component: VoteViewContainerComponent,
    children: [
      {
        path: "all-proposals",
        title: "Proposals | Omm",
        component: AllProposalsComponent,
      },
      {
        path: "proposal/:id",
        title: "Proposals | Omm",
        component: ProposalComponent,
      },
      {
        path: "",
        title: "Vote | Omm",
        component: VoteComponent,
      },
    ]
  },
  // { LAZY LOAD placeholder example
  //   path: 'product',
  //   loadComponent: () => import('./product/product.component')
  //       .then(m => m.ProductComponent)
  // },
  {
    path: '**',
    redirectTo: "stake",
  }
];
