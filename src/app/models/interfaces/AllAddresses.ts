import {Address} from "../Types/ModalTypes";

export interface AllAddresses {
    systemContract: SystemContract;
    collateral: CollateralContracts;
}

interface CollateralContracts {
    OMM: Address,
    sICX: Address
}

interface SystemContract {
    DEX: string;
    Governance: string;
    LendingPool: string;
    LendingPoolDataProvider: string;
    Staking: string;
    Rewards: string;
    OmmToken: string;
    Delegation: string;
    PriceOracle: string;
    RewardWeightController: string;
    StakedLp: string;
    bOMM: string;
}
