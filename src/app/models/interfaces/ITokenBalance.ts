import {Irc2Token} from "../classes/Irc2Token";
import BigNumber from "bignumber.js";

export interface ITokenBalance {
    token: Irc2Token;
    balance: BigNumber;
}
