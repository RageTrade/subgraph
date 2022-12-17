import sdk from '@ragetrade/sdk';
import path from 'path';

import { getNetworkInfo } from './getNetworkInfo';
import { getStartBlockNumber } from './getStartBlockNumber';
import { updateAddressJSON } from './updateAddresses';
import { updateABIs } from './updateABI';
import { updateSubgraphYaml } from './updateSubgraphYaml';

const basePath = process.cwd();

const networkInfo = getNetworkInfo(process.argv[2]);
const startBlock = getStartBlockNumber('gmx-vault', networkInfo.sdk);

const configPath = path.resolve(basePath, './src/Subgraphs/GmxVault/subgraph.yaml');

if (!startBlock) {
  throw new Error('Start block of GmxVault not found');
}

const {
  gmxYieldStrategy,
  gmxBatchingManager,
  glpStakingManager,
} = sdk.gmxVault.getContractsSync(networkInfo.sdk);
const { sGLP, usdc } = sdk.tokens.getContractsSync(networkInfo.sdk);

updateABIs([
  ['GMXYieldStrategy', gmxYieldStrategy],
  ['GMXBatchingManager', gmxBatchingManager],
  ['sGLP', sGLP],
]);

updateSubgraphYaml(configPath, networkInfo.subgraph, startBlock, [
  ['GMXYieldStrategy', gmxYieldStrategy.address],
  ['GMXBatchingManager', gmxBatchingManager.address],
]);

updateAddressJSON(networkInfo.subgraph, {
  GMXYieldStrategy: gmxYieldStrategy.address,
  GMXBatchingManager: gmxBatchingManager.address,
  GlpStakingManager: glpStakingManager.address,
  sGLP: sGLP.address,
  USDC: usdc.address,
});
