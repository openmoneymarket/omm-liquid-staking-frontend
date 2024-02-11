import { Irc2Token } from "../classes/Irc2Token";
import BigNumber from "bignumber.js";

export interface ITokenBalanceUpdate {
  token: Irc2Token;
  amount: BigNumber;
}
