import { Pipe, PipeTransform } from '@angular/core';
import {formatIconAddressToShort} from "../common/utils";

@Pipe({
  name: 'shortenAddress',
  standalone: true
})
export class ShortenAddressPipePipe implements PipeTransform {

  transform(address: string, n = 4): string {
    return formatIconAddressToShort(address, n);
  }

}
