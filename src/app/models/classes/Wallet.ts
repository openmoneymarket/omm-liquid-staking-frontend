import {WalletType} from "../enums/WalletType";
import BigNumber from "bignumber.js";
import {Address, TokenSymbol} from "../Types/ModalTypes";
import {supportedTokens} from "../../common/constants";

export class Wallet {
  address: string;
  type: WalletType;
  name: string;
  ledgerPath: string;
  irc2TokenBalancesMap: Map<TokenSymbol, BigNumber>;

  constructor(address: Address, type: WalletType, ledgerPath = "") {
    this.address = address;
    this.type = type;
    this.name = getPrettyWalletName(type);
    this.ledgerPath = ledgerPath;
    this.irc2TokenBalancesMap = new Map<TokenSymbol, BigNumber>();

    // init asset balances
    supportedTokens.forEach(token => this.irc2TokenBalancesMap.set(token.symbol, new BigNumber(0)));
  }
}

export function getPrettyWalletName(type: WalletType): string {
  switch (type) {
    case WalletType.ICON:
      return "ICON wallet"
    case WalletType.LEDGER:
      return "Ledger wallet"
  }
}
