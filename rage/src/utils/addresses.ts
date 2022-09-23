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
    '0xe3B8eF0C2Ed6d8318F0b1b50A072e0cB508CDB04'
  ),
  clearingHouseLens: Address.fromString(
    '0xFAEb252014eaE82e7954E33B16CCdbd058a1D89F'
  ),
  RageTradeFactory: Address.fromString(
    '0x172b070dc24D8f0a3Cd665e601a398419c5272E6'
  ),
  InsuranceFund: Address.fromString(
    '0xb84f7ACe7a6a5e54F84824605f7539aeD4A3e871'
  ),
  VPoolWrapper: Address.fromString(
    '0x80Fe2ca9c7D5e77934CdAaF6f2eAe002991cb679'
  ),
  USDC: Address.fromString('0x33a010E74A354bd784a62cca3A4047C1A84Ceeab'),
  CurveYieldStrategy: Address.fromString(
    '0xA1e33ebDA7e0bcC8d078886dA65d1Ea555495CEF'
  ),
  VaultPeriphery: Address.fromString(
    '0x15023878aa94CdC9B9CE4A46919330B0537caCf5'
  ),
  CurveTriCryptoLpTokenAddress: Address.fromString(
    '0x931073e47baA30389A195CABcf5F3549157afdc9'
  ),
  CurveQuoter: Address.fromString('0x07E837cAbcC37A8b185051Ae0E984346CECde049'),
  GMXYieldStrategy: Address.fromString(
    '0x71eec092b5Fccb12582f31993a3a401952239fe9'
  ),
  GMXBatchingManager: Address.fromString(
    '0x21Cb40D3CD26b7E98BC449Fd68E23B2b431EE9f3'
  ),
  GlpStakingManager: Address.fromString(
    '0x39aC75b66153Be03025E109f748928c812b23Afb'
  ),
  sGLP: Address.fromString('0xe2f057A1F5A1F100b9bF991709432f89602eAC68'),
};
