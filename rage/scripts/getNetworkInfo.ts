import { ethers } from 'ethers';
import { SdkNetwork, SubgraphNetwork } from './types';

class MockProvider extends ethers.providers.StaticJsonRpcProvider {
  chainId: number;

  constructor(chainId: number) {
    super();
    this.chainId = chainId;
  }

  async getNetwork() {
    return {
      name: 'mock name',
      chainId: this.chainId,
    };
  }
}

type NetworkInfo = {
  subgraph: SubgraphNetwork;
  sdk: SdkNetwork;
  provider: MockProvider;
};

export function getNetworkInfo(networkInput: string): NetworkInfo {
  switch (networkInput) {
    case 'arbmain':
      return {
        subgraph: 'arbitrum-one',
        sdk: 'arbmain',
        provider: new MockProvider(42161),
      };
    case 'arbgoerli':
      return {
        subgraph: 'arbitrum-goerli',
        sdk: 'arbgoerli',
        provider: new MockProvider(421613),
      };
    default:
      throw new Error(`Network "${networkInput}" not supported.`);
  }
}
