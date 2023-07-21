import { Pipe, PipeTransform } from '@angular/core';
import BigNumber from "bignumber.js";
import {toNDecimalRoundedDownPercentString} from "../common/utils";

@Pipe({
  name: 'rndDwnNPerc',
  standalone: true
})
export class RndDwnNPercPipe implements PipeTransform {

  transform(num?: BigNumber | string, decimals = 0, defaultZero = false): string {
    return toNDecimalRoundedDownPercentString(num, decimals, defaultZero);
  }

}
