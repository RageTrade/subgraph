import sdk from '@ragetrade/sdk';
import path from 'path';

import { getNetworkInfo } from './getNetworkInfo';
import { getStartBlockNumber } from './getStartBlockNumber';
import { updateAddressJSON } from './updateAddresses';
import { updateABIs } from './updateABI';
import { updateSubgraphYaml } from './updateSubgraphYaml';

const basePath = process.cwd();

const networkInfo = getNetworkInfo(process.argv[2]);
const startBlock = getStartBlockNumber('dn-gmx-vaults', networkInfo.sdk);

const configPath = path.resolve(basePath, './src/Subgraphs/DnGmxVault/subgraph.yaml');

if (!startBlock) {
  throw new Error('Start block of DnGmxVault not found');
}

const {
  dnGmxSeniorVault,
  dnGmxJuniorVault,
  dnGmxBatchingManager,
  withdrawPeriphery,
  depositPeriphery,
  dnGmxBatchingManagerGlp,
} = sdk.deltaNeutralGmxVaults.getContractsSync(networkInfo.sdk);

const { sGLP, usdc } = sdk.tokens.getContractsSync(networkInfo.sdk);

updateABIs([
  ['DnGmxSeniorVault', dnGmxSeniorVault],
  ['DnGmxJuniorVault', dnGmxJuniorVault],
  ['DnGmxBatchingManager', dnGmxBatchingManager],
  ['DnGmxWithdrawPeriphery', withdrawPeriphery],
  ['DnGmxDepositPeriphery', depositPeriphery],
  ['DnGmxBatchingManagerGLP', dnGmxBatchingManagerGlp],
]);

updateSubgraphYaml(configPath, networkInfo.subgraph, startBlock, [
  ['DnGmxSeniorVault', dnGmxSeniorVault.address],
  ['DnGmxJuniorVault', dnGmxJuniorVault.address],
  ['DnGmxBatchingManager', dnGmxBatchingManager.address],
  ['DnGmxWithdrawPeriphery', withdrawPeriphery.address],
  ['DnGmxDepositPeriphery', depositPeriphery.address],
  ['DnGmxBatchingManagerGLP', dnGmxBatchingManagerGlp.address],
]);

updateAddressJSON(networkInfo.subgraph, {
  DnGmxSeniorVault: dnGmxSeniorVault.address,
  DnGmxJuniorVault: dnGmxJuniorVault.address,
  DnGmxBatchingManager: dnGmxBatchingManager.address,
  DnGmxWithdrawPeriphery: withdrawPeriphery.address,
  DnGmxDepositPeriphery: depositPeriphery.address,
  DnGmxBatchingManagerGLP: dnGmxBatchingManagerGlp.address,
  sGLP: sGLP.address,
  USDC: usdc.address,
});
