import fs from 'fs-extra';
import consola from 'consola';
import path from 'path';
import { SubgraphNetwork } from './types';
import { ethers } from 'ethers';

const ZERO = ethers.constants.AddressZero

type Contracts = {
  ClearingHouse: string;
  clearingHouseLens: string;
  RageTradeFactory: string;
  VPoolWrapper: string;
  USDC: string;
  CurveYieldStrategy: string;
  VaultPeriphery: string;
  CurveTriCryptoLpTokenAddress: string;
  CurveQuoter: string;
  GMXYieldStrategy: string;
  GMXBatchingManager: string;
  GlpStakingManager: string;
  sGLP: string;
  DnGmxSeniorVault: string;
  DnGmxJuniorVault: string;
  DnGmxBatchingManager: string;
  DnGmxWithdrawPeriphery: string;
  DnGmxDepositPeriphery: string;
};

export async function updateAddressTS(
  network: SubgraphNetwork
  ) {
  const basePath = process.cwd();
  const jsonFilePath = path.resolve(basePath, './src/addresses.json');
  const tsFilePath = path.resolve(basePath, './src/utils/addresses.ts');

  const addresses = await fs.readJSON(jsonFilePath, { encoding: 'utf-8' }) as {
    [key in SubgraphNetwork] : Record<string, string>
  };

  if(!addresses[network]){
    throw new Error(`${network} not found in addresses.json`)
  }

  const {
    ClearingHouse = ZERO,
    clearingHouseLens = ZERO,
    RageTradeFactory = ZERO,
    VPoolWrapper = ZERO,
    USDC = ZERO,
    CurveYieldStrategy = ZERO,
    VaultPeriphery = ZERO,
    CurveTriCryptoLpTokenAddress = ZERO,
    CurveQuoter = ZERO,
    GMXYieldStrategy = ZERO,
    GMXBatchingManager = ZERO,
    GlpStakingManager = ZERO,
    sGLP = ZERO,
    DnGmxSeniorVault = ZERO,
    DnGmxJuniorVault = ZERO,
    DnGmxBatchingManager = ZERO,
    DnGmxWithdrawPeriphery = ZERO,
    DnGmxDepositPeriphery = ZERO,
  } = addresses[network]

  const file = 
`/**
 * This file is auto generated by updateAddresses.ts
 */ 

import { Address } from '@graphprotocol/graph-ts'

class Contracts {
  ClearingHouse: Address;
  clearingHouseLens: Address;
  RageTradeFactory: Address;
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
  DnGmxWithdrawPeriphery: Address;
  DnGmxDepositPeriphery: Address;
}

export let contracts: Contracts = {
  ClearingHouse: Address.fromString("${ClearingHouse}"),
  clearingHouseLens: Address.fromString("${clearingHouseLens}"),
  RageTradeFactory: Address.fromString("${RageTradeFactory}"),
  VPoolWrapper: Address.fromString("${VPoolWrapper}"),
  USDC: Address.fromString("${USDC}"),
  CurveYieldStrategy: Address.fromString("${CurveYieldStrategy}"),
  VaultPeriphery: Address.fromString("${VaultPeriphery}"),
  CurveTriCryptoLpTokenAddress: Address.fromString("${CurveTriCryptoLpTokenAddress}"),
  CurveQuoter: Address.fromString("${CurveQuoter}"),
  GMXYieldStrategy: Address.fromString("${GMXYieldStrategy}"),
  GMXBatchingManager: Address.fromString("${GMXBatchingManager}"),
  GlpStakingManager: Address.fromString("${GlpStakingManager}"),
  sGLP: Address.fromString("${sGLP}"),
  DnGmxSeniorVault: Address.fromString("${DnGmxSeniorVault}"),
  DnGmxJuniorVault: Address.fromString("${DnGmxJuniorVault}"),
  DnGmxBatchingManager: Address.fromString("${DnGmxBatchingManager}"),
  DnGmxWithdrawPeriphery: Address.fromString("${DnGmxWithdrawPeriphery}"),
  DnGmxDepositPeriphery: Address.fromString("${DnGmxDepositPeriphery}"),
 };`;

  await fs.writeFile(tsFilePath, file);

  consola.success('Updated address.ts');
}

export async function updateAddressJSON(
  network: SubgraphNetwork,
  contracts: Partial<Contracts>
) {
  const basePath = process.cwd();
  const filePath = path.resolve(basePath, './src/addresses.json');

  const addresses = fs.readJSONSync(filePath, { encoding: 'utf-8' });
  addresses[network] ??= {}
  
  Object.entries(contracts).forEach(([key, address]) => {
    addresses[network][key] = address;
  });

  await fs.writeJSON(filePath, addresses, { spaces: 2 });

  consola.success('Updated addresses.json');

  updateAddressTS(network);


}
