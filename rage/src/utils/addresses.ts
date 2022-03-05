import { Address } from '@graphprotocol/graph-ts'

class Contracts {
  ClearingHouse: Address;
  RageTradeFactory: Address;
  InsuranceFund: Address;
}

export let contracts: Contracts = { 
  ClearingHouse: Address.fromHexString("0x93fb98a87Aa1002E940f5b5Fb15444d1337ca2dF"),
  RageTradeFactory: Address.fromHexString("0x4539253aDA67931E779666E3dF3Ce5C55DD322e9"),
  InsuranceFund: Address.fromHexString("0x49a9b9322c3934decd9e7712B59bF1ADb345c45e"),
 };