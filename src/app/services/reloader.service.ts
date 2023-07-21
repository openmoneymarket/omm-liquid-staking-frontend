import {Injectable, OnDestroy} from '@angular/core';
import {StateChangeService} from "./state-change.service";
import BigNumber from "bignumber.js";
import {Times} from "../models/classes/Times";
import {timestampNowMicroseconds} from "../common/utils";
import {Subscription, timer} from "rxjs";
import {IconApiService} from "./icon-api.service";
import {BLOCK_POOL_INTERVAL_TIME, CURRENT_TIMESTAMP_INTERVAL} from "../common/constants";

@Injectable({
  providedIn: 'root'
})
/**
 * Service that manages reloading / refreshing of the data
 */
export class ReloaderService implements OnDestroy {

  public currentTimestamp: number = Math.floor(new Date().getTime() / 1000);
  public currentTimestampMicro: BigNumber = timestampNowMicroseconds();

  public lastBlockHeight = 0;

  blockPollSub?: Subscription;
  currentTimestampSub?: Subscription;

  constructor(private stateChangeService: StateChangeService,
              private iconApiService: IconApiService) {
    // refresh current timestamp every 10 second
    this.refreshCurrentTimestamp();
    this.initCurrentTimeStampInterval();

    this.initBlockHeightPolling();
  }

  ngOnDestroy(): void {
    this.blockPollSub?.unsubscribe();
    this.currentTimestampSub?.unsubscribe();
  }

  initCurrentTimeStampInterval(): void {
    this.currentTimestampSub = timer(0, CURRENT_TIMESTAMP_INTERVAL).subscribe(() => {
      this.refreshCurrentTimestamp();
    })
  }

  initBlockHeightPolling(): void {
    this.blockPollSub = timer(0, BLOCK_POOL_INTERVAL_TIME).subscribe( () => {
      this.iconApiService.getLastBlockHeight().then(block => {
        if (this.lastBlockHeight < block.height) {
          this.lastBlockHeight = block.height;
          this.stateChangeService.lastBlockHeightUpdate(block);
        }
      });
    });
  }

  refreshCurrentTimestamp(): void {
    this.currentTimestamp = Math.floor(new Date().getTime() / 1000);
    this.currentTimestampMicro = timestampNowMicroseconds();
    this.stateChangeService.currentTimestampUpdate(this.currentTimestamp, this.currentTimestampMicro);
  }
}
