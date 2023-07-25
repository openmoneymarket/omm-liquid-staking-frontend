import {Component, OnInit} from '@angular/core';
import { CommonModule } from '@angular/common';
import {ValidatorsBommVotesComponent} from "../validators-bomm-votes/validators-bomm-votes.component";
import {ValidatorsSicxVotesComponent} from "../validators-sicx-votes/validators-sicx-votes.component";
import {Subject} from "rxjs";
import {UsFormatPipe} from "../../pipes/us-format.pipe";
import {BaseClass} from "../../models/classes/BaseClass";
import {PrepAddress} from "../../models/Types/ModalTypes";
import {usLocale} from "../../common/formats";

@Component({
  selector: 'app-validators',
  standalone: true,
  imports: [CommonModule, ValidatorsBommVotesComponent, ValidatorsSicxVotesComponent, UsFormatPipe],
  templateUrl: './validators.component.html'
})
export class ValidatorsComponent extends BaseClass implements OnInit {

  private searchSubject = new Subject<string>();
  searchSubject$ = this.searchSubject.asObservable();

  private bOmmVotesActive = true;

  searchInput = "";

  ngOnInit(): void {
    this.resetSearchInput();
  }

  onSearchInputKeyUp(e: KeyboardEvent | ClipboardEvent | FocusEvent) {
    this.delay(() => {
      this.processSearchInput(e);
    }, 350 );
  }

  processSearchInput(e: KeyboardEvent | ClipboardEvent | FocusEvent) {
    this.searchSubject.next((<HTMLInputElement>e.target).value);
  }

  onbOmmVotesClick(e: MouseEvent) {
    e.stopPropagation();

    this.bOmmVotesActive = true;
  }

  onsIcxVotesClick(e: MouseEvent) {
    e.stopPropagation();

    this.bOmmVotesActive = false;
  }

  isbOmmVotesActive(): boolean {
    return this.bOmmVotesActive;
  }

  isSIcxVotesActive(): boolean {
    return !this.bOmmVotesActive;
  }

  resetSearchInput(): void {
    this.searchInput = "";
    this.searchSubject.next("");
  }

}
