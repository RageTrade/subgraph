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
    '0xA75EFa09cFD4c85380047Bb155D9314ADDF9cdE5'
  ),
  clearingHouseLens: Address.fromString(
    '0xCD1a47E3844741446243238eE40dd9409bB17C3e'
  ),
  RageTradeFactory: Address.fromString(
    '0xdAf61e4BbE5Ec32037826FF3eDdAbED6be1AF369'
  ),
  InsuranceFund: Address.fromString(
    '0x2086eD3639f3126F85629F91AD9c8fEE16d0D733'
  ),
  VPoolWrapper: Address.fromString(
    '0x1525b7257211b6500Fd310fF88772ED18Fb36Ff7'
  ),
  USDC: Address.fromString('0xa94D611f3b0FDBb0a10CE03DC2af9F9eae23D838'),
  CurveYieldStrategy: Address.fromString(
    '0x7a18CD0Efd4D180ba00211ACed24632f1C1d4eB2'
  ),
  VaultPeriphery: Address.fromString(
    '0x06d3BBC37A8CeB52c79BCb03854ba381d0FF930c'
  ),
  CurveTriCryptoLpTokenAddress: Address.fromString(
    '0xB642fE1abE33D2B1F58EcdfF1617fD10Cd20D5f7'
  ),
  CurveQuoter: Address.fromString('0x16A4f7E81E02f08c5FCb5282ABE04186825817Cb'),
  GMXYieldStrategy: Address.fromString(
    '0x8753c1DA76da134b132F543338FEb26D948A37c6'
  ),
  GMXBatchingManager: Address.fromString(
    '0xa9A13AD1eB114827735caE5390826055293abC17'
  ),
  GlpStakingManager: Address.fromString(
    '0xd4866df601CA85d33DF2453Fc83AFE996B26B8c1'
  ),
  sGLP: Address.fromString('0x1Dac875be521199a3dD6CC10e7e738122d11059C'),
};
