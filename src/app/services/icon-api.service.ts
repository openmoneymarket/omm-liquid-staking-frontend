import { Injectable } from "@angular/core";
import BigNumber from "bignumber.js";
import IconService, { Block, ScoreApiList } from "icon-sdk-js";
const { IconConverter, IconAmount, IconBuilder } = IconService;
const { CallBuilder, CallTransactionBuilder, IcxTransactionBuilder } = IconBuilder;
import { environment } from "../../environments/environment";
import { HttpClient } from "@angular/common/http";
import { hexToBigNumber, hexToNormalisedNumber, isHex } from "../common/utils";
import { IconTransactionType } from "../models/enums/IconTransactionType";
import log from "loglevel";
import { lastValueFrom } from "rxjs";
import { Hash } from "icon-sdk-js/build/types/hash";

@Injectable({
  providedIn: "root",
})
export class IconApiService {
  public httpProvider;
  public iconService;

  public stepCost = 30000000;

  constructor(private http: HttpClient) {
    this.httpProvider = new IconService.HttpProvider(environment.iconRpcUrl);
    this.iconService = new IconService(this.httpProvider);
  }

  // return ICX Balance in BigNumber (not normalised, e.g. 1e18)
  async getIcxBalance(address: string): Promise<BigNumber> {
    if (!address) {
      throw new Error("getIcxBalance -> address empty or null!");
    }
    return hexToNormalisedNumber(await this.iconService.getBalance(address).execute());
  }

  async getScoreApi(address: string, height?: Hash): Promise<ScoreApiList> {
    return this.iconService.getScoreApi(address, height).execute();
  }

  public async getTxResult(txHash: string): Promise<any> {
    return this.iconService.getTransactionResult(txHash).execute();
  }

  public async getLastBlockHeight(): Promise<Block> {
    return this.iconService.getLastBlock().execute();
  }

  public convertNumberToHex(value: BigNumber): string {
    return IconConverter.toHex(IconConverter.toBigNumber(value));
  }
  public buildTransaction(
    from: string,
    to: string,
    method: string,
    params: any,
    transactionType: IconTransactionType,
    icxValue: BigNumber | string = "0x0",
  ): any {
    let tx = null;
    const timestamp = new Date().getTime() * 1000;
    const nonce = IconConverter.toHex(IconConverter.toBigNumber(1));
    const stepLimit = IconConverter.toHex(IconConverter.toBigNumber(this.stepCost));
    const version = IconConverter.toHex(IconConverter.toBigNumber(3));
    const nid = IconConverter.toHex(IconConverter.toBigNumber(environment.NID));
    icxValue = !isHex(icxValue) ? IconConverter.toHex(IconAmount.of(icxValue, IconAmount.Unit.ICX).toLoop()) : icxValue;

    switch (transactionType) {
      case IconTransactionType.WRITE:
        /* Build `CallTransaction` instance for executing SCORE function. */
        tx = new CallTransactionBuilder()
          .method(method)
          .params(params)
          .from(from)
          .to(to)
          .stepLimit(stepLimit)
          .nid(nid)
          .value(icxValue)
          .nonce(nonce)
          .version(version)
          .timestamp(timestamp)
          .build();
        break;
      case IconTransactionType.READ:
        /* Build `Call` instance for calling external i.e. read methods . */
        tx = new CallBuilder().to(to).method(method).params(params).build();
        break;
      case IconTransactionType.TRANSFER:
        /* Build `IcxTransaction` instance for sending ICX. */
        tx = new IcxTransactionBuilder()
          .from(from)
          .to(to)
          .value(icxValue)
          .stepLimit(stepLimit)
          .nid(nid)
          .nonce(nonce)
          .version(version)
          .timestamp(timestamp)
          .build();
        break;
      default:
        break;
    }

    return tx;
  }

  public async estimateStepCost(tx: any): Promise<BigNumber | undefined> {
    const estimateStepCostPromise = lastValueFrom(
      this.http.post<number>(environment.iconDebugRpcUrl, {
        jsonrpc: "2.0",
        method: "debug_estimateStep",
        id: 1234,
        params: tx,
      }),
    );

    try {
      const res: any = await estimateStepCostPromise;
      const estimatedStepCost = hexToBigNumber(res.result);
      log.debug(`estimatedStepCost = ${estimatedStepCost}`);
      return estimatedStepCost;
    } catch (e) {
      log.error("estimateStepCost error:");
      log.error(e);
      return undefined;
    }
  }

  public async sendTransaction(signedTx: any): Promise<string> {
    try {
      log.debug("Sending transaction: ", signedTx);
      const txHash = await this.iconService.sendTransaction(signedTx).execute();
      log.debug("Tx hash ", txHash);
      return txHash;
    } catch (e) {
      throw e;
    }
  }
}
