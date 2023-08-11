import { Pipe, PipeTransform } from '@angular/core';
import BigNumber from "bignumber.js";
import {convertSecondsToDays, convertSecondsToDHM} from "../common/utils";

@Pipe({
  name: 'secToDhm',
  standalone: true
})
export class SecondsToDhm implements PipeTransform {

  transform(seconds: BigNumber | number): string {
    if (+seconds == 0) return "-";

    return convertSecondsToDHM(+seconds)
  }

}
