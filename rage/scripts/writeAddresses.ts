import fs from 'fs-extra';
import consola from 'consola';

export function writeContractAddress({
  clearingHouseAddress,
  clearingHouseLensAddress,
  rageTradeFactoryAddress,
  insuranceFundAddress,
  vPoolWrapperAddress,
  usdcAddress,
  curveYieldStrategyAddress,
  vaultPeripheryAddress,
  curveTriCryptoLpTokenAddress,
  curveQuoterAddress,
  gmxYieldStrategyAddress,
  gmxBatchingManagerAddress,
  glpStakingManagerAddress,
  sGLPAddress,
  dnGmxSeniorVaultAddress,
  dnGmxJuniorVaultAddress,
  dnGmxBatchingManagerAddress,
  dnGmxWithdrawPeripheryAddress,
  dnGmxDepositPeripheryAddress,
}) {
  const file = `import { Address } from '@graphprotocol/graph-ts'

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
  DnGmxWithdrawPeriphery: Address;
  DnGmxDepositPeriphery: Address;
}

export let contracts: Contracts = { 
  ClearingHouse: Address.fromString("${clearingHouseAddress}"),
  clearingHouseLens: Address.fromString("${clearingHouseLensAddress}"),
  RageTradeFactory: Address.fromString("${rageTradeFactoryAddress}"),
  InsuranceFund: Address.fromString("${insuranceFundAddress}"),
  VPoolWrapper: Address.fromString("${vPoolWrapperAddress}"),
  USDC: Address.fromString("${usdcAddress}"),
  CurveYieldStrategy: Address.fromString("${curveYieldStrategyAddress}"),
  VaultPeriphery: Address.fromString("${vaultPeripheryAddress}"),
  CurveTriCryptoLpTokenAddress: Address.fromString("${curveTriCryptoLpTokenAddress}"),
  CurveQuoter: Address.fromString("${curveQuoterAddress}"),
  GMXYieldStrategy: Address.fromString("${gmxYieldStrategyAddress}"),
  GMXBatchingManager: Address.fromString("${gmxBatchingManagerAddress}"),
  GlpStakingManager: Address.fromString("${glpStakingManagerAddress}"),
  sGLP: Address.fromString("${sGLPAddress}"),
  DnGmxSeniorVault: Address.fromString("${dnGmxSeniorVaultAddress}"),
  DnGmxJuniorVault: Address.fromString("${dnGmxJuniorVaultAddress}"),
  DnGmxBatchingManager: Address.fromString("${dnGmxBatchingManagerAddress}"),
  DnGmxWithdrawPeriphery: Address.fromString("${dnGmxWithdrawPeripheryAddress}"),
  DnGmxDepositPeriphery: Address.fromString("${dnGmxDepositPeripheryAddress}"),
 };`;

  fs.writeFile('./src/utils/addresses.ts', file, {
    spaces: 2,
  });

  consola.success('Updated address.ts');
}
