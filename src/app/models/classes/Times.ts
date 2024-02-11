import BigNumber from "bignumber.js";

export class Times {
  /** Class containing times (seconds, minutes, ..) in seconds, milliseconds and methods to retrieve arbitrary time in it */
  public static readonly SECOND_IN_MILLISECONDS = 1000;
  public static readonly MINUTE_IN_MILLISECONDS = 60000;
  public static readonly HOUR_IN_MILLISECONDS = 3600000;
  public static readonly DAY_IN_MILLISECONDS = 86400000;
  public static readonly WEEK_IN_MILLISECONDS = new BigNumber("604800000");
  public static readonly MONTH_IN_MILLISECONDS = new BigNumber("2592000000");
  public static readonly YEAR_IN_MILLISECONDS = new BigNumber("31536000000");
  public static readonly TWO_YEARS_IN_MILLISECONDS = new BigNumber("63072000000");
  public static readonly FOUR_YEARS_IN_MILLISECONDS = new BigNumber("126144000000");

  public static readonly MINUTE_IN_SECONDS = 60;
  public static readonly HOUR_IN_SECONDS = 3600;
  public static readonly DAY_IN_SECONDS = 86400;

  public static secondsInMilliseconds(seconds: number): number {
    return seconds * Times.SECOND_IN_MILLISECONDS;
  }

  public static minutesInMilliseconds(minutes: number): number {
    return minutes * Times.MINUTE_IN_MILLISECONDS;
  }

  public static minutesInSeconds(minutes: number): number {
    return minutes * Times.MINUTE_IN_SECONDS;
  }

  public static daysInSeconds(days: number): number {
    return days * Times.DAY_IN_SECONDS;
  }
}
