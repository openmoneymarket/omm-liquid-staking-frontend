import { Component } from '@angular/core';
import {CommonModule} from "@angular/common";
import {HeaderComponent} from "./components/header/header.component";
import {MainComponent} from "./components/navigation/main.component";

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  imports: [
    CommonModule,
    HeaderComponent,
    MainComponent
  ],
  standalone: true
})
export class AppComponent {
  title = 'omm-liquid-staking-dapp';
}
