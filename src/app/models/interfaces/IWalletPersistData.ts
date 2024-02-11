import { Address } from "../Types/ModalTypes";
import { WalletType } from "../enums/WalletType";

export interface IWalletPersistData {
  address: Address;
  type: WalletType;
  ledgerPath: string;
}
