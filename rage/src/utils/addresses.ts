import { Address } from '@graphprotocol/graph-ts'

class Contracts {
  ClearingHouse: Address;
  RageTradeFactory: Address;
  InsuranceFund: Address;
  VPoolWrapper: Address;
}

export let contracts: Contracts = { 
  ClearingHouse: Address.fromString("0xB9F870bfe77982a9956D9D155b2A26f7B2a01E8F"),
  RageTradeFactory: Address.fromString("0x2650401380dF7D243Bc26b249F1c85920767b7bd"),
  InsuranceFund: Address.fromString("0x8be0ca6Ac3C5b09577119C4Bb31eD0337811A540"),
  VPoolWrapper: Address.fromString("0x35a46d039aC2Ce174a948E3399ec1819877E320F"),
 };