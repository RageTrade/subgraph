import { Address } from '@graphprotocol/graph-ts'

class Contracts {
  ClearingHouse: Address;
  clearingHouseLens: Address;
  RageTradeFactory: Address;
  InsuranceFund: Address;
  VPoolWrapper: Address;
  CurveYieldStrategy: Address;
  VaultPeriphery: Address;
  CurveTriCryptoLpTokenAddress: Address;
  CurveQuoter: Address;
  GMXYieldStrategy: Address;
  GMXBatchingManager: Address;
}

export let contracts: Contracts = { 
  ClearingHouse: Address.fromString("0xe3B8eF0C2Ed6d8318F0b1b50A072e0cB508CDB04"),
  clearingHouseLens: Address.fromString("0xFAEb252014eaE82e7954E33B16CCdbd058a1D89F"),
  RageTradeFactory: Address.fromString("0x172b070dc24D8f0a3Cd665e601a398419c5272E6"),
  InsuranceFund: Address.fromString("0xb84f7ACe7a6a5e54F84824605f7539aeD4A3e871"),
  VPoolWrapper: Address.fromString("0x80Fe2ca9c7D5e77934CdAaF6f2eAe002991cb679"),
  CurveYieldStrategy: Address.fromString("0xA1e33ebDA7e0bcC8d078886dA65d1Ea555495CEF"),
  VaultPeriphery: Address.fromString("0x15023878aa94CdC9B9CE4A46919330B0537caCf5"),
  CurveTriCryptoLpTokenAddress: Address.fromString("0x931073e47baA30389A195CABcf5F3549157afdc9"),
  CurveQuoter: Address.fromString("0x07E837cAbcC37A8b185051Ae0E984346CECde049"),
  GMXYieldStrategy: Address.fromString("0xe67cBd79427C99C2487f7b7523A85F9a8A691774"),
  GMXBatchingManager: Address.fromString("0xcc0ec95dCB624201018B8857415D96DA093829d2")
 };