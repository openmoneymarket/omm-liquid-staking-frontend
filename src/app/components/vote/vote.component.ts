import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import {ValidatorsComponent} from "../validators/validators.component";
import {OmmLockingComponent} from "../omm-locking/omm-locking.component";

@Component({
  selector: 'app-vote',
  standalone: true,
    imports: [CommonModule, ValidatorsComponent, OmmLockingComponent],
  templateUrl: './vote.component.html'
})
export class VoteComponent {

}
