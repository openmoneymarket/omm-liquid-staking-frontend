import {Component, OnDestroy, OnInit} from '@angular/core';
import { CommonModule } from '@angular/common';
import {StateChangeService} from "../../services/state-change.service";
import {Subscription} from "rxjs";
import BigNumber from "bignumber.js";
import {TokenSymbol} from "../../models/Types/ModalTypes";
import {IDaoFundBalance} from "../../models/interfaces/IDaoFundBalance";
import {Irc2Token} from "../../models/classes/Irc2Token";
import {ICX, OMM, SICX} from "../../common/constants";
import {UsFormatPipe} from "../../pipes/us-format.pipe";
import {DollarUsLocalePipe} from "../../pipes/dollar-us-locale.pipe";
import {convertICXToSICXPrice, convertSICXToICX} from "../../common/utils";

@Component({
  selector: 'app-vote-overview',
  standalone: true,
  imports: [CommonModule, UsFormatPipe, DollarUsLocalePipe],
  templateUrl: './vote-overview.component.html'
})
export class VoteOverviewComponent implements OnInit, OnDestroy {

  // template variables
  daoFundUsdValue = new BigNumber(0);
  stakingIncome  = new BigNumber(0); // balance of sICX in the Dao Fund

  // local state
  private tokenToUsdPriceMap = new Map<TokenSymbol, BigNumber>();
  daoFundBalances: IDaoFundBalance = { balances: [] };
  sicxTodayRate = new BigNumber(0);
  totalValidatorSicxRewards = new BigNumber(0);
  totalValidatorIcxRewards = new BigNumber(0);
  bOmmHoldersCount = new BigNumber(0);

  // Subscription
  daoFundBalanceSub?: Subscription;
  tokenPricesSub?: Subscription;
  sicxTodayRateSub?: Subscription;
  totalValidatorSub?: Subscription;
  bOmmHoldersCountSub?: Subscription;

  constructor(private stateChangeService: StateChangeService) {
  }

  ngOnInit(): void {
    this.registerSubscriptions();
  }

  ngOnDestroy(): void {
    this.daoFundBalanceSub?.unsubscribe();
    this.tokenPricesSub?.unsubscribe();
    this.sicxTodayRateSub?.unsubscribe();
    this.totalValidatorSub?.unsubscribe();
    this.bOmmHoldersCountSub?.unsubscribe();
  }

  private registerSubscriptions(): void {
    this.subscribeToDaoFundChange();
    this.subscribeToTokenPricesChange();
    this.subscribeToSicxTodayRateChange();
    this.subscribeToTotalValidatorRewardsChange();
    this.subscribeTobOmmHoldersCountChange();
  }

  private subscribeToDaoFundChange(): void {
    this.daoFundBalanceSub = this.stateChangeService.daoFundBalanceChange$.subscribe(value => {
      this.daoFundBalances = value;
      this.refreshTemplateValues();
    });
  }

  private subscribeToSicxTodayRateChange(): void {
    this.daoFundBalanceSub = this.stateChangeService.sicxTodayRateChange$.subscribe(value => {
      this.sicxTodayRate = value;
      this.refreshTemplateValues();
    });
  }

  private subscribeToTokenPricesChange(): void {
    this.tokenPricesSub = this.stateChangeService.tokenPricesChange$.subscribe(value => {
      this.tokenToUsdPriceMap = value;
      this.refreshTemplateValues();
    });
  }

  private subscribeToTotalValidatorRewardsChange(): void {
    this.totalValidatorSub = this.stateChangeService.totalValidatorSicxRewardsChange$.subscribe(sicxRewards => {
      this.totalValidatorSicxRewards = sicxRewards;
      this.refreshTemplateValues();
    });
  }

  private subscribeTobOmmHoldersCountChange(): void {
    this.bOmmHoldersCountSub = this.stateChangeService.bOmmHoldersCountChange$.subscribe(value => {
      this.bOmmHoldersCount = value;
    });
  }

  private refreshTemplateValues(): void {
    this.daoFundUsdValue = this.calculateDaoFundUsdValue();
    this.stakingIncome = convertSICXToICX(this.getDaoFundsSicxBalance(), this.sicxTodayRate);
    this.totalValidatorIcxRewards = convertSICXToICX(this.totalValidatorSicxRewards, this.sicxTodayRate);
  }

  private calculateDaoFundUsdValue(): BigNumber {
    // make sure both relevant objects are defined
    if (!this.daoFundBalances || !this.tokenToUsdPriceMap) return new BigNumber(0);

    return this.daoFundBalances.balances.reduce(
        (totalUsdValue, currentBalance) => totalUsdValue.plus(this.getTokenUsdPrice(currentBalance.token).multipliedBy(currentBalance.balance))
        , new BigNumber(0)
    );
  }

  private getDaoFundsSicxBalance(): BigNumber {
    return this.daoFundBalances.balances.find((tokenBalance) => tokenBalance.token.symbol == SICX.symbol)?.balance ?? new BigNumber(0);
  }

  private getTokenUsdPrice(token: Irc2Token): BigNumber {
    if (token.symbol === SICX.symbol) {
      const icxPrice = this.tokenToUsdPriceMap.get(ICX.symbol) ?? new BigNumber(0);
      return convertICXToSICXPrice(icxPrice, this.sicxTodayRate) ?? new BigNumber(0);
    }

    return this.tokenToUsdPriceMap.get(token.symbol) ?? new BigNumber(0);
  }

  getOmmBalance(): BigNumber {
    return this.daoFundBalances.balances.find((value) => value.token.symbol == OMM.symbol)?.balance ?? new BigNumber(0);
  }

  getsIcxBalance(): BigNumber {
    return this.daoFundBalances.balances.find((value) => value.token.symbol == SICX.symbol)?.balance ?? new BigNumber(0);
  }

}
