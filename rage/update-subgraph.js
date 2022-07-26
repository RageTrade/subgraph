const fs = require('fs-extra');
const yaml = require('yaml');
const sdk = require('@ragetrade/sdk');
const { ethers } = require('ethers');

class MockProvider extends ethers.providers.Provider {
  chainId;
  constructor(chainId) {
    super();
    this.chainId = chainId;
  }

  async getNetwork() {
    return { chainId: this.chainId };
  }
}

let networkInfo;
const networkInput = process.argv[2];
switch (networkInput) {
  case 'arbmain':
    networkInfo = {
      subgraph: 'arbitrum-one',
      sdk: 'arbmain',
      provider: new MockProvider(42161),
    };
    break;
  case 'arbtest':
    networkInfo = {
      subgraph: 'arbitrum-rinkeby',
      sdk: 'arbtest',
      provider: new MockProvider(421611),
    };
    break;
  default:
    throw new Error(
      `update-subgraph.js: network "${networkInput}" not supported. Please pass arbmain or arbtest.`
    );
}

async function main() {
  // just for getting startBlockNumber
  const factoryDeployment = await sdk.getDeployment(
    'core',
    networkInfo.sdk,
    'RageTradeFactory'
  );
  const startBlockNumber = factoryDeployment.receipt.blockNumber;

  const {
    rageTradeFactory,
    clearingHouse,
    clearingHouseLens,
    insuranceFund,
    vPoolWrapperLogic,
  } = await sdk.getContracts(networkInfo.provider);
  const { uniswapV3Factory } = await sdk.getUniswapContracts(
    networkInfo.provider
  );
  const { curveYieldStrategy, vaultPeriphery } = await sdk.getVaultContracts(
    networkInfo.provider
  );
  const { gmxYieldStrategy } = await sdk.getGMXVaultContracts(
    networkInfo.provider
  );
  const { crv3, quoter } = await sdk.getCurveFinanceContracts(
    networkInfo.provider
  );

  // STEP 1: Copy ABIs
  await copyAbi(rageTradeFactory, 'RageTradeFactory');
  await copyAbi(clearingHouse, 'ClearingHouse');
  await copyAbi(clearingHouseLens, 'ClearingHouseLens');
  await copyAbi(insuranceFund, 'InsuranceFund');
  await copyAbi(vPoolWrapperLogic, 'VPoolWrapperLogic');
  await copyAbi(curveYieldStrategy, 'CurveYieldStrategy');
  await copyAbi(vaultPeriphery, 'VaultPeriphery');
  await copyAbi(crv3, 'CurveTriCryptoLpToken');
  await copyAbi(quoter, 'CurveQuoter');
  await copyAbi(gmxYieldStrategy, 'GMXYieldStrategy');

  // STEP 2: Update ClearingHouse and other contract address in subgraph.yaml
  const subgraphYaml = yaml.parse(fs.readFileSync('./subgraph.yaml', 'utf8'));
  updateSubgraphYamlDataSources(
    subgraphYaml,
    'ClearingHouse',
    clearingHouse.address,
    startBlockNumber
  );
  updateSubgraphYamlDataSources(
    subgraphYaml,
    'RageTradeFactory',
    rageTradeFactory.address,
    startBlockNumber
  );
  updateSubgraphYamlDataSources(
    subgraphYaml,
    'CurveYieldStrategy',
    curveYieldStrategy.address,
    startBlockNumber
  );
  updateSubgraphYamlDataSources(
    subgraphYaml,
    'VaultPeriphery',
    vaultPeriphery.address,
    startBlockNumber
  );
  updateSubgraphYamlDataSources(
    subgraphYaml,
    'GMXYieldStrategy',
    gmxYieldStrategy.address,
    startBlockNumber
  );
  updateSubgraphYamlDataSources(
    subgraphYaml,
    'UniswapV3Factory',
    uniswapV3Factory.address,
    startBlockNumber
  );
  updateSubgraphYamlTemplates(subgraphYaml, 'UniswapV3Pool');
  updateSubgraphYamlTemplates(subgraphYaml, 'VPoolWrapperLogic');

  // write subgraphYaml
  fs.writeFile('./subgraph.yaml', yaml.stringify(subgraphYaml, { indent: 2 }));

  // STEP 3: Update contract addresses in the .ts codebase
  writeContractAddress({
    clearingHouseAddress: clearingHouse.address,
    clearingHouseLensAddress: clearingHouseLens.address,
    rageTradeFactoryAddress: rageTradeFactory.address,
    insuranceFundAddress: insuranceFund.address,
    vPoolWrapperAddress: vPoolWrapperLogic.address,
    curveYearStrategyAddress: curveYieldStrategy.address,
    vaultPeripheryAddress: vaultPeriphery.address,
    curveTriCryptoLpTokenAddress: crv3.address,
    curveQuoterAddress: quoter.address,
  });

  console.log('Updated subgraph.yaml');
}

function updateSubgraphYamlDataSources(
  subgraphYaml,
  contractName,
  contractAddress,
  startBlockNumber
) {
  const dataSource = subgraphYaml.dataSources.find(
    ({ name }) => name === contractName
  );
  if (!dataSource) {
    throw new Error(
      `There is no ${contractName} data source in the subgraph.yaml`
    );
  }
  dataSource.network = networkInfo.subgraph;
  dataSource.source.startBlock = startBlockNumber;
  dataSource.source.address = contractAddress;
}
function updateSubgraphYamlTemplates(subgraphYaml, contractName) {
  const template = subgraphYaml.templates.find(
    ({ name }) => name === contractName
  );
  if (!template) {
    throw new Error(
      `There is no ${contractName} template in the subgraph.yaml`
    );
  }
  template.network = networkInfo.subgraph;
}

async function copyAbi(contract, name) {
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

  console.log(`Updated ${name}.json`);
  return { abi };
}

function writeContractAddress({
  clearingHouseAddress,
  clearingHouseLensAddress,
  rageTradeFactoryAddress,
  insuranceFundAddress,
  vPoolWrapperAddress,
  curveYearStrategyAddress,
  vaultPeripheryAddress,
  curveTriCryptoLpTokenAddress,
  curveQuoterAddress,
}) {
  const file = `import { Address } from '@graphprotocol/graph-ts'

class Contracts {
  ClearingHouse: Address;
  clearingHouseLens: Address;
  RageTradeFactory: Address;
  InsuranceFund: Address;
  VPoolWrapper: Address;
  CurveYieldStrategy: Address;
  VaultPeriphery: Address;
  CurveTriCryptoLpTokenAddress: Address;
  CurveQuoter: Address;
}

export let contracts: Contracts = { 
  ClearingHouse: Address.fromString("${clearingHouseAddress}"),
  clearingHouseLens: Address.fromString("${clearingHouseLensAddress}"),
  RageTradeFactory: Address.fromString("${rageTradeFactoryAddress}"),
  InsuranceFund: Address.fromString("${insuranceFundAddress}"),
  VPoolWrapper: Address.fromString("${vPoolWrapperAddress}"),
  CurveYieldStrategy: Address.fromString("${curveYearStrategyAddress}"),
  VaultPeriphery: Address.fromString("${vaultPeripheryAddress}"),
  CurveTriCryptoLpTokenAddress: Address.fromString("${curveTriCryptoLpTokenAddress}"),
  CurveQuoter: Address.fromString("${curveQuoterAddress}") 
 };`;

  fs.writeFile('./src/utils/addresses.ts', file, {
    spaces: 2,
  });

  console.log('updated contract-address.ts');
}

main().catch(console.error);
