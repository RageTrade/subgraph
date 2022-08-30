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
  ClearingHouse: Address.fromString("0x979722E4E83E99378E89060462c8Fb16255ad45f"),
  clearingHouseLens: Address.fromString("0x66941E71fA963B046Dd1E90F4a829Ec862B3BC75"),
  RageTradeFactory: Address.fromString("0xc9c2083662Bf12160D6D60C40AB5889A26B0D09c"),
  InsuranceFund: Address.fromString("0x571f0843B63D257745E1c75919B29aCa02C8F841"),
  VPoolWrapper: Address.fromString("0x315E4BbB6D42e4288aCF72C7A9fb4a6A28A99ee6"),
  CurveYieldStrategy: Address.fromString("0xD83025B6Ab3e4501967280c3C963b9a1E3E3C865"),
  VaultPeriphery: Address.fromString("0x0AE60cF310a4FB66614D80Da1353E498EC989597"),
  CurveTriCryptoLpTokenAddress: Address.fromString("0x931073e47baA30389A195CABcf5F3549157afdc9"),
  CurveQuoter: Address.fromString("0x07E837cAbcC37A8b185051Ae0E984346CECde049"),
  GMXYieldStrategy: Address.fromString("0x8fB1b11A573C46742a5a2A7b50C68518070069D4"),
  GMXBatchingManager: Address.fromString("0xddA28C867641894dC79e152fd1673BCBa1025C2E"),
  GlpStakingManager: Address.fromString("0xd0c350dc3E992DdF39Ea471ED7F2c579E935352b"),
  sGLP: Address.fromString("0xfa14956e27D55427f7E267313D1E12d2217747e6")
 };