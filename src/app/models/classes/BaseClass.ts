/*
 * Base class to be used as extension in component in order to inherit useful methods
 */
export class BaseClass {
  public delay = (() => {
    let timer: any;
    return (callback: any, ms: any) => {
      clearTimeout(timer);
      timer = setTimeout(callback, ms);
    };
  })();
}
