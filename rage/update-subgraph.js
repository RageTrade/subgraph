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
  const { curveYieldStrategy, vaultPeriphery } = await sdk.getVaultContracts(
    networkInfo.provider
  );
  const { crv3, quoter } = await sdk.getCurveFinanceContracts(
    networkInfo.provider
  );

  // STEP 1: Copy ABIs
  // await copyAbi(rageTradeFactory, 'RageTradeFactory');
  // await copyAbi(clearingHouse, 'ClearingHouse');
  // await copyAbi(clearingHouseLens, 'ClearingHouseLens');
  // await copyAbi(insuranceFund, 'InsuranceFund');
  // await copyAbi(vPoolWrapperLogic, 'VPoolWrapperLogic');
  // await copyAbi(curveYieldStrategy, 'CurveYieldStrategy');
  // await copyAbi(vaultPeriphery, 'VaultPeriphery');
  // await copyAbi(crv3, 'CurveTriCryptoLpToken');
  // await copyAbi(quoter, 'CurveQuoter');

  // STEP 2: Update ClearingHouse and other contract address in subgraph.yaml
  const subgraphYaml = yaml.parse(fs.readFileSync('./subgraph.yaml', 'utf8'));
  updateSubgraphYaml(
    subgraphYaml,
    'ClearingHouse',
    clearingHouse.address,
    startBlockNumber
  );
  updateSubgraphYaml(
    subgraphYaml,
    'RageTradeFactory',
    rageTradeFactory.address,
    startBlockNumber
  );
  updateSubgraphYaml(
    subgraphYaml,
    'CurveYieldStrategy',
    curveYieldStrategy.address,
    startBlockNumber
  );
  updateSubgraphYaml(
    subgraphYaml,
    'VaultPeriphery',
    vaultPeriphery.address,
    startBlockNumber
  );

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

function updateSubgraphYaml(
  subgraphYaml,
  contractName,
  contractAddress,
  startBlockNumber
) {
  const dataSources = subgraphYaml.dataSources.find(
    ({ name }) => name === contractName
  );
  if (!dataSources) {
    throw new Error(
      `There is no ${contractName} data source in the subgraph.yaml`
    );
  }
  dataSources.network = networkInfo.subgraph;
  dataSources.source.startBlock = startBlockNumber;
  dataSources.source.address = contractAddress;
}

async function copyAbi(contract, name) {
  const abi = contract.interface.fragments
    .map(f => JSON.parse(f.format('json')))
    .filter(f => f.type !== 'error');
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
