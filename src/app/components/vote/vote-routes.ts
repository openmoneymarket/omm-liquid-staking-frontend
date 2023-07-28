import {Routes} from "@angular/router";
import {VoteViewContainerComponent} from "../vote-view-container/vote-view-container.component";
import {NewProposalComponent} from "../new-proposal/new-proposal.component";
import {AllProposalsComponent} from "../all-proposals/all-proposals.component";
import {ProposalComponent} from "../proposal/proposal.component";
import {VoteComponent} from "./vote.component";

export const VOTE_ROUTES: Routes = [
    {
        path: "",
        title: "Vote | Omm",
        component: VoteViewContainerComponent,
        children: [
            {
                path: "new-proposal",
                title: "New Proposal | Omm",
                component: NewProposalComponent,
            },
            {
                path: "all-proposals",
                title: "Proposals | Omm",
                component: AllProposalsComponent,
            },
            {
                path: "proposal/:id",
                title: "Proposal | Omm",
                component: ProposalComponent,
            },
            {
                path: "",
                title: "Vote | Omm",
                component: VoteComponent,
            },
        ]
    }
]
