import sdk from '@ragetrade/sdk';
import path from 'path';

import { getNetworkInfo } from './getNetworkInfo';
import { getStartBlockNumber } from './getStartBlockNumber';
import { updateAddressJSON } from './updateAddresses';
import { updateABIs } from './updateABI';
import { updateSubgraphYaml } from './updateSubgraphYaml';

const basePath = process.cwd();

const networkInfo = getNetworkInfo(process.argv[2]);
const startBlock = getStartBlockNumber('tri-crypto-vault', networkInfo.sdk);

const configPath = path.resolve(basePath, './src/Subgraphs/TriCryptoVault/subgraph.yaml');

if (!startBlock) {
  throw new Error('Start block of TriCryptoVault not found');
}

const { curveYieldStrategy, vaultPeriphery } = sdk.tricryptoVault.getContractsSync(
  networkInfo.sdk
);
const { crv3, quoter } = sdk.curve.getContractsSync(networkInfo.sdk);

updateABIs([
  ['CurveYieldStrategy', curveYieldStrategy],
  ['VaultPeriphery', vaultPeriphery],
  ['CurveTriCryptoLpToken', crv3],
  ['CurveQuoter', quoter],
]);

updateSubgraphYaml(configPath, networkInfo.subgraph, startBlock, [
  ['CurveYieldStrategy', curveYieldStrategy.address],
  ['VaultPeriphery', vaultPeriphery.address],
]);

updateAddressJSON(networkInfo.subgraph, {
  CurveYieldStrategy: curveYieldStrategy.address,
  VaultPeriphery: vaultPeriphery.address,
  CurveQuoter: quoter.address,
  CurveTriCryptoLpTokenAddress: crv3.address,
});
