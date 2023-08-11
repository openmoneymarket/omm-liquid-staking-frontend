import { Pipe, PipeTransform } from '@angular/core';
import BigNumber from "bignumber.js";
import {getPrettyUntilBlockHeightTime} from "../common/utils";
import {UserUnstakeData} from "../models/classes/UserUnstakeInfo";

@Pipe({
  name: 'untilBlockTime',
  standalone: true
})
export class PrettyUntilBlockHeightTime implements PipeTransform {

  transform(userUnstakeInfo: UserUnstakeData | undefined, blockheight: BigNumber | undefined): string | undefined {
    return getPrettyUntilBlockHeightTime(userUnstakeInfo, blockheight)
  }

}
