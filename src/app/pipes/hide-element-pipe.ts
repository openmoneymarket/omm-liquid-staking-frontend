import { Pipe, PipeTransform } from "@angular/core";

@Pipe({
  name: "hide",
  standalone: true,
})
export class HideElementPipe implements PipeTransform {
  /**
   * @description toggle elements css display attribute
   * @param hide - boolean flag indicating whether to hide element or not
   */
  transform(hide: boolean): any {
    return { display: hide ? "none" : null };
  }
}
