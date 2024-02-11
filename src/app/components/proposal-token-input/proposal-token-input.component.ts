import { Component, EventEmitter, Input, Output } from "@angular/core";
import { Irc2Token } from "../../models/classes/Irc2Token";
import { normalisedAmountToBaseAmountString } from "../../common/utils";
import BigNumber from "bignumber.js";

@Component({
  selector: "app-proposal-token-input",
  templateUrl: "./proposal-token-input.component.html",
  standalone: true,
})
export class ProposalTokenInputComponent {
  @Input() token!: Irc2Token;

  @Output() inputChange = new EventEmitter<string>();

  onInputChange(e: Event) {
    this.inputChange.emit(this.transformValueToDecimalized(e));
  }

  transformValueToDecimalized(e: any): string {
    const value = +e.target.value.toString();

    return normalisedAmountToBaseAmountString(new BigNumber(value), this.token.decimals);
  }
}
