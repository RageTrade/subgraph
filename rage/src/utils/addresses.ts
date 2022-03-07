import { Address } from '@graphprotocol/graph-ts'

class Contracts {
  ClearingHouse: Address;
  RageTradeFactory: Address;
  InsuranceFund: Address;
}

export let contracts: Contracts = { 
  ClearingHouse: Address.fromString("0x5739C2023Ba0f06C9c38fd4e0CDB596Bb4F6a104"),
  RageTradeFactory: Address.fromString("0x0532E839aa8F8E22f415DD67017adE849d0D247c"),
  InsuranceFund: Address.fromString("0x38e7498f54c80aBc25Ad854eD30a94f2ad0DA14d"),
 };