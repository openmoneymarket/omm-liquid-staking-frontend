import { Pipe, PipeTransform } from "@angular/core";
import BigNumber from "bignumber.js";
import { convertSecondsToDH } from "../common/utils";

@Pipe({
  name: "SecToDh",
  standalone: true,
})
export class SecToDhPipe implements PipeTransform {
  transform(seconds: BigNumber | number): string {
    if (+seconds == 0) return "-";

    return convertSecondsToDH(+seconds);
  }
}
