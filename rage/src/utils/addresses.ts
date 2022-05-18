import { Address } from '@graphprotocol/graph-ts'

class Contracts {
  ClearingHouse: Address;
  RageTradeFactory: Address;
  InsuranceFund: Address;
  VPoolWrapper: Address;
  CurveYieldStrategy: Address;
  VaultPeriphery: Address;
}

export let contracts: Contracts = { 
  ClearingHouse: Address.fromString("0x655315A4115AE42dAa0670DcB3eb377E207749c3"),
  RageTradeFactory: Address.fromString("0x36b2F5440780B36d80d9235F0D4c64EB6692B5ab"),
  InsuranceFund: Address.fromString("0xA2423321c854a37F002D3c276DE1CA9E88935bf2"),
  VPoolWrapper: Address.fromString("0x2A13e9fE24fd6aa1736120Dc83138E3c182551FB"),
  CurveYieldStrategy: Address.fromString("0xAC81Ec44483CD8D36A62a5d88a7C4C93967BA0e4"),
  VaultPeriphery: Address.fromString("0x212f250163B890198B382223b8825B7875f9B790")
 };