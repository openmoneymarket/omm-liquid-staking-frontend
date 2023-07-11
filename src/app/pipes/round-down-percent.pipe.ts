import { Pipe, PipeTransform } from '@angular/core';
import BigNumber from "bignumber.js";
import {toNDecimalRoundedDownPercentString} from "../common/utils";

@Pipe({
  name: 'rndDwnPerc',
  standalone: true
})
export class RoundDownPercentPipe implements PipeTransform {

  transform(num?: BigNumber | string, defaultZero = false): string {
    return toNDecimalRoundedDownPercentString(num, 0, defaultZero);
  }

}
