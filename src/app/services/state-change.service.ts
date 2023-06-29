import { Injectable } from '@angular/core';
import {Observable, ReplaySubject, Subject} from "rxjs";
import {Address, ModalPayload, TokenSymbol} from "../models/Types/ModalTypes";
import {ModalAction, ModalActionsResult} from "../models/classes/ModalAction";
import BigNumber from "bignumber.js";
import {Irc2Token} from "../models/classes/Irc2Token";
import {PersistenceService} from "./persistence.service";
import {ITokenBalanceUpdate} from "../models/interfaces/ITokenBalanceUpdate";
import {Wallet} from "../models/classes/Wallet";
import {ModalType} from "../models/enums/ModalType";
import {AllAddresses} from "../models/interfaces/AllAddresses";
import {supportedTokens} from "../common/constants";

@Injectable({
  providedIn: 'root'
})
export class StateChangeService {

  private userModalActionChange = new ReplaySubject<ModalAction>();
  userModalActionChange$ = this.userModalActionChange.asObservable();

  private allAddressesLoaded = new ReplaySubject<AllAddresses>();
  public allAddressesLoaded$ = this.allAddressesLoaded.asObservable();

  private userModalActionResult = new ReplaySubject<ModalActionsResult>();
  userModalActionResult$ = this.userModalActionResult.asObservable();

  private afterUserDataReload: Subject<void> = new Subject<void>();
  afterUserDataReload$: Observable<void> = this.afterUserDataReload.asObservable();

  private afterCoreDataReload: Subject<void> = new Subject<void>();
  afterCoreDataReload$: Observable<void> = this.afterCoreDataReload.asObservable();

  private currentTimestampChange = new ReplaySubject<{ currentTimestamp: number, currentTimestampMicro: BigNumber }>();
  currentTimestampChange$ = this.currentTimestampChange.asObservable();

  private modalPayloadChange = new ReplaySubject<{modalType: ModalType; payload: ModalPayload | undefined}>();
  modalPayloadChange$= this.modalPayloadChange.asObservable();

  private lockedOmmActionSucceeded = new ReplaySubject<boolean>();
  lockedOmmActionSucceeded$: Observable<boolean> = this.lockedOmmActionSucceeded.asObservable();

  private irc2TokenBalanceUpdate = new ReplaySubject<ITokenBalanceUpdate>();
  irc2TokenBalanceUpdate$ = this.irc2TokenBalanceUpdate.asObservable();

  private loginChange = new ReplaySubject<Wallet | undefined>();
  public loginChange$ = this.loginChange.asObservable();

  private sicxTodayRateChange = new ReplaySubject<BigNumber>();
  public sicxTodayRateChange$ = this.sicxTodayRateChange.asObservable();

  private tokenPricesChange = new ReplaySubject<Map<TokenSymbol, BigNumber>>();
  public tokenPricesChange$ = this.tokenPricesChange.asObservable();

  constructor(private persistenceService: PersistenceService) {
  }

  public allAddressesLoadedUpdate(allAddresses: AllAddresses): void {
    // @ts-ignore
    supportedTokens.forEach(token => token.address = allAddresses.collateral[token.symbol] as Address)
    this.persistenceService.allAddresses = allAddresses;
    this.allAddressesLoaded.next(allAddresses);
  }

  public tokenPricesUpdate(value: Map<TokenSymbol, BigNumber>): void {
    this.persistenceService.tokenUsdPrices = value;
    this.tokenPricesChange.next(value);
  }

  public sicxTodayRateUpdate(value: BigNumber): void {
    this.persistenceService.sicxTodayRate = value;
    this.sicxTodayRateChange.next(value);
  }

  public modalUpdate(modalType: ModalType, payload?: ModalPayload): void {
    this.modalPayloadChange.next({ modalType, payload });
  }

  public updateLoginStatus(wallet: Wallet | undefined): void {
    this.loginChange.next(wallet);
  }

  public updateUserAssetBalance(balance: BigNumber, token: Irc2Token): void {
    this.persistenceService.activeWallet!.irc2TokenBalancesMap.set(token.symbol, balance);
    this.irc2TokenBalanceUpdate.next({ token, amount: balance })
  }

  public userDataReloadUpdate(): void {
    this.afterUserDataReload.next();
  }

  public coreDataReloadUpdate(): void {
    this.afterCoreDataReload.next();
  }

  public userModalActionResultUpdate(value: ModalActionsResult): void {
    this.userModalActionResult.next(value);
  }

  public currentTimestampUpdate(currentTimestamp: number, currentTimestampMicro: BigNumber): void {
    this.currentTimestampChange.next({ currentTimestamp, currentTimestampMicro});
  }

  public updateUserModalAction(modalAction: ModalAction): void {
    this.userModalActionChange.next(modalAction);
  }

  public lockedOmmActionSucceededUpdate(succeeded: boolean): void {
    this.lockedOmmActionSucceeded.next(succeeded);
  }

}
