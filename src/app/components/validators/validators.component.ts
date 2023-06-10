import {Component, OnInit} from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-validators',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './validators.component.html'
})
export class ValidatorsComponent implements OnInit {

  private bOmmVotesActive = true;

  adjustVotesActive = false;
  adjustVotesActiveMobile = false;

  ngOnInit(): void {
    this.resetAdjustVotesActive();
  }

  onbOmmVotesClick(e: MouseEvent) {
    e.stopPropagation();

    this.bOmmVotesActive = true;
    this.resetAdjustVotesActive();
  }

  onsIcxVotesClick(e: MouseEvent) {
    e.stopPropagation();

    this.bOmmVotesActive = false;
    this.resetAdjustVotesActive();
  }

  isbOmmVotesActive(): boolean {
    return this.bOmmVotesActive;
  }

  isSIcxVotesActive(): boolean {
    return !this.bOmmVotesActive;
  }

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
