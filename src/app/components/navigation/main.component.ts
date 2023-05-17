import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import {RouterLink, RouterLinkActive, RouterOutlet} from "@angular/router";
import {StakeComponent} from "../stake/stake.component";

@Component({
  selector: 'app-main',
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterLink, RouterLinkActive, StakeComponent],
  templateUrl: './main.component.html'
})
export class MainComponent {

  userHasNotVotedClass() {
    // TODO
    return "";
  }
}
