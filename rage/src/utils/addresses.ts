import { Address } from '@graphprotocol/graph-ts'

class Contracts {
  ClearingHouse: Address;
  RageTradeFactory: Address;
  InsuranceFund: Address;
  VPoolWrapper: Address;
}

export let contracts: Contracts = { 
  ClearingHouse: Address.fromString("0x50dAAC4F57F2F58f0Db2819f94954F3A1DBB90eC"),
  RageTradeFactory: Address.fromString("0x986e8e144e7bE47bcC4c5E22d2E0D3e2cbb7F7Cb"),
  InsuranceFund: Address.fromString("0xfb7ADB15a3d03aa6d3e8167B1d0aFFa374D1e7ce"),
  VPoolWrapper: Address.fromString("0xBa7A7a37d1246eb5ef7682835C96cfefa9114f19"),
 };