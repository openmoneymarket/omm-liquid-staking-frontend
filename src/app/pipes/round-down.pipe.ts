import { Pipe, PipeTransform } from '@angular/core';
import BigNumber from "bignumber.js";

@Pipe({
  name: 'RndDwn',
  standalone: true
})
export class RndDwnPipePipe implements PipeTransform {

  transform(num: BigNumber, decimals = 2): BigNumber {
    return num.dp(decimals, BigNumber.ROUND_DOWN)
  }

}
