import { Pipe, PipeTransform } from '@angular/core';
import BigNumber from "bignumber.js";
import {convertSecondsToDays} from "../common/utils";

@Pipe({
  name: 'secToDays',
  standalone: true
})
export class SecondsToDaysPipe implements PipeTransform {

  transform(seconds: BigNumber | number): string {
    if (+seconds == 0) return "-";

    return `${convertSecondsToDays(+seconds, true)} days`
  }

}
