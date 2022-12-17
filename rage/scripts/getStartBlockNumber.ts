import sdk from '@ragetrade/sdk';
import { SdkNetwork } from './types';

type Subgraph = 'core' | 'tri-crypto-vault' | 'gmx-vault' | 'dn-gmx-vaults';

export function getStartBlockNumber(subgraph: Subgraph, network: SdkNetwork) {
  switch (subgraph) {
    case 'core':
      return sdk.core.getDeployments(network).RageTradeFactoryDeployment.receipt
        ?.blockNumber;

    case 'tri-crypto-vault':
      return sdk.tricryptoVault.getDeployments(network).SwapManagerLibraryDeployment
        .receipt?.blockNumber;

    case 'gmx-vault':
      return sdk.gmxVault.getDeployments(network).GlpStakingManagerLogicDeployment.receipt
        ?.blockNumber;

    case 'dn-gmx-vaults':
      return sdk.deltaNeutralGmxVaults.getDeployments(network).DnGmxJuniorVaultDeployment
        .receipt?.blockNumber;
  }
}
