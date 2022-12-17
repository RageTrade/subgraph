import sdk from '@ragetrade/sdk';
import path from 'path';

import { getNetworkInfo } from './getNetworkInfo';
import { getStartBlockNumber } from './getStartBlockNumber';
import { updateAddressJSON } from './updateAddresses';
import { updateABIs } from './updateABI';
import { updateSubgraphYaml } from './updateSubgraphYaml';

const basePath = process.cwd();

const networkInfo = getNetworkInfo(process.argv[2]);
const startBlock = getStartBlockNumber('core', networkInfo.sdk);

const configPath = path.resolve(basePath, './src/Subgraphs/Core/subgraph.yaml');

if (!startBlock) {
  throw new Error('Start block of core not found');
}

const {
  rageTradeFactory,
  clearingHouse,
  clearingHouseLens,
  vPoolWrapperLogic,
} = sdk.core.getContractsSync(networkInfo.sdk);
const { uniswapV3Factory } = sdk.uniswap.getContractsSync(networkInfo.sdk);

updateABIs([
  ['RageTradeFactory', rageTradeFactory],
  ['ClearingHouse', clearingHouse],
  ['ClearingHouseLens', clearingHouseLens],
  ['VPoolWrapperLogic', vPoolWrapperLogic],
]);

updateSubgraphYaml(
  configPath,
  networkInfo.subgraph,
  startBlock,
  [
    ['ClearingHouse', clearingHouse.address],
    ['RageTradeFactory', rageTradeFactory.address],
    ['UniswapV3Factory', uniswapV3Factory.address],
  ],
  ['UniswapV3Pool', 'VPoolWrapperLogic']
);

updateAddressJSON(networkInfo.subgraph, {
  ClearingHouse: clearingHouse.address,
  clearingHouseLens: clearingHouseLens.address,
  RageTradeFactory: rageTradeFactory.address,
  VPoolWrapper: vPoolWrapperLogic.address,
});
