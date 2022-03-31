import { Address } from '@graphprotocol/graph-ts'

class Contracts {
  ClearingHouse: Address;
  RageTradeFactory: Address;
  InsuranceFund: Address;
  VPoolWrapper: Address;
}

export let contracts: Contracts = { 
  ClearingHouse: Address.fromString("0x2969960AC552B3E9e79b7e5105D4996fFc40cB8c"),
  RageTradeFactory: Address.fromString("0xd9d54e64eFcEb66A8e53fd62DFD9A01056b9c3Cd"),
  InsuranceFund: Address.fromString("0xA9708751Cef1FfB5C66b9D09505e057A816Bf949"),
  VPoolWrapper: Address.fromString("0xEA674577C34F32B04Db0e05cC39c2286529b74C2"),
 };