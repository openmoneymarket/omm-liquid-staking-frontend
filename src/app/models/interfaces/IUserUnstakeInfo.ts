import { Address } from "../Types/ModalTypes";

export interface IUserUnstakeInfo {
  amount: string;
  blockHeight: string;
  from: Address;
  sender: Address;
}

// EXAMPLE
// [
//     {
//         "amount": "0x2096a791dbc23062",
//         "blockHeight": "0x1817aaa",
//         "from": "hxa40ebe7ef1e27203544f90835df03bf3fff42fd8",
//         "sender": "hxa40ebe7ef1e27203544f90835df03bf3fff42fd8"
//     }
// ]
