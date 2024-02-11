export class Irc2Token {
  address?: string;

  readonly decimals: number;

  readonly symbol: string;

  readonly name: string;

  readonly isNative: boolean;

  constructor(decimals: number, symbol: string, name: string, address?: string) {
    this.decimals = decimals;
    this.symbol = symbol;
    this.name = name;
    this.isNative = symbol == "ICX";
    this.address = address;
  }

  addressInitialised(): boolean {
    return this.address != undefined;
  }

  addressError(): string {
    return `${this.symbol} address not initialised!`;
  }

  className(): string {
    return this.symbol.toLowerCase();
  }
}
