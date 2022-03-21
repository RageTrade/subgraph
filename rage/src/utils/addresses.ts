import { Address } from '@graphprotocol/graph-ts'

class Contracts {
  ClearingHouse: Address;
  RageTradeFactory: Address;
  InsuranceFund: Address;
  VPoolWrapper: Address;
}

export let contracts: Contracts = { 
  ClearingHouse: Address.fromString("0x548F34A1D0d0C6CE98269497F320685D7ADB80DB"),
  RageTradeFactory: Address.fromString("0x6088fA06e133086a2D0E7307ba741A9206344d4e"),
  InsuranceFund: Address.fromString("0x5d163dC4412f87cfd7EF5E67a1125F26dA7DB662"),
  VPoolWrapper: Address.fromString("0x903b0e7Bff2e60bE03B07EfEb81AfD9E10B3500b"),
 };