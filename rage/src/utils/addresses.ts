import { Address } from '@graphprotocol/graph-ts'

class Contracts {
  ClearingHouse: Address;
  RageTradeFactory: Address;
  InsuranceFund: Address;
  VPoolWrapper: Address;
}

export let contracts: Contracts = { 
  ClearingHouse: Address.fromString("0x0a9397967521C012ddFC7A3CE748A03229f4C010"),
  RageTradeFactory: Address.fromString("0x3446A0B09BeACA6fBafd8968A5e2A570c5965D1D"),
  InsuranceFund: Address.fromString("0xfA6673e52Bfb7106b6ea9B2593a0C596E8b91D74"),
  VPoolWrapper: Address.fromString("0x7E46b0BcDc4eb7afb3F7494b315406C3095A8bF8"),
 };