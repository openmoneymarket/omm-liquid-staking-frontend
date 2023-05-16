import { Routes } from "@angular/router";
import {AppComponent} from "./app.component";

export const APP_ROUTES: Routes = [
  {
    path: '',
    pathMatch: 'full',
    redirectTo: 'home'
  },
  {
    path: 'home',
    component: AppComponent
  },
  // { LAZY LOAD placeholder example
  //   path: 'product',
  //   loadComponent: () => import('./product/product.component')
  //       .then(m => m.ProductComponent)
  // },
  // {
  //   path: '**',
  //   component: PagenotfoundComponent
  // }
];
