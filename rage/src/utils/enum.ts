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
    enum TokenStatus {
      tricrypto
      gmx
    }
    ```
*/
export function getVaultNameEnum(vaultContractAddress: Address): string {
  if (vaultContractAddress.equals(contracts.CurveYieldStrategy)) {
    return 'tricrypto';
  } else if (vaultContractAddress.equals(contracts.GMXYieldStrategy)) {
    return 'gmx';
  } else {
    return 'unknown';
  }
}
