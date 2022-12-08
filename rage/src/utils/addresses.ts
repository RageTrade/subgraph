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
  DnGmxSeniorVault: Address;
  DnGmxJuniorVault: Address;
  DnGmxBatchingManager: Address;
  DnGmxWithdrawPeriphery: Address;
  DnGmxDepositPeriphery: Address;
}

export let contracts: Contracts = {
  ClearingHouse: Address.fromString('0x4521916972A76D5BFA65Fb539Cf7a0C2592050Ac'),
  clearingHouseLens: Address.fromString('0xcb096429eA71Ec15639Cf8Bb71f86960E3d8F523'),
  RageTradeFactory: Address.fromString('0x14FcC60f9be14087FAC729df48fF33f2b3052C12'),
  InsuranceFund: Address.fromString('0xc6F3485C5cA2C08554EE9C516551035d0dE285d9'),
  VPoolWrapper: Address.fromString('0xd8dab97F71E2F91D82E658F848be6A49ddeb9CC5'),
  USDC: Address.fromString('0xff970a61a04b1ca14834a43f5de4533ebddb5cc8'),
  CurveYieldStrategy: Address.fromString('0x1d42783E7eeacae12EbC315D1D2D0E3C6230a068'),
  VaultPeriphery: Address.fromString('0x4b928aFd7CA775C7f4ECdf2c00B7e608962AbbDc'),
  CurveTriCryptoLpTokenAddress: Address.fromString(
    '0x8e0B8c8BB9db49a46697F3a5Bb8A308e744821D2'
  ),
  CurveQuoter: Address.fromString('0x2C2FC48c3404a70F2d33290d5820Edf49CBf74a5'),
  GMXYieldStrategy: Address.fromString('0x0000000000000000000000000000000000000000'),
  GMXBatchingManager: Address.fromString('0x0000000000000000000000000000000000000000'),
  GlpStakingManager: Address.fromString('0x0000000000000000000000000000000000000000'),
  sGLP: Address.fromString('0x2F546AD4eDD93B956C8999Be404cdCAFde3E89AE'),
  DnGmxSeniorVault: Address.fromString('0xf9305009FbA7E381b3337b5fA157936d73c2CF36'),
  DnGmxJuniorVault: Address.fromString('0x8478AB5064EbAC770DdCE77E7D31D969205F041E'),
  DnGmxBatchingManager: Address.fromString('0x519Eb01fa6Ed3d72E96e40770a45b13531CEf63d'),
  DnGmxWithdrawPeriphery: Address.fromString(
    '0xBA55D7f67Fa22DF5E92487d5b306DdB1aA543d10'
  ),
  DnGmxDepositPeriphery: Address.fromString('0x7CA90dD6813256BD040a8e13BbceD857B1C0C90c'),
};
