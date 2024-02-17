import { Pipe, PipeTransform } from "@angular/core";
import BigNumber from "bignumber.js";
import { toNDecimalRoundedDownPercentString } from "../common/utils";
import { DefaultValuePercent } from "../models/enums/DefaultValuePercent";

@Pipe({
  name: "rndDwnNPerc",
  standalone: true,
})
export class RndDwnNPercPipe implements PipeTransform {
  transform(
    num?: BigNumber | string | number,
    decimals = 0,
    defaultValue = DefaultValuePercent.MINUS_SIGN,
    keepZero = false,
  ): string {
    return toNDecimalRoundedDownPercentString(num, decimals, defaultValue, keepZero);
  }
}
