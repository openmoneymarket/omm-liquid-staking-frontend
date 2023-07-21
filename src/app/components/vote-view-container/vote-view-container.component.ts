import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import {RouterOutlet} from "@angular/router";

@Component({
  selector: 'app-vote-view-container',
  standalone: true,
  imports: [CommonModule, RouterOutlet],
  templateUrl: './vote-view-container.component.html'
})
export class VoteViewContainerComponent {

}
