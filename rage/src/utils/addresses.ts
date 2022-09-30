import { Address } from '@graphprotocol/graph-ts';

class Contracts {
  ClearingHouse: Address;
  clearingHouseLens: Address;
  RageTradeFactory: Address;
  InsuranceFund: Address;
  VPoolWrapper: Address;
  USDC: Address;
  CurveYieldStrategy: Address;
  VaultPeriphery: Address;
  CurveTriCryptoLpTokenAddress: Address;
  CurveQuoter: Address;
  GMXYieldStrategy: Address;
  GMXBatchingManager: Address;
  GlpStakingManager: Address;
  sGLP: Address;
}

export let contracts: Contracts = {
  ClearingHouse: Address.fromString(
    '0xDBBa38B1bE4faAb8160dE5b8f749683588f8a12d'
  ),
  clearingHouseLens: Address.fromString(
    '0x107135d67f39B9bd137AFcCAa2452ce89A03cA76'
  ),
  RageTradeFactory: Address.fromString(
    '0x701c06135b0F51c2cbb35fB6C8c85e030f90Dc4B'
  ),
  InsuranceFund: Address.fromString(
    '0x82187DE339d302169CeF6D0184424a9670be9796'
  ),
  VPoolWrapper: Address.fromString(
    '0x50fAf69a6483b923DD9DA33a798A05aF08550Da5'
  ),
  USDC: Address.fromString('0xa94D611f3b0FDBb0a10CE03DC2af9F9eae23D838'),
  CurveYieldStrategy: Address.fromString(
    '0x13aDde92e65eDF332a3437baA97175f8A55C5600'
  ),
  VaultPeriphery: Address.fromString(
    '0x69e73B8c007fAF6BC90bf1b198Fa4D797D3Cb4Ea'
  ),
  CurveTriCryptoLpTokenAddress: Address.fromString(
    '0xd5981b565E66e57AE8A92eD110483a8EC68667C6'
  ),
  CurveQuoter: Address.fromString('0xD543d34b3a62Ba9f18b0A1A4dEE2D98972F28c6D'),
  GMXYieldStrategy: Address.fromString(
    '0x1AB0182daB5FE245F32e59599C99d21675091634'
  ),
  GMXBatchingManager: Address.fromString(
    '0xBa67C8894fC10af6Ddd33cD9304D218B94D8DFd5'
  ),
  GlpStakingManager: Address.fromString(
    '0x726E1b7a46159F30FB4dA46c9625004044356813'
  ),
  sGLP: Address.fromString('0x1Dac875be521199a3dD6CC10e7e738122d11059C'),
};
