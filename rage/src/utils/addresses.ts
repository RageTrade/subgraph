import { Address } from '@graphprotocol/graph-ts'

class Contracts {
  ClearingHouse: Address;
  RageTradeFactory: Address;
  InsuranceFund: Address;
  VPoolWrapper: Address;
}

export let contracts: Contracts = { 
  ClearingHouse: Address.fromString("0x549603efbd63a41f122Ae53A1dfEfDAFF9DB4CEa"),
  RageTradeFactory: Address.fromString("0x3A89bcc7Fe865579fE96063E14ed31fE71b29D05"),
  InsuranceFund: Address.fromString("0xbd31048d7a2f9c0afdeB604Df286d294A00F2692"),
  VPoolWrapper: Address.fromString("0x83DA9DD6fA62046743269c5F8afCd4469755d399"),
 };