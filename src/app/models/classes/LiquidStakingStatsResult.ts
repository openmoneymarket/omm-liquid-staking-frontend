import {LiquidStakingStats} from "./LiquidStakingStats";
import {Paginate} from "../interfaces/Paginate";

export class LiquidStakingStatsResult implements Paginate {
  docs: LiquidStakingStats[];
  limit: number;
  page: number;
  pages: number;
  total: number;

  constructor(docs: LiquidStakingStats[], limit: number, page: number, pages: number, total: number) {
    this.docs = docs;
    this.limit = limit;
    this.page = page;
    this.pages = pages;
    this.total = total;
  }
}
