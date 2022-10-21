import { Address } from '@graphprotocol/graph-ts';

class Contracts {
  ClearingHouse: Address;
  clearingHouseLens: Address;
  RageTradeFactory: Address;
  InsuranceFund: Address;
  VPoolWrapper: Address;
  USDC: Address;
  CurveYieldStrategy: Address;
  VaultPeriphery: Address;
  CurveTriCryptoLpTokenAddress: Address;
  CurveQuoter: Address;
  GMXYieldStrategy: Address;
  GMXBatchingManager: Address;
  GlpStakingManager: Address;
  sGLP: Address;
  DnGmxSeniorVault: Address;
  DnGmxJuniorVault: Address;
  DnGmxBatchingManager: Address;
}

export let contracts: Contracts = {
  ClearingHouse: Address.fromString(
    '0x7047343e3eF25505263116212EE74430A2A12257'
  ),
  clearingHouseLens: Address.fromString(
    '0xd927a2c0ED99bFa2a562D6c61b4788D531d14741'
  ),
  RageTradeFactory: Address.fromString(
    '0x400E797E9ad4A8E5759Fbb5F39F5f34e074133D2'
  ),
  InsuranceFund: Address.fromString(
    '0x4380a6D84b1B7474aaB76559b2591F7ad862Bb66'
  ),
  VPoolWrapper: Address.fromString(
    '0x632a32E14cdb295284D20628ba622347465842CD'
  ),
  USDC: Address.fromString('0x6775842AE82BF2F0f987b10526768Ad89d79536E'),
  CurveYieldStrategy: Address.fromString(
    '0xddDcfF2D6CB373C2F1A115bAC6B1862b72b812f4'
  ),
  VaultPeriphery: Address.fromString(
    '0x5d44c28E34343888923aCFAc34AF617461657f9B'
  ),
  CurveTriCryptoLpTokenAddress: Address.fromString(
    '0xF11Ef8833f5aea639720354523eEDefC430E967b'
  ),
  CurveQuoter: Address.fromString('0xb2fba9f837904584123d259960f21e42de556459'),
  GMXYieldStrategy: Address.fromString(
    '0x4AB3e468C0afee9e0941D9FB26CDFDb438cff8dF'
  ),
  GMXBatchingManager: Address.fromString(
    '0x3d38Ff7Cbf232b314623510f0Ccda847414148c9'
  ),
  GlpStakingManager: Address.fromString(
    '0x5215aD536Ed3d0F827470B2C89bCf60001948990'
  ),
  sGLP: Address.fromString('0x28Fa343Dc9af1B976688C6551784FF9AC20D2937'),
  DnGmxSeniorVault: Address.fromString(
    '0xaAb3Ad95963326A931B590D708f6b43441b9D5f7'
  ),
  DnGmxJuniorVault: Address.fromString(
    '0xe5677C63dE20C8C3aa50ee76A7be31d6e33A058D'
  ),
  DnGmxBatchingManager: Address.fromString(
    '0x7CD9a855D4cB633B45935668ceE2bFe5FA935E38'
  ),
};
