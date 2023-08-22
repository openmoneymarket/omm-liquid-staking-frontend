import { Injectable } from '@angular/core';
import {HttpClient, HttpParams} from "@angular/common/http";
import log from "loglevel";
import {lastValueFrom} from "rxjs";
import {dateToDateOnlyIsoString} from "../common/utils";
import {LiquidStakingStats} from "../models/classes/LiquidStakingStats";
import {LiquidStakingStatsPersist} from "../models/classes/LiquidStakingStatsPersist";
import {LiquidStakingStatsResult} from "../models/classes/LiquidStakingStatsResult";
import {environment} from "../../environments/environment";
import {LiquidStakingStatsData} from "../models/classes/LiquidStakingStatsData";
import {LocalStorageService} from "./local-storage.service";

@Injectable({
  providedIn: 'root'
})
export class LiquidStakingStatsHistoryService {

  private liquidStakingStatsHistoryKey = "liq.stats.hist";

  constructor(private httpClient: HttpClient,
              private localStorageService: LocalStorageService) { }

  // if updateData = true existing liquid staking stats history is updated with new entries
  persistLiquidStakingStatsHistoryInLocalStorage(liquidStakingStats: LiquidStakingStats[], updateData = false): void {
    if (liquidStakingStats.length > 0) {
      if (updateData) {
        // interestHistory contains array of new dates from the last existing ones
        const liquidStakingStatsHistoryPersisted = this.getLiquidStakingStatsFromLocalStorage();
        const liquidStakingStatsHistoryOld = liquidStakingStatsHistoryPersisted!.data;

        liquidStakingStats.forEach(el => {
          // push new date on end
          liquidStakingStatsHistoryOld.push(el);
        });

        liquidStakingStats = liquidStakingStatsHistoryOld;
        log.debug(`After liquid staking stats history data = `, liquidStakingStats);
      }

      const liquidStakingStatsPersist = new LiquidStakingStatsPersist(
        dateToDateOnlyIsoString(liquidStakingStats[0].date),
        dateToDateOnlyIsoString(liquidStakingStats[liquidStakingStats.length - 1].date),
        liquidStakingStats
      );

      this.localStorageService.set(this.liquidStakingStatsHistoryKey, liquidStakingStatsPersist);
    }
  }

  getLiquidStakingStatsFromLocalStorage(): LiquidStakingStatsPersist | undefined {
    try {
      const liquidStakingStats: LiquidStakingStatsPersist | undefined = this.localStorageService.get(this.liquidStakingStatsHistoryKey);
      log.debug("getLiquidStakingStatsFromLocalStorage:");
      log.debug(liquidStakingStats);
      return liquidStakingStats !== undefined ? new LiquidStakingStatsPersist(
        liquidStakingStats.from,
        liquidStakingStats.to,
        liquidStakingStats.data.map(el => new LiquidStakingStats(
          new Date(el.date),
          el.data
        )
        )
      ) : undefined;
    } catch (e) {
      log.error("Error in getLiquidStakingStatsFromLocalStorage...");
      log.error(e);
      return undefined;
    }
  }

  public getLiquidStakingStatsHistory(): Promise<LiquidStakingStatsResult> {
    return lastValueFrom(this.httpClient.get<LiquidStakingStatsResult>(environment.ommRestApi + "/liquid-staking-stats"));
  }

  public getLiquidStakingStatsHistoryFromTo(from: string, to: string): Promise<LiquidStakingStatsResult> {
    return lastValueFrom(this.httpClient.get<LiquidStakingStatsResult>(environment.ommRestApi + "/liquid-staking-stats/dates/between", {
      params: new HttpParams({
        fromObject: { from, to }
      })
    }));
  }

  public getAverageLiquidStakingStats(liquidStakingStats: LiquidStakingStatsData[]): { stakingApr: number, totalUnstakingRequestSum: number } {
    let stakingAprSum = 0;
    let totalUnstakingRequestSumSum = 0;
    let counter = 0;

    liquidStakingStats.forEach(data => {
      counter++;
      stakingAprSum += data.stakingApr;
      totalUnstakingRequestSumSum += data.totalUnstakingRequestSum;
    });

    return { stakingApr: stakingAprSum / counter, totalUnstakingRequestSum: totalUnstakingRequestSumSum / counter};
  }
}
