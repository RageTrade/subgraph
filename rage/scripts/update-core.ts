import fs from 'fs-extra';
import yaml from 'yaml';
import sdk from '@ragetrade/sdk';
import { BaseContract, ethers } from 'ethers';
import consola from 'consola';

import { getNetworkInfo } from './getNetworkInfo';
import { getStartBlockNumber } from './getStartBlockNumber';
import { writeContractAddress } from './writeAddresses';

const networkInfo = getNetworkInfo(process.argv[2]);
const startBlock = getStartBlockNumber('core', networkInfo.sdk);

if (!startBlock) {
  throw new Error('Start block of core not found');
}

const {
  rageTradeFactory,
  clearingHouse,
  clearingHouseLens,
  insuranceFund,
  vPoolWrapperLogic,
} = await sdk.core.getContracts(networkInfo.provider);
const { uniswapV3Factory } = await sdk.uniswap.getContracts(networkInfo.provider);

copyAbi(rageTradeFactory, 'RageTradeFactory');
copyAbi(clearingHouse, 'ClearingHouse');
copyAbi(clearingHouseLens, 'ClearingHouseLens');
copyAbi(vPoolWrapperLogic, 'VPoolWrapperLogic');

const configPath = '../src/Subgraphs/Core/subgraph.yaml';
const subgraphYaml = yaml.parse(fs.readFileSync(configPath, 'utf8'));

updateSubgraphYamlDataSources(
  subgraphYaml,
  'ClearingHouse',
  clearingHouse.address,
  startBlock
);
updateSubgraphYamlDataSources(
  subgraphYaml,
  'RageTradeFactory',
  rageTradeFactory.address,
  startBlock
);

updateSubgraphYamlDataSources(
  subgraphYaml,
  'UniswapV3Factory',
  uniswapV3Factory.address,
  startBlock
);
updateSubgraphYamlTemplates(subgraphYaml, 'UniswapV3Pool');
updateSubgraphYamlTemplates(subgraphYaml, 'VPoolWrapperLogic');

fs.writeFile(configPath, yaml.stringify(subgraphYaml, { indent: 2 }));

// STEP 3: Update contract addresses in the .ts codebase
writeContractAddress({
  clearingHouseAddress: clearingHouse.address,
  clearingHouseLensAddress: clearingHouseLens.address,
  rageTradeFactoryAddress: rageTradeFactory.address,
  insuranceFundAddress: insuranceFund.address,
  vPoolWrapperAddress: vPoolWrapperLogic.address,
  usdcAddress: usdc.address,
  curveYieldStrategyAddress: curveYieldStrategy.address,
  vaultPeripheryAddress: vaultPeriphery.address,
  curveTriCryptoLpTokenAddress: crv3.address,
  curveQuoterAddress: quoter.address,
  gmxYieldStrategyAddress: gmxYieldStrategy?.address ?? ethers.constants.AddressZero,
  gmxBatchingManagerAddress: gmxBatchingManager?.address ?? ethers.constants.AddressZero,
  glpStakingManagerAddress: glpStakingManager?.address ?? ethers.constants.AddressZero,
  sGLPAddress: sGLP.address,
  dnGmxSeniorVaultAddress: dnGmxSeniorVault?.address ?? ethers.constants.AddressZero,
  dnGmxJuniorVaultAddress: dnGmxJuniorVault?.address ?? ethers.constants.AddressZero,
  dnGmxBatchingManagerAddress:
    dnGmxBatchingManager?.address ?? ethers.constants.AddressZero,
  dnGmxWithdrawPeripheryAddress:
    withdrawPeriphery?.address ?? ethers.constants.AddressZero,
  dnGmxDepositPeripheryAddress:
    dnDmxDepositPeriphery?.address ?? ethers.constants.AddressZero,
});

consola.success('Updated subgraph.yaml');

function updateSubgraphYamlDataSources(
  subgraphYaml,
  contractName,
  contractAddress,
  startBlockNumber
) {
  const dataSource = subgraphYaml.dataSources.find(({ name }) => name === contractName);
  if (!dataSource) {
    throw new Error(`There is no ${contractName} data source in the subgraph.yaml`);
  }
  dataSource.network = networkInfo.subgraph;
  dataSource.source.startBlock = startBlockNumber;
  dataSource.source.address = contractAddress;
}
function updateSubgraphYamlTemplates(subgraphYaml, contractName) {
  const template = subgraphYaml.templates.find(({ name }) => name === contractName);
  if (!template) {
    throw new Error(`There is no ${contractName} template in the subgraph.yaml`);
  }
  template.network = networkInfo.subgraph;
}

async function copyAbi(contract: BaseContract, name: string) {
  if (!contract) {
    consola.error(`cannot copyAbi: contract ${name} is undefined`);
    return;
  }

  const abi = contract.interface.fragments
    .map(f => JSON.parse(f.format('json')))
    .filter(f => f.type !== 'error');

  abi.forEach(f => {
    if (f.name === undefined) f.name = '';

    [...f.inputs, ...(f.outputs ?? [])].forEach(i => {
      if (i.name === undefined) i.name = '';
    });

    return f;
  });

  await fs.writeJSON(`./abis/${name}.json`, abi, { spaces: 2 });

  consola.success(`Updated ${name}.json`);
}
