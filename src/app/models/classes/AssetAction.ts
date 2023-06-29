import BigNumber from "bignumber.js";
import {Irc2Token} from "./Irc2Token";

export class AssetAction {
  token: Irc2Token;
  before: BigNumber;
  after: BigNumber;
  amount: BigNumber;

  constructor(token: Irc2Token, before: BigNumber, after: BigNumber, amount: BigNumber) {
    this.token = token;
    this.before = before;
    this.after = after;
    this.amount = amount;
  }
}
