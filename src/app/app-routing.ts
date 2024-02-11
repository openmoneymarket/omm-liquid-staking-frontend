import { Routes } from "@angular/router";
import { StakeComponent } from "./components/stake/stake.component";

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
    loadChildren: () => import("./components/vote/vote-routes").then((p) => p.VOTE_ROUTES),
  },
  {
    path: "**",
    redirectTo: "stake",
  },
];
