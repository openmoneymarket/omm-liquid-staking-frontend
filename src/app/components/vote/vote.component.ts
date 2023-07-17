import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import {ValidatorsComponent} from "../validators/validators.component";
import {OmmLockingComponent} from "../omm-locking/omm-locking.component";
import {VoteOverviewComponent} from "../vote-overview/vote-overview.component";

@Component({
  selector: 'app-vote',
  standalone: true,
    imports: [CommonModule, ValidatorsComponent, OmmLockingComponent, VoteOverviewComponent],
  templateUrl: './vote.component.html'
})
export class VoteComponent {

}
