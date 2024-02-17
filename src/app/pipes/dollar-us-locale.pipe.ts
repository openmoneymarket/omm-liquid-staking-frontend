import { Pipe, PipeTransform } from "@angular/core";
import BigNumber from "bignumber.js";
import { toDollarUSLocaleString } from "../common/utils";

@Pipe({
  name: "dollarUsLocale",
  standalone: true,
})
export class DollarUsLocalePipe implements PipeTransform {
  transform(num?: BigNumber | string, defaultZero = false): string {
    return toDollarUSLocaleString(num, defaultZero);
  }
}
