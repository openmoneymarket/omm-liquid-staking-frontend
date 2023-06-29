import { Pipe, PipeTransform } from '@angular/core';
import BigNumber from "bignumber.js";
import {numToUsLocaleString} from "../common/utils";

@Pipe({
  name: 'usFormat',
  standalone: true,
})
export class UsFormatPipe implements PipeTransform {

  transform(amount?: string | number | BigNumber, defaultZero = false): string {
    return this.formatNumberToUSLocaleString(amount, defaultZero);
  }

  public formatNumberToUSLocaleString(num?: number | string | BigNumber, defaultZero = false): string {
    if (!num || (+num) === 0) { return defaultZero ? "0" : "-"; }
    return numToUsLocaleString(new BigNumber(num));
  }

}
