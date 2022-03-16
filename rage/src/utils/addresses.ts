import { Address } from '@graphprotocol/graph-ts'

class Contracts {
  ClearingHouse: Address;
  RageTradeFactory: Address;
  InsuranceFund: Address;
  VPoolWrapper: Address;
}

export let contracts: Contracts = { 
  ClearingHouse: Address.fromString("0x367Ee41731Ab92FEA4B0715e93a1D9f1c699A1dB"),
  RageTradeFactory: Address.fromString("0x4FC3D33Cbb9794041C19c006A9D6ac140905a02d"),
  InsuranceFund: Address.fromString("0x034A5eceB13c1601d7f0C930A3DEfAB5983C91f9"),
  VPoolWrapper: Address.fromString("0x9994F1D4931bF26492669b830Ffc7724Ca12a105"),
 };