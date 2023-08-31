import {Network} from "../app/models/enums/Network";

export const environment = {
    production: false,
    iconRpcUrl: "https://lisbon.net.solidwallet.io/api/v3",
    ommRestApi: "https://orca-app-auu8v.ondigitalocean.app/api/v1",
    iconDebugRpcUrl: "https://lisbon.net.solidwallet.io/api/v3d",
    BALANCED_DEX_SCORE: "cx7a90ed2f781876534cf1a04be34e4af026483de4",
    ledgerBip32Path: "44'/4801368'/0'/0'",
    GOVERNANCE_ADDRESS: "cx0000000000000000000000000000000000000001",
    IISS_API: "cx0000000000000000000000000000000000000000",
    NID: 2,
    SHOW_BANNER: false,
    NETWORK: Network.LISBON,
    ICX_TOKEN: "cx1111111111111111111111111111111111111111",
    OMM_TOKEN: "cx60d6cd6f54514eef43f5160dd60fc25c8a00f430",
    SICX_TOKEN: "cx2d013cb55781fb54b81d629aa4b611be2daec564",
    ADDRESS_PROVIDER_SCORE: "cx3beb2fa9b7cfa3684f6db1413897dfcf6cc1b04c" ,
    trackerUrl: "https://tracker.lisbon.icon.community",
};
