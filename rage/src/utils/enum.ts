import { Address } from '@graphprotocol/graph-ts';
import { contracts } from './addresses';

/**
  ```graphql
  enum TokenStatus {
      NONE
      TokenStatus
      UPPER_LIMIT
  }
  ```
*/
export function getLimitOrderEnum(limitOrder: i32): string {
  switch (limitOrder) {
    case 0:
      return 'NONE';
    case 1:
      return 'LOWER_LIMIT';
    case 2:
      return 'UPPER_LIMIT';
    default:
      return 'NONE';
  }
}

/**
    ```graphql
    enum VaultName {
      tricrypto
      gmx
      DnGMXSenior
      DnGMXJunior
      unknown
    }
    ```
*/
export function getVaultNameEnum(vaultContractAddress: Address): string {
  if (vaultContractAddress.equals(contracts.CurveYieldStrategy)) {
    return 'tricrypto';
  } else if (vaultContractAddress.equals(contracts.GMXYieldStrategy)) {
    return 'gmx';
  } else if (vaultContractAddress.equals(contracts.DnGmxSeniorVault)) {
    return 'dn_gmx_senior';
  } else if (vaultContractAddress.equals(contracts.DnGmxJuniorVault)) {
    return 'dn_gmx_junior';
  } else {
    return 'unknown';
  }
}
