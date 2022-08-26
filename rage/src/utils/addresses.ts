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
  GlpStakingManager: Address;
  sGLP: Address;
}

export let contracts: Contracts = { 
  ClearingHouse: Address.fromString("0xD0d0DCD012E4a177e840e6703ab308cBA7D78DbD"),
  clearingHouseLens: Address.fromString("0x37cfe1986be2F2C0c3161365579FF9073C5134Cf"),
  RageTradeFactory: Address.fromString("0xa97ADDd8D76a9253a4fD3244d6CF281D7Bede22c"),
  InsuranceFund: Address.fromString("0x629358b96bCdb1307E61a8dd82AAa1Fc34ACc4C2"),
  VPoolWrapper: Address.fromString("0xb13682d0462bb319A238176d28AA533F5a4FA78f"),
  CurveYieldStrategy: Address.fromString("0x505a15841Ad96F8E893eFD66760b02eC86a43C0F"),
  VaultPeriphery: Address.fromString("0xA4925AC74C229674979E4BCB467E5a99453960B6"),
  CurveTriCryptoLpTokenAddress: Address.fromString("0x931073e47baA30389A195CABcf5F3549157afdc9"),
  CurveQuoter: Address.fromString("0x07E837cAbcC37A8b185051Ae0E984346CECde049"),
  GMXYieldStrategy: Address.fromString("0x499F97A1F2eDFbDde4E164Bb05f9cf8499E90ab2"),
  GlpStakingManager: Address.fromString("0xc75B127d442E9CBeeF9bD4F20FE57bD65cf67b10"),
  sGLP: Address.fromString("0xfa14956e27D55427f7E267313D1E12d2217747e6")
 };