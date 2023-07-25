import {Component, Input} from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-validators-sicx-votes',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './validators-sicx-votes.component.html'
})
export class ValidatorsSicxVotesComponent {

  _isSIcxVotesActive = false;
  @Input({ required: true }) set isSIcxVotesActive(value: boolean) {
    this._isSIcxVotesActive = value
    this.resetAdjustVotesActive();
  }

  adjustVotesActive = false;
  adjustVotesActiveMobile = false;

  onAdjustVotesClick(e: MouseEvent, mobile = false) {
    e.stopPropagation();

    this.toggleAdjustVotesActive(mobile);
  }

  private toggleAdjustVotesActive(mobile = false): void {
    if (mobile) {
      this.adjustVotesActiveMobile = !this.adjustVotesActiveMobile;
    } else {
      this.adjustVotesActive = !this.adjustVotesActive;
    }
  }

  private resetAdjustVotesActive(): void {
    this.adjustVotesActive = false;
    this.adjustVotesActiveMobile = false;
  }
}
