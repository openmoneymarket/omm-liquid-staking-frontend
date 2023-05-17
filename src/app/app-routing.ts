import { Routes } from "@angular/router";
import {StakeComponent} from "./components/stake/stake.component";

export const APP_ROUTES: Routes = [
  {
    path: '',
    pathMatch: 'full',
    title: "Stake | Omm",
    redirectTo: "stake",
  },
  {
    path: "stake",
    title: "Stake | Omm",
    component: StakeComponent,
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
